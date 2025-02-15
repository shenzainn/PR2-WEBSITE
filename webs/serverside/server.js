const express = require('express');
const path = require('path');
const mongoose = require("mongoose");
const multer = require("multer");
const { GridFSBucket } = require("mongodb");
const cors = require("cors");
require("dotenv").config();

const app = express();

// MongoDB Connection
const mongoURI = "mongodb://localhost:27017/mydatabase"; 
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

const conn = mongoose.connection;
let gfs, bucket;

conn.once("open", () => {
    console.log("MongoDB connected.");

    // Initialize GridFS Stream
    gfs = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: "uploads" });

    // GridFSBucket for writing
    bucket = new GridFSBucket(conn.db, { bucketName: "uploads" });
});

// Multer storage (memory storage before writing to GridFS)
const storage = multer.memoryStorage();
const upload = multer({ storage });

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
    if (!gfs) return res.status(500).send("GridFS not initialized.");
    
    const files = await conn.db.collection("uploads.files").find().toArray();
    if (!files || files.length === 0) return res.status(404).json({ message: "No files found" });

    res.json(files);
});

// Download File from GridFS
app.get("/files/:filename", async (req, res) => {
    if (!gfs) return res.status(500).send("GridFS not initialized.");

    const file = await conn.db.collection("uploads.files").findOne({ filename: req.params.filename });

    if (!file) return res.status(404).send("File not found");

    const readStream = bucket.openDownloadStreamByName(file.filename);
    readStream.pipe(res);
});

// ejs setup
app.use(express.json());
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, '../public')));

const studentRouter = require('./routes/students');
app.use('/students', studentRouter);

const adminRouter = require('./routes/admin');
app.use('/admin', adminRouter);

// Port setup
app.get('/', (req, res) => {
    const portNum = process.env.PORT || 3000;
    const localIP = '192.168.74.73';
    res.render('index', { portNum, localIP });
});

const port = process.env.PORT || 3000;
app.listen(port, () => { 
    console.log(`Server is running on port ${port}`);
});

// Serve Student Tracking Page
app.get("/student-tracking", async (req, res) => {
    const { studentName } = req.query;
    if (!studentName) return res.render("StudentTracking");

    const requestData = await Request.findOne({ studentName });
    res.render("StudentTracking", { requestData });
});

// Serve Admin Tracking Page
app.get("/admin-tracking", async (req, res) => {
    const requests = await Request.find();
    res.render("AdminTracking", { requests });
});

// Approve Request & Upload File
app.post("/approve-request/:id", upload.single("file"), async (req, res) => {
    if (!req.file) return res.status(400).send("No file uploaded.");
    
    const fileUrl = `/files/${req.file.filename}`;
    await Request.findByIdAndUpdate(req.params.id, { requestStatus: "Approved", fileUrl });
    res.redirect("/admin-tracking");
});

// Reject Request
app.post("/reject-request/:id", async (req, res) => {
    await Request.findByIdAndUpdate(req.params.id, { requestStatus: "Rejected" });
    res.redirect("/admin-tracking");
});
