import express from "express";
import mongoose from "mongoose";
import RequestModel from "../models/request.js";
import Student from "../models/student.js";

const router = express.Router();
const portNum = process.env.PORT || 3000;
const localIP = "192.168.76.73";

router.get("/", (req, res) => {
    res.render("AdminHome.ejs", { portNum, localIP });
});

router.get("/user", (req, res) => {
    res.render("AdminUsers.ejs", { portNum, localIP });
});

router.get("/track", async (req, res) => {
    if (!req.session?.student || req.session.student.role !== "admin") {
        return res.redirect("/login");
    }
    try {
        const requests = await RequestModel.find();
        res.render("AdminTracking.ejs", { portNum, localIP, requests });
    } catch (error) {
        console.error("Error fetching requests:", error);
        res.status(500).send("Server Error");
    }
});

export default router; // ✅ ES Module export
