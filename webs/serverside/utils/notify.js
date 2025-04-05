export default function sendNotification(type, student) {
    console.log(`[NOTIF] Student ${type.toUpperCase()}:`, {
      studentNumber: student.studentNumber,
      studentName: student.studentName,
      role: student.role
    });
  
}