const db = require('../utils/db')
const studentService = require('./studentService')

const getAll = async () => {
    const [rows] = await connection.execute(
        'SELECT * FROM event_attendance')
}

const getAttendanceById = async (eventId) => {
    const [rows] = await connection.execute(
        'SELECT * FROM event_attendance WHERE event_id = ?',
        [eventId]
    );

    const attendedStudents = rows.map(r => studentService.getSudentById(r.student_id).then(student => student) )

    return attendedStudents
}

const registerNewStudent = async (body) => {
    const {
        schoolId,
        schoolEmail, 
        firstName,
        lastName,
        classYear,
        taken2016,
        resumeTitle,
        resume,
        eventId
    } = body

    const createNewStudentResponse = await studentService.createNewStudent({schoolId, schoolEmail, firstName, lastName, classYear, taken2016, resumeTitle, resume})
    const studentId = createNewStudentResponse.insertId

    const [result] = await registerWithId(studentId, eventId)
    return result
}

const registerWithId = async (studentId, eventId) => {
    const [result] = db.query(`INSERT INTO event_attendance (student_id, event_id) 
         VALUES (?, ?)`,
         [studentId, eventId])
}

module.exports = {getAll, getAttendanceById, registerNewStudent, registerWithId}