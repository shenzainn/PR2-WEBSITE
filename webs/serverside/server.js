const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const multer = require('multer');
const { GridFSBucket } = require('mongodb');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables

const app = express();

// Database Connection (Use environment variables for security)
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/mydatabase';
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected.'))
  .catch(err => console.error('MongoDB connection error:', err));

const conn = mongoose.connection;
let gfs, bucket;

conn.once('open', () => {
  console.log('MongoDB connected.');

  // Initialize GridFS Bucket
  gfs = new GridFSBucket(conn.db, { bucketName: 'uploads' });
  bucket = gfs; // Use the same bucket instance for both upload and download
});

// Multer Storage (Memory storage for efficiency)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload Endpoint (Simplified for clarity)
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');

  try {
    const uploadStream = bucket.openUploadStream(req.file.originalname);
    uploadStream.end(req.file.buffer);

    await new Promise((resolve, reject) => {
      uploadStream.on('finish', resolve);
      uploadStream.on('error', reject);
    });

    res.json({ message: 'File uploaded!', filename: req.file.originalname });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send('Error uploading file');
  }
});

// Get All Files Endpoint (Optimized for performance)
app.get('/files', async (req, res) => {
  try {
    const files = await gfs.find().toArray(); // Use GridFSBucket for file listing
    if (files.length === 0) return res.status(404).json({ message: 'No files found' });
    res.json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).send('Error fetching files');
  }
});

// Download File Endpoint (Simplified for clarity)
app.get('/files/:filename', async (req, res) => {
  try {
    const file = await gfs.find({ filename: req.params.filename }).toArray();
    if (file.length === 0) return res.status(404).send('File not found');

    const readStream = bucket.openDownloadStreamByName(file[0].filename);
    readStream.pipe(res);
  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).send('Error fetching file');
  }
});

// EJS Setup (Simplified and improved)
app.use(express.json());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Route Handlers (Example: students and admin)
const studentRouter = require('./routes/students');
app.use('/students', studentRouter);

const adminRouter = require('./routes/admin');
app.use('/admin', adminRouter);

// Root Route (Simplified and improved)
app.get('/', (req, res) => {
  const portNum = process.env.PORT || 3000;
  res.render('index', { portNum });
});

// Port Setup (Simplified and improved)
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Admin Tracking Page (Improved for clarity)
app.get('/admin/track', async (req, res) => {
  try {
    const requests = await Request.find(); // Assuming you have a 'Request' model
    res.render('AdminTracking', { requests });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Approve Request & Upload File (Improved for clarity)
app.post('/approve-request/:id', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');

  try {
    const fileUrl = `/files/${req.file.originalname}`;
    await Request.findByIdAndUpdate(req.params.id, { requestStatus: 'Approved', fileUrl });
    res.redirect('/admin/track');
  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).send('Error approving request');
  }
});

// Reject Request (Improved for clarity)
app.post('/reject-request/:id', async (req, res) => {
  try {
    await Request.findByIdAndUpdate(req.params.id, { requestStatus: 'Rejected' });
    res.redirect('/admin/track');
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).send('Error rejecting request');
  }
});

