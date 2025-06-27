const db = require('../utils/db')
const locationService = require('./locationService')

const getAllEvents = async () => {
    const [events] = await db.query('SELECT * FROM events');
  
    const modifiedEvents = events.map(event => {
        if (!event.poster) return event
    
        const posterBuffer = event.poster
        const posterBase64 = posterBuffer.toString('base64')

        const location = locationService.getLocationById(event.location_id)

        return {
            ...event,
            poster: `data:image/jpeg;base64,${posterBase64}`,
            location: location
        }
    })
  
    return modifiedEvents;
};

const getEventById = async (id) => {
    const [rows] = await db.query('SELECT * FROM events WHERE id = ?', [id])
    const event =  rows[0]

    const location = locationService.getLocationById(event.location_id)

    if(!event.poster){
        return {...event, location: location}
    }
    
    // modify the poster
    const posterBuffer = event.poster
    const posterBase64 = posterBuffer.toString('base64')

    const modifiedEvent = {...event, poster: `data:image/jpeg;base64,${posterBase64}`, location: location}
    return modifiedEvent
}

const createEvent = async (body) => {
    const requiredFields = [
      "name", "description", "start_time", "end_time", "created_by", "poster_data"
    ];
  
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
  
    // Optional: check boolean fields if needed
    if (typeof body.need_resume !== "boolean") throw new Error("Invalid value for need_resume");
  
    let locationId = body.locationId;
    if (!locationId) {
      const locationMetadata = await locationService.createLocation(body.location);
      locationId = locationMetadata.insertId;
    }
  
    const [result] = await db.query(
      `INSERT INTO events (name, description, location_id, start_time, end_time, need_resume, need_major, on_campus, is_colloquium, created_by, poster_data, capacity) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.name,
        body.description,
        locationId,
        body.start_time,
        body.end_time,
        body.need_resume,
        body.need_major,
        body.on_campus,
        body.is_colloquium,
        body.created_by,
        body.poster_data,
        body.capacity,
      ]
    );
  
    return result;
  };

module.exports = {
    getAllEvents,
    getEventById,
    createEvent
}
