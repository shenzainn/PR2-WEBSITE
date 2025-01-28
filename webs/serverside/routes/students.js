const express = require('express');
const router = express.Router();
const portNum = process.env.port || 3000;
const localIP = '192.168.117.73'; 


router.get("/", (req, res) => {
    res.render("StudentHome.ejs",{portNum, localIP })
    })

router.get('/track', (req, res) => {
    res.render("StudentTracking.ejs",{portNum, localIP })
})
router.get('/search', (req, res) => {
    
})

router.get('/check', (req, res) => {
    
})

router.get('/submit', (req, res) => {
    
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


module.exports = router