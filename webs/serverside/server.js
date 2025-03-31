import express from "express";
import path from "path";
import mongoose from "mongoose";
import multer from "multer";
import { GridFSBucket } from "mongodb";
import bcrypt from "bcryptjs";
import cors from "cors";
import crypto from "crypto";
import os from "os"
import MongoStore from "connect-mongo";
import session from "express-session";
import { Readable } from "stream";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve("settings/.env") });
import { fileURLToPath } from 'url';
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();

const requiredEnvVars = ["MONGO_URI", "PORT","SESSION_SECRET"];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
const PORT = process.env.PORT || 3000

console.log(__dirname); // Should show the correct directory
console.log(path.join(__dirname, 'views')); // Should show where Express is trying to find views
console.log("Views directory set to:", path.join(__dirname, '../../views'));


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import studentRouter from "./routes/students.js";
import adminRouter from "./routes/admin.js";

app.use(session({
  secret: process.env.SESSION_SECRET,  // ✅ Use secure key from .env
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,  // ✅ Ensure you're using the correct Atlas URI
      dbName: "PR2_Website",
      collectionName: "sessions",  // Optional: Store session data in a separate collection
      ttl: 14 * 24 * 60 * 60 // Expiry time (14 days)
  })
}));

app.get("/", (req, res) => {
    console.log(os.hostname());

    const localIP = os.hostname();
    res.render("index", { PORT, localIP });
});

// MongoDB Connection
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/PR2_Website";

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000, 
  socketTimeoutMS: 120000,
  dbName: "WEBSITE"
})
  .then(() => console.log("MongoDB Connected to Atlas"))
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
    console.error("Error fetching file:", error);
    res.status(500).send("Error fetching file");
  }
});

// Student Model (Ensure you have this defined)
import Student from "./models/student.js";
import Request from "./models/request.js";
import User from "./models/user.js";
User();
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

// Login
app.post("/login", async (req, res) => {
  console.log("Received login request:", req.body); // Debugging line

  const { studentNumber, password } = req.body;
  console.log("Type of studentNumber:", typeof studentNumber);

  try {
      // Log the search query
      console.log("Searching for user with studentNumber:", studentNumber);

      const user = await User.findOne({ studentNumber });

      if (!user) {
          console.log("User not found in database");
          return res.status(401).json({ success: false, message: "Invalid credentials" });
      }

      console.log("User found:", user);

      // Store studentNumber in session
      req.session.studentNumber = user.studentNumber;
      req.session.role = user.role;  // Store role if needed

      if (!password || !(await bcrypt.compare(password, user.password))) {
          console.log("Incorrect password");
          return res.status(401).json({ success: false, message: "Invalid credentials" });
      }

      console.log("Login successful!");
      res.json({ success: true, role: user.role });

  } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({ success: false, message: "Server error" });
  }
});


// Logout Route
app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
});



// Define __dirname in ES module
console.log("Views directory set to:", path.join(__dirname, "../views"));

// ejs setup
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "../public")));



app.use("/students", studentRouter);
app.use("/admin", adminRouter);
// Serve main page


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
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
