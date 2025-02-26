import express from "express";
import mongoose from "mongoose";
import RequestModel from "../models/request.js";
import Student from "../models/student.js";
import User from "../models/user.js";

const router = express.Router();
const portNum = process.env.PORT || 3000;
const localIP = "192.168.76.73";

router.get("/", (req, res) => {
    res.render("AdminHome.ejs", { portNum, localIP });
});

router.get("/user", (req, res) => {
    res.render("AdminUsers.ejs", { portNum, localIP });
});

router.get("/track", async (req, res) => {
    if (!req.session?.student || req.session.student.role !== "admin") {
        return res.redirect("/login");
    }
    try {
        const requests = await RequestModel.find();
        res.render("AdminTracking.ejs", { portNum, localIP, requests });
    } catch (error) {
        console.error("Error fetching requests:", error);
        res.status(500).send("Server Error");
    }
});

router.post("/users", async (req, res) => {
    const { studentNumber, name, email } = req.body;

    if (!studentNumber || !name || !email) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    try {
        // Check if student already exists
        const existingUser = await User.findOne({ studentNumber });
        if (existingUser) {
            return res.status(400).json({ message: "Student already exists!" });
        }

        // Hash default password before storing
        const hashedPassword = await bcrypt.hash("default123", 10);

        const newUser = new User({
            studentNumber,
            name,
            email,
            password: hashedPassword,
            role: "student"
        });

        await newUser.save();
        res.status(201).json({ message: "Student added successfully!" });

    } catch (error) {
        console.error("Error adding student:", error);
        res.status(500).json({ message: "Server error. Please try again." });
    }
});



// Route to get all students
router.get("/users", async (req, res) => {
    try {
        const students = await User.find({ role: "student" }).select("-password"); // Exclude password field
        res.json(students);
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ message: "Server error." });
    }
});

// Route to delete a student
router.delete("/users/:id", async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "Student removed successfully!" });
    } catch (error) {
        console.error("Error removing student:", error);
        res.status(500).json({ message: "Server error." });
    }
});

export default router;
