import axios from 'axios'
import { backendBase } from '../utils/homeUrl'

const userUrl = `${backendBase}/api/users`

let token = null
const setToken = (newToken) => {
    token = `Bearer ${newToken}`
}
const getAll = async () => {
    const headers = {
        Authorization: token
    }
    const response = await axios.get(userUrl, { headers })
    return response.data
}

const getUserByEmail = async (email) => {
    const headers = {
        Authorization: token
    }
    const response = await axios.get(`${userUrl}/${email}`, { headers })
    return response.data
}

const createUser = async (body) => {
    const headers = {
        Authorization: token
    }
    const response = await axios.post(userUrl, body, { headers })
    return response.data
}

const deleteUser = async (id) => {
    const headers = {
        Authorization: token
    }
    const response = await axios.delete(`${userUrl}/${id}`, { headers })
    return response.data
}

export default {
    setToken,
    getAll,
    getUserByEmail,
    createUser,
    deleteUser
}