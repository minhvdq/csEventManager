import axios from 'axios'
import { backendBase } from '../utils/homeUrl'

const registerUrl = `${backendBase}/api/eventRegister`

let token = null
const setToken = (newToken) => {
    token = `Bearer ${newToken}`
}

const getAttendeesForEvent = async (eventId) => {
    const response = await axios.get(`${registerUrl}/byEvent/${eventId}`, {
        headers: {
            "Authorization": token
        },
    })
    return response.data
}

const registerWithEmail = async({eventId, email}) => {
    try{
        const response = await axios.post(`${registerUrl}/registerWithEmail`, {
            eventId, email
        })
        return response.data
    }catch(e){
        console.log("Error registering with email: " + e)
        throw e
    }
}

const checkStudentWithEmail = async({eventId, email, token}) => {
    try{
        const response = await axios.post(`${registerUrl}/checkStudentWithEmail`, {
            eventId: eventId,
            email: email,
            token: token
        })
        return response.data
    }catch(e) {
        console.log("Error checking student with email: " + e)
        throw e
    }
}

const registerForNewStudent = async (body) => {
    
    const{
        token,
        eventId,
        schoolEmail,
        schoolId, 
        firstName,
        lastName,
        classYear,
        taken216,
        resumeTitle,
        resume
    } = body

    const formData = new FormData()
    formData.append("token", token)
    formData.append("eventId", eventId)
    formData.append("schoolEmail", schoolEmail)
    formData.append("schoolId", schoolId)
    formData.append("firstName", firstName)
    formData.append("lastName", lastName)
    formData.append("classYear", classYear)
    formData.append("taken216", taken216)
    formData.append("resumeTitle", resumeTitle)
    if(resume){
        formData.append("resume", resume)
    }

    const registerResponse = await axios.post(`${registerUrl}/newStudent`, formData)
    return registerResponse
}

const registerForExistingStudent = async (body) => {
    
    const{
        token,
        eventId,
        studentId,
        taken216,
        resumeTitle,
        resume,
        email
    } = body

    const formData = new FormData()
    formData.append("token", token)
    formData.append("email", email)
    formData.append("eventId", eventId)
    formData.append("studentId", studentId)
    formData.append("taken216", taken216)
    formData.append("resumeTitle", resumeTitle)
    if(resume){
        formData.append("resume", resume)
    }

    const registerResponse = await axios.post(`${registerUrl}/existingStudent`, formData)
    return registerResponse
    
}

export default {setToken, getAttendeesForEvent, registerWithEmail, checkStudentWithEmail, registerForNewStudent, registerForExistingStudent}