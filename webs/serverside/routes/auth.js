const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Your User model
const { isAdmin } = require('../middleware/auth'); // Middleware to check admin

// Admin-only sign-up route
router.post('/admin/register', isAdmin, async (req, res) => {
    try {
        const { fName, lName, email, studentNumber, password } = req.body;

        // Check if student number already exists
        const existingUser = await User.findOne({ studentNumber });
        if (existingUser) {
            return res.status(400).json({ message: 'Student already registered' });
        }

        // Create new student account
        const newUser = new User({ fName, lName, email, studentNumber, password, role: 'student' });
        await newUser.save();

        res.status(201).json({ message: 'Student registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next(); // Continue if admin
    } else {
        res.status(403).json({ message: 'Access denied' });
    }
};

module.exports = { isAdmin }; // jc