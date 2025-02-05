const express = require('express');
const router = express.Router();
const portNum = process.env.port || 3000;
const localIP = '192.168.74.73'; 

router.get('/', function (req, res) {
    res.render("AdminHome.ejs",{portNum, localIP })
})

router.get('/track', function (req, res) {
    res.render("AdminTracking.ejs",{portNum, localIP })
})

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