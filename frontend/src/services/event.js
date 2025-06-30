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
    formData.append("start_time", formatDateTime(body.startTime));
    formData.append("end_time", formatDateTime(body.endTime));
    formData.append("need_resume", body.needResume);
    formData.append("need_major", body.needMajor);
    formData.append("on_campus", body.onCampus);
    formData.append("is_colloquium", body.isColloquium);
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

    try {
        console.log("Token is: " + token)
        const response = await axios.post(`${backendBase}/api/events`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                "Authorization": token
            },
        });
        return response
    } catch (error) {
        throw error
    }
}

const getAll = async () => {
    const eventsObj = await axios.get(eventUrl)
    return eventsObj.data
}

export default {getAll, createEvent, setToken}