import axios from 'axios'
import { backendBase } from '../utils/homeUrl'

const signupNotiUrl = `${backendBase}/api/signupNoti`

// let token = null
// const setToken = (newToken) => {
//     token = `Bearer ${newToken}`
// }

const signupWithEmail = async ({email}) => {
    try {
        const response = await axios.post(`${signupNotiUrl}/`, {
            email: email
        });
        return response.data;
    } catch (e) {
        console.log("Error sending signup email: " + e);
        throw e;
    }
};

const checkStudentWithEmail = async({email, token}) => {
    try{
        const response = await axios.post(`${signupNotiUrl}/checkStudentWithEmail`, {
            email: email,
            token: token
        })
        return response.data
    }catch(e) {
        console.log("Error checking student with email: " + e)
        throw e
    }
}

const signupNoti = async (body) => {
    
    const{
        token,
        schoolEmail,
        schoolId,
        firstName,
        lastName,
        classYear,
        taken216
    } = body


    const signupNotiResponse = await axios.post(`${signupNotiUrl}/signupNoti`, {
        token,
        schoolEmail,
        schoolId,
        firstName,
        lastName,
        classYear,
        taken216
    })
    return signupNotiResponse.data
}

const signoutNoti = async (body) => {
    
    const{
        email,
        token
    } = body

    const signoutNotiResponse = await axios.post(`${signupNotiUrl}/signoutNoti`, {
        email: email,
        token: token
    })
    return signoutNotiResponse.data
    
}

export default {signupWithEmail, checkStudentWithEmail, signupNoti, signoutNoti}