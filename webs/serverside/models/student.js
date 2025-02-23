const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const studentSchema = new mongoose.Schema({
  studentNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Hash password before saving
studentSchema.pre("save", async function (next) {
    if (!this.isModified("bpassword")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Method to compare passwords
studentSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password);
};
  
const Student = mongoose.models.Student || mongoose.model("Student", studentSchema);

  
module.exports = Student;


// test

