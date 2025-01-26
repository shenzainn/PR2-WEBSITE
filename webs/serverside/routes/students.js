const express = require('express');
const router = express.Router();

router.get("/", (req, res) => {
    res.render("StudentHome.ejs")
    })

router.get('/track', (req, res) => {
    res.render("tracking.ejs")
})
router.get('/search', (req, res) => {
    
})

router.get('/check', (req, res) => {
    
})

router.get('/submit', (req, res) => {
    
})

module.exports = router