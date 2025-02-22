require("dotenv").config(); // Load environment variables

const mongoose = require("mongoose");

const conn = () => {
  const dbURL = process.env.DB_URL || "mongodb://localhost:27017/PR2_Website"; // Default to local MongoDB if env variable is missing

 mongoose
   .connect(dbURL)
   .then(() => console.log("MongoDB connected."))
   .catch((err) => console.error("DB DON'T CONNECT:", err));
};

module.exports = { conn };
