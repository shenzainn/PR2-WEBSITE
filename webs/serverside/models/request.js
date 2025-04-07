import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
    studentName: String,
    studentNumber: String,
    gradeSection: String,
    schoolYear: String,
    documentType: String,
    reason: String,
    status: {
        type: String,
        enum: ['new', 'pending', 'Approved', 'Rejected'],
        default: 'new'
    },
    rejectionReason: String,
    submittedAt: Date,
    decisionDate: Date
}, { timestamps: true });
const Request = mongoose.models.Request || mongoose.model("Request", requestSchema);
export default Request;
