const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const multer = require("multer");
const { GridFSBucket } = require("mongodb");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const cors = require("cors");
const crypto = require("crypto");
const { Readable } = require("stream");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const mongoURI = "mongodb://localhost:27017/PR2_Website";

mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Connection Error:", err));

const conn = mongoose.connection;
let bucket;

conn.once("open", () => {
  console.log("GridFS initialized");

  // GridFS bucket for file storage
  bucket = new GridFSBucket(conn.db, { bucketName: "forms" });
});

// Multer Storage (MemoryStorage for GridFS)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["application/pdf", "image/jpeg", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF, DOCX, and JPEG allowed."), false);
    }
  }
});

// Upload File to GridFS
app.post("/upload/forms", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  try {
    // Create a readable stream from buffer
    const readableStream = new Readable();
    readableStream.push(req.file.buffer);
    readableStream.push(null);

    // Generate unique filename
    const filename = `${crypto.randomBytes(16).toString("hex")}_${req.file.originalname}`;

    // Upload to GridFS
    const uploadStream = bucket.openUploadStream(filename, {
      metadata: {
        formType: req.body.formType,
        contentType: req.file.mimetype,
      },
    });

    readableStream.pipe(uploadStream);

    uploadStream.on("finish", () => {
      res.json({ message: "File uploaded successfully!", fileId: uploadStream.id });
    });

    uploadStream.on("error", (err) => {
      console.error("Error saving file:", err);
      res.status(500).json({ error: "Server error while saving file." });
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get List of Uploaded Files
app.get("/files", async (req, res) => {
  try {
    const files = await conn.db.collection("forms.files").find().toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ message: "No files found" });
    }
    res.json(files);
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).send("Error fetching files");
  }
});

// Download File from GridFS
app.get("/files/:filename", async (req, res) => {
  try {
    const file = await conn.db.collection("forms.files").findOne({ filename: req.params.filename });
    if (!file) {
      return res.status(404).send("File not found");
    }

    res.setHeader("Content-Type", file.metadata.contentType);
    const readStream = bucket.openDownloadStreamByName(file.filename);
    readStream.pipe(res);
  } catch (error) {
    console.error("❌ Error fetching file:", error);
    res.status(500).send("Error fetching file");
  }
});

// Student Model (Ensure you have this defined)
const Student = require("./models/student");
const Request = require("./models/request");
// Admin Registers a New Student
app.post("/admin/register-student", async (req, res) => {
    const { studentNumber, password } = req.body;

    try {
        const existingStudent = await Student.findOne({ studentNumber });
        if (existingStudent) {
            return res.json({ success: false, message: "Student already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newStudent = new Student({ studentNumber, password: hashedPassword });
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

        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid password" });
        }

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

// ejs setup
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "../public")));

const studentRouter = require("./routes/students");
app.use("/students", studentRouter);

const adminRouter = require("./routes/admin");
app.use("/admin", adminRouter);

// Serve main page
app.get("/", (req, res) => {
  const portNum = process.env.PORT || 3000;
  const localIP = "192.168.76.73"; // change to your actual local IP
  res.render("index", { portNum, localIP });
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
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
