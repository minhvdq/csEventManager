const EventAttendance = require('../dataaccess/eventAttendance')
const Student = require('../dataaccess/student')
const Event = require('../dataaccess/event') // Assuming you have an Event DAL
const mailService = require('../utils/email/sendEmail')

// FIX: Rewritten with Promise.all to correctly fetch data
const getRegistrationsForEvent = async (eventId) => {
    const registrations = await EventAttendance.getByEventId(eventId);
    return Promise.all(registrations.map(async (reg) => {
        const student = await Student.getById(reg.student_id);
        return {...student, registered_at: reg.created_at};
    }));
}

// FIX: Rewritten with Promise.all
const getRegistrationsForStudent = async (studentId) => {
    const registrations = await EventAttendance.getByStudentId(studentId);
    return Promise.all(registrations.map(async (reg) => {
        const event = await Event.getById(reg.event_id);
        return {...event, registered_at: reg.created_at};
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

    console.log("Body is: " + JSON.stringify(body)) 

    if(taken216 === "null" || taken216 === "undefined"){
        taken216 = null
    }

    if( resumeTitle === "null" || resumeTitle === "undefined"){
        resumeTitle = null
    }

    if( resume === "null" || resume === "undefined"){
        resume = null
    }

    try{
        // Convert string 'true'/'false' to boolean
        if(taken216) {
            console.log("Processing taken 216")
            const taken216Bool = taken216 === 'true';
            await Student.updateMajorStatus(studentId, taken216Bool);
        }

        if(resumeTitle && resume){
            console.log("Processing resume")
            console.log("resumeTitle: " + resumeTitle)
            await Student.updateResume(studentId, resumeTitle, resume);
        }

        const checkCurrentRegistrationExist = await EventAttendance.getByStdentIdAndEventId(studentId, eventId)

        let registerResponse = null
        if(!checkCurrentRegistrationExist){
            registerResponse = await EventAttendance.create(studentId, eventId);
        }

        const event = await Event.getById(eventId)
        const student = await Student.getById(studentId)

        console.log("Sending email to: " + student.school_email)

        mailService.sendEmail(
            student.school_email,
            "Successfully Registered for Event",
            { event_name: event.name, name: student.first_name },
            "/templates/successfullyRegisterEvent.handlebars"
        )
        return registerResponse;
    }catch(e){
        console.log("Error sending email: " + e)
        throw e
    }
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

        const event = await Event.getById(eventId)
        mailService.sendEmail(
            schoolEmail,
            "Successfully Registered for Event",
            { event_name: event.name, name: firstName },
            "/templates/successfullyRegisterEvent.handlebars"
        )
    
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