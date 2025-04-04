import express from "express";  // ✅ Import express first
import Request from "../models/request.js";  

const router = express.Router();  // ✅ Now it's safe to use express.Router()

const portNum = process.env.PORT || 3000;
const localIP = "192.168.252.73";

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

router.get('/student/messages', (req, res) => {
    const notifications = [
        { type: 'approved', message: 'Your request has been approved!' },
        { type: 'denied', message: 'Your request was denied.' },
        { type: 'pending', message: 'Your request is still pending.' }
    ];

    res.render('StudentMessages', { notifications }); // ✅ Pass notifications to EJS
});

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
