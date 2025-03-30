const router = express.Router();
import express from "express";
// how to route files 

/*
1. ../ reroutes to serverside folder immediately
2. select folder name first before file name
*/

import Request from "../models/request.js";

const portNum = process.env.port || 3000;
const localIP = '192.168.100.76'; 

router.get("/", (req, res) => {
    res.render('StudentHome', { user: req.user, localIP, portNum });
});

router.get("/track", async (req, res) => {
    if (!req.session || !req.session.studentNumber) {
        return res.render("StudentTracking.ejs", { portNum, localIP, studentNumber: null, error: "Not logged in" });
    }

    try {
        const studentNumber = req.session.studentNumber;
        res.render("StudentTracking.ejs", { portNum, localIP, studentNumber, error: null });
    } catch (error) {
        console.error("Tracking Error:", error);
        res.render("StudentTracking.ejs", { portNum, localIP, studentNumber: null, error: "Server error" });
    }
});
router.get('/submit', (req, res) => {
    res.render("StudentSubmit.ejs",{portNum, localIP })
})

router.get('/request', (req, res) => {
    res.render("StudentRequest.ejs",{portNum, localIP })
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



export default router;
