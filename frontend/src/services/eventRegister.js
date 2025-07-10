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

const registerForNewStudent = async (body) => {
    
    const{
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
        eventId,
        studentId,
        taken216,
        resumeTitle,
        resume
    } = body

    const formData = new FormData()
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

export default {setToken, getAttendeesForEvent, registerForNewStudent, registerForExistingStudent}