const EventAttendance = require('../dataaccess/eventAttendance')
const studentService = require('./studentService')
const Student = require('../dataaccess/student')
const Event = require('../dataaccess/event') // Assuming you have an Event DAL
const mailService = require('../utils/email/sendEmail')
const RegisterToken = require('../dataaccess/registerToken')
const crypto = require('crypto')
const bcrypt = require('bcrypt')
const config = require('../utils/config')
const {frontendBase} = require('../utils/homeUrl')

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

const registerWithEmail = async ({eventId, email}) => {
    const token = await RegisterToken.getByEventIdAndEmail({eventId, email})
    if(token){
        console.log(token)
        RegisterToken.deleteByEventIdAndEmail(token.event_id, token.email)
    }
    const newToken = crypto.randomBytes(32).toString("hex")
    const hashedToken = await bcrypt.hash(newToken, Number(config.BCRYPT_SALT))
    try{
        await RegisterToken.create({eventId, email, token: hashedToken})
        const link = process.env.NODE_ENV === 'development' ? `${frontendBase}/register?token=${newToken}&eventId=${eventId}&email=${email}` : `http://acm.gettysburg.edu${frontendBase}/register?token=${newToken}&eventId=${eventId}&email=${email}`
        mailService.sendEmail(
            email,
            "Register for Event",
            {link: link},
            "/templates/registerEvent.handlebars"
        )
        return
    }catch(e){
        console.log("Error creating register token: " + e)
        throw e
    }
}

const checkStudentWithEmail = async ({eventId, email, token}) => {
    const dbToken = await RegisterToken.getByEventIdAndEmail({eventId, email})
    // console.log("Token is: " + JSON.stringify(dbToken))
    if(!dbToken){
        throw new Error("token is missing or not recognized!")
    }
    const isTokenValid = await bcrypt.compare(token, dbToken.token)
    // console.log("Token is valid: " + isTokenValid)
    if(!isTokenValid){
        throw new Error("token is invalid!")
    }
    const student = await studentService.getStudentByEmail(email)
    return student
}


const registerWithExistingStudent = async (body) => {
    let {
        token,
        email,
        studentId,
        taken216,
        resumeTitle,
        resume,
        eventId
    } = body 
    console.log("Body is: " + JSON.stringify(body))
    try{
        const dbToken = await RegisterToken.getByEventIdAndEmail({eventId, email})
        console.log("Token is: " + JSON.stringify(dbToken))
        if(!dbToken){
            console.log("Token is missing or not recognized!")
            throw new Error("token is missing or not recognized!")
        }
        const isTokenValid = await bcrypt.compare(token, dbToken.token)
        console.log("Token is valid: " + isTokenValid)
        if(!isTokenValid){
            console.log("Token is invalid!")
            throw new Error("token is invalid!")
        } 

        if(taken216 === "null" || taken216 === "undefined"){
            taken216 = null
        }

        if( resumeTitle === "null" || resumeTitle === "undefined"){
            resumeTitle = null
        }

        if( resume === "null" || resume === "undefined"){
            resume = null
        }
        // Convert string 'true'/'false' to boolean
        console.log("Token Passed! Updating")
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

        // console.log("Sending email to: " + student.school_email)
        console.log("Sending email")
        mailService.sendEmail(
            student.school_email,
            "Successfully Registered for Event",
            { event_name: event.name, name: student.first_name },
            "/templates/successfullyRegisterEvent.handlebars"
        )
        console.log("Deleting token")
        await RegisterToken.deleteByEventIdAndEmail(eventId, email)
        return registerResponse;
    }catch(e){
        console.log("Error sending email: " + e)
        throw e
    }
}

const registerWithNewStudent = async (body) => {
    const{
        token,
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
    console.log("Body is: " + JSON.stringify({...body, resume: null}))

    const dbToken = await RegisterToken.getByEventIdAndEmail({eventId, email: schoolEmail})
    if(!dbToken){
        throw new Error("token is missing or not recognized!")
    }
    const isTokenValid = await bcrypt.compare(token, dbToken.token)
    if(!isTokenValid){
        throw new Error("token is invalid!")
    }

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
        await RegisterToken.deleteByEventIdAndEmail(eventId, schoolEmail)
    
        return registerResponse
    }catch(e) {
        console.log("Error creating new student registration: " + e)
        throw e
    }
}

// You also need to fix getAllRegistrations with Promise.all if you use it
module.exports = { 
    registerWithEmail,
    checkStudentWithEmail,
    getRegistrationsForEvent,
    getRegistrationsForStudent,
    registerWithExistingStudent,
    registerWithNewStudent
}