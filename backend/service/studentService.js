const Student = require('../dataaccess/student');
const EventAttendance = require('../dataaccess/eventAttendance');


const transformResumeToDataURL = (student) => {
  // Check if the student and the resume buffer exist
  if (student && student.resume) {
    // Convert the LONGBLOB buffer to a Base64 string
    const resumeBase64 = student.resume.toString('base64');
    // Create the Data URL and update the student object
    student.resume = `data:application/pdf;base64,${resumeBase64}`;
  }
  return student;
};

const getAll = async () => {
  const students = await Student.getAll();
  // Transform the resume for each student in the array
  return students.map(transformResumeToDataURL);
};

const getStudentByEmail = async (email) => {
  let student = await Student.getByEmail(email);

  // If a student is found, transform their resume before returning
  if (student) {
    student = transformResumeToDataURL(student);
  }
  // console.log("student: " + JSON.stringify(student))
  return student;
};

const createStudent = async (body) => {
  // This function does not need changes as it handles incoming data
  const requiredFields = [
    "schoolEmail", "schoolId", "firstName", "lastName", "classYear", "taken216",
  ];

  // Resume is optional on creation, so it's not checked here
  for (const field of requiredFields) {
    if (body[field] === undefined || body[field] === null) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  return await Student.create(body);
};

const deleteById = async (studentId) => {
  await EventAttendance.deleteByStudentId(studentId)
  return await Student.deleteById(studentId)
}

module.exports = {
  getAll,
  getStudentByEmail,
  createStudent,
  deleteById
};