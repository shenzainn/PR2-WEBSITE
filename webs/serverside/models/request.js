const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
    studentNumber: { type: String, required: true }, // Links to Student
    studentName: { type: String, required: true },
    formType: { type: String, required: true }, // Type of request form
    requestStatus: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    fileUrl: { type: String },
    submittedAt: { type: Date, default: Date.now }
});

const Request = mongoose.models.Request || mongoose.model("Request", requestSchema);

module.exports = Request;
