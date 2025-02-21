const express = require('express');
const router = express.Router();
/*
1. ../ reroutes to serverside folder immediately
2. select folder name first before file name
*/
const { conn } = require("../routes/db");  // Import DB connection
const RequestModel = require('../models/request');

conn();  // Ensure DB connection

const portNum = process.env.port || 3000;
const localIP = '192.168.144.73'; 

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

module.exports = router;

