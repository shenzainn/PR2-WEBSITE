import express from "express";
import bcrypt from "bcryptjs";
import RequestModel from "../models/request.js";
import User from "../models/user.js";

const router = express.Router();
const portNum = process.env.PORT || 3000;
const localIP = "192.168.100.76";

router.use(express.json());

//link routes, DO NOT DELETE ANYTHING
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
router.get('/track', async (req, res) => {
    try {
        const newRequests = await RequestModel.find({ status: 'new' });
        const approvedRequests = await RequestModel.find({ status: 'Approved' });
        const rejectedRequests = await RequestModel.find({ status: 'Rejected' });

        res.render("AdminTracking.ejs", {
            portNum,
            localIP,
            newRequests,
            approvedRequests,
            rejectedRequests
        });
    } catch (err) {
        console.error("Admin Tracking Error:", err);
        res.status(500).send("Server error");
    }
});

router.post("/request/:id/status", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        await RequestModel.findByIdAndUpdate(id, {
            status,
            decisionDate: new Date()
        });
        res.redirect("/admin/track");
    } catch (err) {
        console.error("Error updating request:", err);
        res.status(500).send("Failed to update request");
    }
});

router.post("/request/:id/reject", async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    try {
        await RequestModel.findByIdAndUpdate(id, {
            status: "rejected",
            rejectionReason: reason,  // Save the rejection reason
            decisionDate: new Date()
        });
        res.redirect("/admin/track");
    } catch (err) {
        console.error("Error rejecting request:", err);
        res.status(500).send("Failed to reject request");
    }
});


router.get("/message", (req, res) => {
    res.render("AdminMessages.ejs", { portNum, localIP });
});
router.get("/settings", (req, res) => {
    res.render("AdminSettings.ejs", { portNum, localIP });
});
router.get("/message", (req, res) => {
    res.render("AdminMessages.ejs", { portNum, localIP });
});
router.get("/docManage", (req, res) => {
    res.render("AdminManageDocs.ejs", { portNum, localIP });
});
router.get("/help", (req, res) => {
    res.render("AdminHelp.ejs", { portNum, localIP });
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
