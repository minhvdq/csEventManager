import axios from 'axios'
import {backendBase} from '../utils/homeUrl'

let token = null
const setToken = (newToken) => {
    token = `Bearer ${newToken}`
}

const resourceUrl = `${backendBase}/api/resource`
const getForEvent = async (eventId) => {
    const response = await axios.get(`${resourceUrl}/event/${eventId}`)
    return response.data
}

const addResource = async (body) => {
    const response = await axios.post(`${resourceUrl}`, body, {
        headers: {
            "Authorization": token
        }
    })
    return response.data
}

const deleteResource = async (id) => {  
    const response = await axios.delete(`${resourceUrl}/${id}`, {
        headers: {
            "Authorization": token
        }
    })
    return response.data
}

export default {setToken, getForEvent, addResource, deleteResource}