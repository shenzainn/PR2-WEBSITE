require("dotenv").config();
const mongoose = require("mongoose");

const dbURL = process.env.DB_URL || "mongodb://localhost:27017/PR2_Website";

const conn = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log("✅ Already connected to MongoDB");
      return mongoose.connection;
    }

    await mongoose.connect(dbURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB Connected.");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

module.exports = conn;  //Export the function, NOT call it
