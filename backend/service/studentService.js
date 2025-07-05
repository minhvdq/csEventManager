const Student = require('../dataaccess/student')

const getAll = async () => {
    return await Student.getAll()
}

const getStudentByEmail = async (email) => {
    const student = await Student.getByEmail(email)
    
    return {
        exist: student ? true : false,
        student: student
    }
}

const createStudent = async (body) => {
    return await Student.create(body)
}

module.exports = {
    getAll,
    getStudentByEmail,
    createStudent
}   