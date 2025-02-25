const express = require('express');
const router = express.Router();
// how to route files 

/*
1. ../ reroutes to serverside folder immediately
2. select folder name first before file name
*/

const Request = require("../models/request");

const portNum = process.env.port || 3000;
const localIP = '192.168.76.73'; 

router.get("/", (req, res) => {
    res.render('StudentHome', { user: req.user, localIP, portNum });
});

router.get('/track', async (req, res) => {
    res.render("StudentTracking.ejs",{portNum, localIP })
    const { studentNumber } = req.query;

    if (!studentNumber) {
        return res.status(400).json({ error: "Student number is required." });
    }

    try {
        const requestData = await Request.findOne({ studentNumber });

        if (!requestData) {
            return res.status(404).json({ error: "No request found." });
        }

        res.json({
            requestStatus: requestData.requestStatus,
            fileUrl: requestData.fileUrl || null,
        });
    } catch (error) {
        res.status(500).json({ error: "Server error." });
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
router.get("/tracking", async (req, res) => {
    if (!req.session.student) {
        return res.redirect("/login");
    }

//Tracking
const requests = await Request.find({ studentNumber: req.session.student.studentNumber });

res.render("StudentTracking", { requests });

//Submit
const { formType } = req.body;

    const newRequest = new Request({
        studentNumber: req.session.student.studentNumber,
        formType
    });

    await newRequest.save();
    res.redirect("/students/tracking");
});




module.exports = router;
