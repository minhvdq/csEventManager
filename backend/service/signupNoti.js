const client = require('../utils/redis')
const mailService = require('../utils/email/sendEmail')
const config = require('../utils/config')
const {frontendBase} = require('../utils/homeUrl')
const Student = require('../dataaccess/student')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const studentService = require('./studentService')

const logUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000/eventHub/assets/acm_logo.png' : 'https://acm.gettysburg.edu/eventHub/assets/acm_logo.png'


const signupWithEmail = async({email}) => {
    const key = `signupNoti:${email}`
    try{
        await client.del(key)
        const newToken = crypto.randomBytes(32).toString("hex")
        const hashedToken = await bcrypt.hash(newToken, Number(config.BCRYPT_SALT))

        await client.set(key, hashedToken, {EX: 60 * 60}) // 1 hour
        const link = process.env.NODE_ENV === 'development' ? `${frontendBase}/signupNoti?token=${newToken}&email=${email}` : `https://acm.gettysburg.edu${frontendBase}/signupNoti?token=${newToken}&email=${email}`
        mailService.sendEmail(
            email,
            "Signup For Future Events Notification",
            {link: link, logoUrl: logUrl},
            "/templates/signupNoti.handlebars"
        )
        return
    }catch(e){
        console.log("Error creating signup token: " + e)
        throw e
    }
}

const checkStudentWithEmail = async ({email, token}) => {
    const key = `signupNoti:${email}`
    const dbToken = await client.get(key)
    // console.log("Token is: " + JSON.stringify(dbToken))
    if(!dbToken){
        throw new Error("token is missing or not recognized!")
    }
    const isTokenValid = await bcrypt.compare(token, dbToken)
    // console.log("Token is valid: " + isTokenValid)
    if(!isTokenValid){
        throw new Error("token is invalid!")
    }
    const student = await studentService.getStudentByEmail(email)
    return student
}

const singupNoti = async(body) => {
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
    } = body
    console.log("Body is: " + JSON.stringify(body))
    try{
        const key = `signupNoti:${schoolEmail}`
        const dbToken = await client.get(key)
        console.log("Token is: " + JSON.stringify(dbToken))
        if(!dbToken){
            console.log("Token is missing or not recognized!")
            throw new Error("token is missing or not recognized!")
        }
        const isTokenValid = await bcrypt.compare(token, dbToken)
        if(!isTokenValid){
            throw new Error("token is invalid!")
        }
        const taken216Bool = taken216 === 'true';

        const createStudentResponse = await Student.create({
            schoolEmail,
            schoolId,
            firstName,
            lastName,
            classYear,
            taken216: taken216Bool,
            resumeTitle,
            resume,
            lastUpdate: new Date(),
        })
        const studentId = createStudentResponse.insertId
        return studentId
    }catch(e){
        console.log("Error creating student: " + e)
        throw e
    }
}

const signoutNoti = async({email, token}) => {
    try{
        const key = `signupNoti:${email}`
        console.log("Key is: " + key)
        const dbToken = await client.get(key)
        console.log("DB Token is: " + dbToken)
        if(!dbToken){
            throw new Error("token is missing or not recognized!")
        }
        const isTokenValid = await bcrypt.compare(token, dbToken)
        if(!isTokenValid){
            throw new Error("token is invalid!")
        }
        await Student.deleteByEmail(email)
        await client.del(key)
        return
    }catch(e){
        console.log("Error deleting student: " + e)
        throw e
    }
}

module.exports = {
    signupWithEmail,
    checkStudentWithEmail,
    singupNoti,
    signoutNoti
}