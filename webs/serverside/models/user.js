import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    studentNumber: { type: String, required: true, unique: true },
    studentName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, default: "123456" }, // Default password for new students
    role: { type: String, enum: ["admin", "student"], default: "student" }
});

const User = mongoose.model("User", userSchema);
export default User;
