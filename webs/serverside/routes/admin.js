import express from "express";
import bcrypt from "bcryptjs";
import RequestModel from "../models/request.js";
import User from "../models/user.js";

const router = express.Router();
const portNum = process.env.PORT || 3000;
const localIP = "192.168.76.73";

router.use(express.json());

//link routes
router.get("/", (req, res) => {
    res.render("AdminHome.ejs", { portNum, localIP });
});

// Route: Render User Management Page
router.get("/user", async (req, res) => {
    try {
        const users = await User.find(); // Fetch users from DB
        res.render("AdminUsers.ejs", { portNum, localIP, users }); // Pass users
    } catch (error) {
        console.error("Error fetching users:", error);
        res.render("AdminUsers.ejs", { portNum, localIP, users: [] });
    }
});

// Route: Add a New User
router.post("/users", async (req, res) => {
    try {
        const { studentNumber, studentName, email, password, role } = req.body;

        if (!studentNumber || !studentName || !email || !password || !role) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ studentNumber });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists!" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = new User({
            studentNumber,
            studentName,
            email,
            password: hashedPassword,
            role
        });

        await newUser.save();
        res.status(201).json({ message: "User added successfully!" });

    } catch (error) {
        console.error("Error adding user:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// Route: Delete a User
router.delete("/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.json({ message: "User removed successfully!" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

export default router;
