const express = require('express');
const router = express.Router();
// how to route files 

/*
1. ../ reroutes to serverside folder immediately
2. select folder name first before file name
*/

const { conn } = require("../routes/db");  // Import DB connection
const Request = require("../models/request");

conn();  // Ensure DB connection

const portNum = process.env.port || 3000;
const localIP = '192.168.144.73'; 

router.get("/", (req, res) => {
    res.render('StudentHome', { user: req.user, localIP, portNum });
})

router.get('/track', async (req, res) => {
    const { studentName } = req.query;

    if (!studentName) {
        return res.render("StudentTracking", { requestData: null, portNum, localIP });
    }

    try {
        const requestData = await Request.findOne({ studentName });
        res.render("StudentTracking", { requestData: requestData || null, portNum, localIP });
    } catch (error) {
        console.error("Error fetching request data:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get('/submit', (req, res) => {
    res.render("StudentSubmit.ejs",{portNum, localIP })
})

router.get('/settings', (req, res) => {
    res.render("StudentSettings.ejs",{portNum, localIP })
})

router.get('/message', (req, res) => {
    res.render("StudentMessages.ejs",{portNum, localIP })
})

router.get('/help', (req, res) => {
    res.render("StudentHelp.ejs",{portNum, localIP })
})

module.exports = router;
