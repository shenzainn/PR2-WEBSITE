const express = require('express');
const router = express.Router();
const User = require('./models/user'); // Your User model
const { isAdmin } = require('../middleware/auth'); // Middleware to check admin

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next(); // Continue if admin
    } else {
        res.status(403).json({ message: 'Access denied' });
    }
};

module.exports = { isAdmin }; // thank you, seen it

