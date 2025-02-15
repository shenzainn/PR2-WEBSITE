const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
    studentName: { type: String, required: true },
    requestStatus: { type: String, default: "Pending" },
    fileUrl: { type: String }
});

const Request = mongoose.models.Request || mongoose.model("Request", requestSchema);

module.exports = Request;
