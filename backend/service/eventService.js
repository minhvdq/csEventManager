const db = require('../utils/db')
const locationService = require('./locationService')

const getAllEvents = async () => {
    const [rows] = await db.query('SELECT * FROM events')
    return rows
}

const getEventById = async (id) => {
    const [rows] = await db.query('SELECT * FROM events WHERE id = ?', [id])
    return rows[0]
}

const createEvent = async (body) => {
    if(!body.name || !body.description || !body.date || !body.need_resume || !body.need_major || !body.on_campus || !body.is_colloquium || !body.created_by || !body.poster_data || !body.capacity){
        throw new Error('Missing required fields')
    }
    
    let locationId
    if (body.locationId){
        locationId = body.locationId
    } else {
        const location = await locationService.createLocation(body.location)
        locationId = location.location_id
    }

    const [result] = await db.query('INSERT INTO events (name, description, location_id, start_time, end_time, need_resume, need_major, on_campus, is_colloquium, created_by, poster_data, capacity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [body.name, body.description, body.date, locationId, body.need_resume, body.need_major, body.on_campus, body.is_colloquium, body.created_by, body.poster_data, body.capacity])
    return result
}

module.exports = {
    getAllEvents,
    getEventById,
    createEvent
}
