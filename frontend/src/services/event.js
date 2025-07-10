import axios from 'axios'
import { backendBase } from '../utils/homeUrl'

const eventUrl = `${backendBase}/api/events`

let token = null
const setToken = (newToken) => {
    token = `Bearer ${newToken}`
}

const formatDateTime = (date) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const createEvent = async (body) => {
    const formData = new FormData();
    
    formData.append("name", body.name);
    formData.append("description", body.description);
    formData.append("locationId", body.locationId);
    formData.append("locationName", body.locationName);
    formData.append("address", body.address);
    formData.append("lat", body.lat);
    formData.append("lng", body.lng);
    formData.append("room", body.room);
    formData.append("startTime", formatDateTime(body.startTime));
    formData.append("endTime", formatDateTime(body.endTime));
    formData.append("deadline", formatDateTime(body.deadline));
    formData.append("needResume", body.needResume);
    formData.append("needMajor", body.needMajor);
    formData.append("onCampus", body.onCampus);
    formData.append("isColloquium", body.isColloquium);
    formData.append("capacity", body.isLimited ? body.capacity : "");
    if (body.poster) {
        formData.append("poster", body.poster); // name must match multer's field name
    }

    console.log("FormData contents:");
    for (let [key, value] of formData.entries()) {
        if (key === "poster") {
            console.log(`${key}:`, value.name, value.type, value.size + " bytes");
        } else {
            console.log(`${key}:`, value);
        }
    }

    console.log("Token is: " + token)
    const response = await axios.post(`${backendBase}/api/events`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": token
        },
    });
    return response

}

const updateEvent = async (eventId, body) => {
    const response = await axios.put(`${backendBase}/api/events/deadline/${eventId}`, {deadline:formatDateTime(body.deadline)}, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": token
        },
    });
    return response
}

const getAll = async () => {
    const eventsObj = await axios.get(eventUrl)
    return eventsObj.data
}

const deleteEvent = async (eventId) => {
    const response = await axios.delete(`${backendBase}/api/events/${eventId}`, {
        headers: {
            "Authorization": token
        },
    });
    return response
}

export default {getAll, createEvent, setToken, updateEvent, deleteEvent}