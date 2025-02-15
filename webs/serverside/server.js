
const express = require('express');
const path = require('path');
const app = express();
const mongoose = require("mongoose");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const cors = require("cors");
require("dotenv").config();

// MongoDB Connection
const mongoURI = "mongodb://localhost:27017/mydatabase"; // Change as needed
const conn = mongoose.createConnection(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

// Init gfs
let gfs;
conn.once("open", () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection("uploads");
});

// Storage Engine
const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
        return {
            filename: file.originalname,
            bucketName: "uploads"
        };
    }
});

const upload = multer({ storage });

// Upload Endpoint
app.post("/upload", upload.single("file"), (req, res) => {
    res.json({ file: req.file });
});

// Get Files Endpoint
app.get("/files", async (req, res) => {
    gfs.files.find().toArray((err, files) => {
        if (!files || files.length === 0) {
            return res.status(404).json({ message: "No files found" });
        }
        res.json(files);
    });
});

// ejs setup
app.use(express.json());
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs')

app.use(express.static(path.join(__dirname, '../public')));

const studentRouter = require('./routes/students')
app.use('/students', studentRouter);

const adminRouter = require('./routes/admin')
app.use('/admin', adminRouter);

//port setup
app.get('/', (req, res) => {
    const portNum = process.env.port || 3000;
    const localIP = '192.168.74.73';
    res.render('index', {portNum, localIP });
})

const port = process.env.port || 3000;
app.listen(port, ( ) => { 
    console.log(`Server is running on port ${port}`);
});


