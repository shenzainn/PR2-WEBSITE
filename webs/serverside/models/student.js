import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const studentSchema = new mongoose.Schema({
  studentNumber: { type: String, required: true, unique: true },
  studentName: { type: String, required: true }, // Added Student Name
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "admin"], default: "student" } // Role field
});

// Hash password before saving
studentSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next(); // Fixed typo (was "bpassword")
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Method to compare passwords
studentSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password);
};
  
const Student = mongoose.models.Student || mongoose.model("Student", studentSchema);

export default Student;
