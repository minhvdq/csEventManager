const db = require('../utils/db')
const locationService = require('./locationService')

const getAllEvents = async () => {
    const [events] = await db.query('SELECT * FROM events')

    const locations = await locationService.getAll()
  
    const modifiedEvents = events.map(event => {
        let poster_data = event.poster_data
        if (event.poster_data){
          const posterBuffer = event.poster_data
          const posterBase64 = posterBuffer.toString('base64')
          poster_data = `data:image/jpeg;base64,${posterBase64}`
        }
        const location = locations.find(l => l.location_id === event.location_id)

        return {
            ...event,
            poster_data: poster_data,
            location: location
        }
    })
  
    return modifiedEvents;
};

const getEventById = async (id) => {
    const [rows] = await db.query('SELECT * FROM events WHERE id = ?', [id])
    const event =  rows[0]

    const location = await locationService.getLocationById(event.location_id)

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
      "name", "description", "start_time", "end_time", "created_by"
    ];
  
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
  
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
