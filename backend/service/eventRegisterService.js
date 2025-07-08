const EventAttendance = require('../dataaccess/eventAttendance')
const Student = require('../dataaccess/student')
const Event = require('../dataaccess/event')

const getAllRegistrations = async () => {
    const registrations = await EventAttendance.getAll()
    return registrations.map(registration => {
        Student.getById(registration.student_id).then(student => {
            Event.getById(event => {
                return(
                    {student, event}
                )
            })
        })
    })
}

const getRegistrationsForEvent = async (eventId) => {
    const registrations = await EventAttendance.getByEventId(eventId)
    return registrations.map(registration => {
        Student.getById(registration.student_id).then(student => {
            Event.getById(event => {
                return(
                    {student, event}
                )
            })
        })
    })
}

const getRegistrationsForStudent = async (studentId) => {
    const registrations = await EventAttendance.getByStudentId(studentId)
    return registrations.map(registration => {
        Student.getById(registration.student_id).then(student => {
            Event.getById(event => {
                return(
                    {student, event}
                )
            })
        })
    })
}

const registerWithExistingStudent = async (body) => {
    const{
        studentId,
        taken216,
        resumeTitle,
        resume,
        eventId
    } = body 

    if(taken216 != null) {
        await Student.updateMajorStatus(studentId,taken216)
    }

    if(resumeTitle && resume){
        await Student.updateResume(studentId, resumeTitle, resume)
    }

    const registerResponse = EventAttendance.create(studentId, eventId)
    return registerResponse
}

const registerWithNewStudent = async (body) => {
    const{
        schoolEmail,
        schoolId,
        firstName,
        lastName,
        classYear,
        taken216,
        resumeTitle,
        resume,
        eventId
    } = body

    const createStudentResponse = await Student.create({
        schoolEmail,
        schoolId,
        firstName,
        lastName,
        classYear,
        taken216,
        resumeTitle,
        resume
    })

    const studentId = createStudentResponse.insertId

    const registerResponse = await EventAttendance.create({
        studentId,
        eventId
    })

    return registerResponse
}

module.exports = {
    getAllRegistrations,
    getRegistrationsForEvent,
    getRegistrationsForStudent,
    registerWithNewStudent,
    registerWithExistingStudent
}