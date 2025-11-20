import axios from 'axios'
import { backendBase } from '../utils/homeUrl'

const eventUrl = `${backendBase}/api/students`

let token = null
const setToken = (newToken) => {
    token = `Bearer ${newToken}`
}


const getByEmail = async (email) => {
    const getByEmailResponse = await axios.get(`${eventUrl}/${email}`)
    return getByEmailResponse.data
}

const getAll = async () => {
    const getAllResponse = await axios.get(eventUrl, {
        headers: {
            "Authorization": token
        }
    })
    return getAllResponse.data
}

const deleteById = async (id) => {
    const response = await axios.delete(`${eventUrl}/${id}`, {
        headers: {
            "Authorization": token
        },
    });
    return response
}

export default {setToken, getByEmail, getAll, deleteById}