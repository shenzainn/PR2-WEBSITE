const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const multer = require("multer");
const { GridFSBucket } = require("mongodb");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/PR2_Website";
mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB connected."))
  .catch((err) => console.error("DB Connection Error:", err));

const conn = mongoose.connection;
let bucket;

conn.once("open", () => {
  console.log("MongoDB upload connection open.");
  bucket = new GridFSBucket(conn.db, { bucketName: "uploads" }); // Stores files in "uploads" bucket
});

// Define Mongoose Schema
const fileSchema = new mongoose.Schema({
  filename: String,
  formType: String,
  uploadDate: { type: Date, default: Date.now },
});

const FileModel = mongoose.model("Form", fileSchema, "forms"); // Saves metadata in "forms" collection

// Multer storage setup (use memory storage for GridFS)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload endpoint for forms
app.post("/upload/forms", upload.single("file"), async (req, res) => {
  console.log("Received file:", req.file);
  console.log("Form Type:", req.body.formType);

  if (!req.file) return res.status(400).json({ message: "No file uploaded." });

  const { formType } = req.body;
  if (!["137", "138"].includes(formType)) {
    return res.status(400).json({ message: "Invalid form type. Must be '137' or '138'." });
  }

  try {
    const uploadStream = bucket.openUploadStream(req.file.originalname);
    
    uploadStream.end(req.file.buffer);

    uploadStream.on("finish", async () => {
      console.log("File uploaded to GridFS. Saving metadata...");

      const newFile = new FileModel({
        filename: req.file.originalname,
        formType: formType,
        uploadDate: new Date(),
      });

      await newFile.save(); // Save metadata to "forms" collection

      console.log("File metadata saved:", newFile);
      res.json({ message: "File uploaded successfully!", file: newFile });
    });

    uploadStream.on("error", (error) => {
      console.error("GridFS Upload Error:", error);
      res.status(500).json({ message: "Error uploading file to GridFS" });
    });

  } catch (error) {
    console.error("Error processing upload:", error);
    res.status(500).json({ message: "Error uploading file" });
  }
});

// Get all uploaded files metadata
app.get("/files", async (req, res) => {
  try {
    const files = await FileModel.find(); // Fetch from "forms" collection
    if (!files.length) return res.status(404).json({ message: "No files found" });
    res.json(files);
  } catch (error) {
    res.status(500).send("Error fetching files");
  }
});

// Download file from GridFS
app.get("/files/:filename", async (req, res) => {
  try {
    const file = await conn.db.collection("uploads.files").findOne({ filename: req.params.filename });
    if (!file) return res.status(404).send("File not found");

    res.set("Content-Disposition", `attachment; filename=${file.filename}`);
    const readStream = bucket.openDownloadStreamByName(file.filename);
    readStream.pipe(res);
  } catch (error) {
    res.status(500).send("Error fetching file");
  }
});

// EJS setup
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
  const localIP = "192.168.1.13"; // Change to your local IP if needed
  res.render("index", { portNum, localIP });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
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
