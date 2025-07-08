const Student = require('../dataaccess/student')

const getAll = async () => {
    return await Student.getAll()
}

const getStudentByEmail = async (email) => {
    const student = await Student.getByEmail(email)
    
    return {
        exists: student ? true : false,
        student: student
    }
}

const createStudent = async (body) => {
    const requiredFields = [
      "schoolEmail", "schoolId", "firstName", "lastName", "classYear", "taken216", "resumeTitle", "resume"
    ];
  
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    return await Student.create(body)
}

// const updateStudent

module.exports = {
    getAll,
    getStudentByEmail,
    createStudent
}   