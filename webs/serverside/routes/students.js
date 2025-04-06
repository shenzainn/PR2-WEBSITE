import express from "express";  // Import express first
import Request from "../models/request.js";  

const router = express.Router();  // Now it's safe to use express.Router()

const portNum = process.env.PORT || 3000;
const localIP = "192.168.100.76";

router.get("/", (req, res) => {
    console.log(req.user);
    console.log("Session data:", req.session);
    res.render('StudentHome', { user: req.user, localIP, portNum });
});

router.get("/track", async (req, res) => {
    try {
        const requests = await Request.find().lean(); // You may want to filter by student later
        res.render("StudentTracking.ejs", { portNum, localIP, requests });
    } catch (err) {
        console.error("Error loading tracking data:", err);
        res.status(500).send("Failed to load tracking data.");
    }
});
  
router.get('/submit', (req, res) => {
    res.render("StudentSubmit.ejs",{portNum, localIP })
})

router.get('/notif', (req, res) => {
    res.render("StudentMessages.ejs",{portNum, localIP })
})

// Show the student request form
router.get("/request", (req, res) => {
    res.render("StudentRequest.ejs", { portNum, localIP });
});

// Route for submitting new requests
router.post('/request', async (req, res) => {
    try {
        const newRequest = new Request({
            studentName: req.body.studentName,
            studentNumber: req.body.studentNumber,
            gradeSection: req.body.gradeSection,
            schoolYear: req.body.schoolYear,
            documentType: req.body.documentType,
            reason: req.body.reason,
            status: 'new', // default status
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await newRequest.save();
        res.redirect('/students/track'); // Redirect to tracking page
    } catch (error) {
        console.error('Failed to save request:', error);
        res.status(500).send('Server Error');
    }
});

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
});

router.post('/submit-request', async (req, res) => {
    const { formType } = req.body;
  
    const newRequest = new Request({
        studentNumber: req.session.student.studentNumber,
        formType
    });
  
    await newRequest.save();
    res.redirect("/students/tracking");
  });


export default router;
