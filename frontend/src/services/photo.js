import axios from 'axios'
import {backendBase} from '../utils/homeUrl'

let token = null
const setToken = (newToken) => {
    token = `Bearer ${newToken}`
}

const photoUrl = `${backendBase}/api/photo`
const getForEvent = async (eventId) => {
    const response = await axios.get(`${photoUrl}/event/${eventId}`)
    return response.data
}

const uploadPhotos = async (body) =>{
    console.log(JSON.stringify(body))
    const captions = body.captions
    const photos = body.photos
    const eventId = body.eventId
    const formData = new FormData()
    formData.append("eventId", eventId)
    formData.append("captions", captions)
    for(let photo of photos){
        formData.append("photos", photo)
    }
    const response = await axios.post(`${photoUrl}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": token
        }
    })
    return response.data
}

const deletePhoto = async (photoId) => {
    const response = await axios.delete(`${photoUrl}/${photoId}`, {
        headers: {
            "Authorization": token
        }
    })
    return response.data
}

export default {setToken, getForEvent, uploadPhotos, deletePhoto}