const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
/*
1. ../ reroutes to serverside folder immediately
2. select folder name first before file name
*/
const { conn } = require("../routes/db");  // Import DB connection
const RequestModel = require('../models/request');

conn();  // Ensure DB connection

const portNum = process.env.port || 3000;
const localIP = '192.168.1.13'; 

router.get('/', function (req, res) {
    res.render("AdminHome.ejs",{portNum, localIP })
})

router.get("/track", async (req, res) => {
    try {
        const requests = await RequestModel.find();
        console.log("Requests fetched:", requests);
        res.render("AdminTracking.ejs", { portNum, localIP, requests });
    } catch (error) {
        console.error("Error fetching requests:", error);
        if (!res.headersSent) {
            res.status(500).send("Server Error");
        }
    }
});

router.get('/settings', (req, res) => {
    res.render("AdminSettings.ejs",{portNum, localIP })
})

router.get('/message', (req, res) => {
    res.render("AdminMessages.ejs",{portNum, localIP })
})

router.get('/help', (req, res) => {
    res.render("AdminHelp.ejs",{portNum, localIP })
})

router.get('/user', (req, res) => {
    res.render("AdminUsers.ejs",{portNum, localIP })
})

router.get('/manage', (req, res) => {
    res.render("AdminUsers.ejs",{portNum, localIP })
})

// declare routes
const Student = mongoose.model("Student", new mongoose.Schema({
    studentNumber: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true }
}), "studentUsers");

  
 // Get all students
router.get("/users", async (req, res) => {
    const students = await Student.find();
    res.json(students);
});

// Add a student
router.post("/users", async (req, res) => {
    const { studentNumber, name, email } = req.body;
    if (!studentNumber || !name || !email) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const newStudent = new Student({ studentNumber, name, email });
        await newStudent.save();
        res.json({ message: "Student added successfully" });
    } catch (error) {
        res.status(400).json({ message: "Error adding student. Student number may already exist." });
    }
});

// Remove a student
router.delete("/users/:id", async (req, res) => {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Student removed successfully" });
});

module.exports = router;

