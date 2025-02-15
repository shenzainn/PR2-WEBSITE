const express = require('express');
const router = express.Router();
const portNum = process.env.port || 3000;
const localIP = '192.168.1.13'; 
const RequestModel = require('../models/request');  // Adjust the path if needed


router.get('/', function (req, res) {
    res.render("AdminHome.ejs",{portNum, localIP })
})
router.get("/track", async (req, res) => {
    try {
        // Fetch requests from the database
        const requests = await RequestModel.find();

        // Debugging: Check if requests exist
        console.log("Requests fetched:", requests);

        // Pass `requests` along with other data
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


module.exports = router