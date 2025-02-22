const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const multer = require("multer");
const { GridFSBucket } = require("mongodb");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Session Middleware
app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: true,
}));

// MongoDB Connection
const mongoURI = "mongodb://localhost:27017/mydatabase";
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const conn = mongoose.connection;
let gfs, bucket;

conn.once("open", () => {
    console.log("MongoDB connected.");

    // Initialize GridFS Stream
    gfs = new GridFSBucket(conn.db, { bucketName: "uploads" });

    // GridFSBucket for writing
    bucket = new GridFSBucket(conn.db, { bucketName: "uploads" });
});

// Multer storage (memory storage before writing to GridFS)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Student Schema
const studentSchema = new mongoose.Schema({
    studentNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const Student = mongoose.model("Student", studentSchema);

// Admin Registers a New Student
app.post("/admin/register-student", async (req, res) => {
    const { studentNumber, password } = req.body;

    try {
        // Check if student already exists
        const existingStudent = await Student.findOne({ studentNumber });
        if (existingStudent) {
            return res.json({ success: false, message: "Student already registered" });
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create New Student
        const newStudent = new Student({
            studentNumber,
            password: hashedPassword,
        });

        await newStudent.save();

        res.json({ success: true, message: "Student registered successfully!" });
    } catch (error) {
        console.error("Error registering student:", error);
        res.json({ success: false, message: "Server error" });
    }
});

// Student Login
app.post("/login", async (req, res) => {
    const { studentNumber, password } = req.body;

    try {
        const student = await Student.findOne({ studentNumber });

        if (!student) {
            return res.json({ success: false, message: "Student not found" });
        }

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, student.password);

        if (!isMatch) {
            return res.json({ success: false, message: "Invalid password" });
        }

        // Store session
        req.session.student = student;

        res.json({ success: true, redirect: "/students" });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Server error" });
    }
});

// Logout Route
app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

// Serve Student Registration Page for Admin
app.get("/admin/register", (req, res) => {
    res.render("AdminRegister");
});

// Upload Endpoint
app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).send("No file uploaded.");

    // Upload to GridFS
    const uploadStream = bucket.openUploadStream(req.file.originalname);
    uploadStream.end(req.file.buffer);

    uploadStream.on("finish", () => {
        res.json({ message: "File uploaded!", filename: req.file.originalname });
    });
});

// Get All Files
app.get("/files", async (req, res) => {
    try {
        const files = await conn.db.collection("uploads.files").find().toArray();
        if (!files || files.length === 0) return res.status(404).json({ message: "No files found" });
        res.json(files);
    } catch (error) {
        res.status(500).send("Error fetching files");
    }
});

// Download File from GridFS
app.get("/files/:filename", async (req, res) => {
    try {
        const file = await conn.db.collection("uploads.files").findOne({ filename: req.params.filename });
        if (!file) return res.status(404).send("File not found");

        const readStream = bucket.openDownloadStreamByName(file.filename);
        readStream.pipe(res);
    } catch (error) {
        res.status(500).send("Error fetching file");
    }
});

// ejs setup
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "../public")));

const studentRouter = require("./routes/students");
app.use("/students", studentRouter);

const adminRouter = require("./routes/admin");
app.use("/admin", adminRouter);

// Port setup
app.get("/", (req, res) => {
    const portNum = process.env.PORT || 3000;
    const localIP = "192.168.74.73"; // change to localIP on your pc
    res.render("index", { portNum, localIP });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// Serve Admin Tracking Page
app.get("/admin/track", async (req, res) => {
    try {
        const requests = await Request.find();
        res.render("AdminTracking", { requests });
    } catch (error) {
        console.error("Error fetching requests:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Approve Request & Upload File
app.post("/approve-request/:id", upload.single("file"), async (req, res) => {
    if (!req.file) return res.status(400).send("No file uploaded.");
    
    const fileUrl = `/files/${req.file.originalname}`;
    await Request.findByIdAndUpdate(req.params.id, { requestStatus: "Approved", fileUrl });
    res.redirect("/admin/track");
});

// Reject Request
app.post("/reject-request/:id", async (req, res) => {
    await Request.findByIdAndUpdate(req.params.id, { requestStatus: "Rejected" });
    res.redirect("/admin/track");
});

const Student = require("/models/Student");
