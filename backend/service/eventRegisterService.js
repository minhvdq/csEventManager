const EventAttendance = require('../dataaccess/eventAttendance')
const Student = require('../dataaccess/student')
const Event = require('../dataaccess/event') // Assuming you have an Event DAL

// FIX: Rewritten with Promise.all to correctly fetch data
const getRegistrationsForEvent = async (eventId) => {
    const registrations = await EventAttendance.getByEventId(eventId);
    return Promise.all(registrations.map(async (reg) => {
        const student = await Student.getById(reg.student_id);
        const event = await Event.getById(reg.event_id);
        return { student, event };
    }));
}

// FIX: Rewritten with Promise.all
const getRegistrationsForStudent = async (studentId) => {
    const registrations = await EventAttendance.getByStudentId(studentId);
    return Promise.all(registrations.map(async (reg) => {
        const student = await Student.getById(reg.student_id);
        const event = await Event.getById(reg.event_id);
        return { student, event };
    }));
}


const registerWithExistingStudent = async (body) => {
    let {
        studentId,
        taken216,
        resumeTitle,
        resume,
        eventId
    } = body 

    // Convert string 'true'/'false' to boolean
    if(taken216 != null && taken216 !== 'null') {
        const taken216Bool = taken216 === 'true';
        await Student.updateMajorStatus(studentId, taken216Bool);
    }

    if(resumeTitle && resume){
        await Student.updateResume(studentId, resumeTitle, resume);
    }

    // FIX: Pass arguments correctly
    const registerResponse = await EventAttendance.create(studentId, eventId);
    return registerResponse;
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

    // Convert string to boolean
    const taken216Bool = taken216 === 'true';

    try{
        const createStudentResponse = await Student.create({
            schoolEmail,
            schoolId,
            firstName,
            lastName,
            classYear,
            taken216: taken216Bool,
            lastUpdate: new Date(), // FIX: Add the current timestamp
            resumeTitle,
            resume
        })
    
        const studentId = createStudentResponse.insertId
    
        // FIX: Pass arguments correctly
        const registerResponse = await EventAttendance.create(studentId, eventId);
    
        return registerResponse
    }catch(e) {
        console.log("Error creating new student registration: " + e)
        throw e
    }
}

// You also need to fix getAllRegistrations with Promise.all if you use it
module.exports = { 
    getRegistrationsForEvent,
    getRegistrationsForStudent,
    registerWithExistingStudent,
    registerWithNewStudent
}