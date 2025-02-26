import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    studentNumber: { type: String, required: true, unique: true }, // Ensure String
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "student"], default: "student" }
});

const User = mongoose.model("User", userSchema);
export default User;