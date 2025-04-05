import Student from "../models/student.js";
export const createStudent = async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json({ message: "Student created", student });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate(
      { studentNumber: req.params.studentNumber },
      req.body,
      { new: true }
    );
    res.status(200).json({ message: "Student updated", student });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};