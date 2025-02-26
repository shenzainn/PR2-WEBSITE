import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    studentNumber: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, default: "default123" }, // Default password for new students
    role: { type: String, enum: ["admin", "student"], default: "student" }
});

const User = mongoose.model("User", userSchema);
export default User;
