import axios from 'axios'
import { backendBase, frontendBase } from '../utils/homeUrl'

const registerUrl = `${backendBase}/api/eventRegister`

const registerForNewStudent = async (body) => {
    try{
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
    } catch(e) {
        throw e
    }
}

const registerForExistingStudent = async (body) => {
    try{
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
    } catch(e) {
        throw e
    }
}

export default {registerForNewStudent, registerForExistingStudent}