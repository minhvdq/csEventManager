const Event = require('../dataaccess/event')
const Location = require('../dataaccess/location')

const getAllEvents = async () => {
    const events = await Event.getAll()

    const locations = await Location.getAll()
  
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
    const event = await Event.getById(id)

    const location = await Location.getById(event.location_id)

    let poster_data = poster_data

    if (event.poster_data){
      const posterBuffer = event.poster_data
      const posterBase64 = posterBuffer.toString('base64')
      poster_data = `data:image/jpeg;base64,${posterBase64}`
    }

    return {
        ...event,
        poster_data: poster_data,
        location: location
    }
}

const createEvent = async (body) => {
    const requiredFields = [
      "name", "description", "startTime", "endTime", "createdBy"
    ];
  
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
  
    let locationId = body.locationId;
    if (!locationId) {
      const locationMetadata = await Location.create(body.location);
      locationId = locationMetadata.insertId;
    }

    const{
      name,
      description,
      startTime,
      endTime,
      needResume,
      needMajor,
      onCampus,
      isColloquium,
      createdBy,
      posterData,
      capacity
    } = body
  
    return await Event.create({
      name,
      description,
      locationId,
      startTime,
      endTime,
      needResume,
      needMajor,
      onCampus,
      isColloquium,
      createdBy,
      posterData,
      capacity
    })
  
  };

module.exports = {
    getAllEvents,
    getEventById,
    createEvent
}
