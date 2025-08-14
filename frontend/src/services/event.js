import axios from 'axios'
import { backendBase } from '../utils/homeUrl'

const eventUrl = `${backendBase}/api/events`

let token = null
const setToken = (newToken) => {
    token = `Bearer ${newToken}`
}

// Helper function to format a Date object into 'YYYY-MM-DD HH:MM:SS' for MySQL
// This version uses the local time components and does NOT convert to UTC.
const formatDateTimeForMySQL = (date) => {
    const pad = (num) => num.toString().padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1); // getMonth() is zero-based
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
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
    // Use the new formatter to match MySQL's DATETIME format
    formData.append("startTime", formatDateTimeForMySQL(body.startTime));
    formData.append("endTime", formatDateTimeForMySQL(body.endTime));
    formData.append("deadline", formatDateTimeForMySQL(body.deadline));
    formData.append("needResume", body.needResume);
    formData.append("needMajor", body.needMajor);
    formData.append("onCampus", body.onCampus);
    formData.append("isColloquium", body.isColloquium);
    formData.append("capacity", body.isLimited ? body.capacity : "");
    if (body.poster) {
        formData.append("poster", body.poster);
    }

    const response = await axios.post(`${backendBase}/api/events`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": token
        },
    });
    return response

}

const updateEvent = async (eventId, body) => {
    // Also use the new formatter here for consistency
    const response = await axios.put(`${backendBase}/api/events/deadline/${eventId}`, {deadline: formatDateTimeForMySQL(body.deadline)}, {
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

const getByID = async (eventId) => {
    const event_name = await axios.get(`${eventUrl}/${eventId}`)
    return event_name.data
}

const deleteEvent = async (eventId) => {
    const response = await axios.delete(`${backendBase}/api/events/${eventId}`, {
        headers: {
            "Authorization": token
        },
    });
    return response
}

export default {getAll, getByID, createEvent, setToken, updateEvent, deleteEvent}
