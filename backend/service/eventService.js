const Event = require('../dataaccess/event')
const Location = require('../dataaccess/location')
const EventAttendance = require('../dataaccess/eventAttendance')
const client = require('../utils/redis')

const CACHE_TIME_TO_LIVE = 60 * 20

const clearAllEventCache = async () => {
    const key = 'allevents'
    await client.del(key)
}

const getAllEvents = async () => {

    const key = 'allevents'
    const cachedEvents = await client.get(key)
    if(cachedEvents){
        return JSON.parse(cachedEvents)
    }else{
      try{
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

        await client.set(key, JSON.stringify(modifiedEvents), {EXE: CACHE_TIME_TO_LIVE})
      
        return modifiedEvents
      }catch(e){
        console.log("Error getting all events: " + e)
        throw e
      } 
    }
};

const getEventById = async (id) => {

    const key = `event:${id}`
    const cachedEvent = await client.get(key)
    if(cachedEvent){
      return JSON.parse(cachedEvent)
    }else{
      try{
        const event = await Event.getById(id)

      const locations = await Location.getAll()
    
      
      let poster_data = event.poster_data
      if (event.poster_data){
        const posterBuffer = event.poster_data
        const posterBase64 = posterBuffer.toString('base64')
        poster_data = `data:image/jpeg;base64,${posterBase64}`
      }
      const location = locations.find(l => l.location_id === event.location_id)

        const returnEvent = {
            ...event,
            poster_data: poster_data,
            location: location
        }
        await client.set(key, JSON.stringify(returnEvent), {EXE: CACHE_TIME_TO_LIVE})
        return returnEvent
      }catch(e){
        console.log("Error getting event by id: " + e)
        throw e
      }
    }
}

const createEvent = async (body) => {

    await clearAllEventCache()

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
      capacity,
      deadline
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
      capacity,
      deadline
    })
  
};

const updateDeadline = async (deadline, eventId) => {
  const key = `event:${eventId}`
  await client.del(key)
  await clearAllEventCache()
  return await Event.updateDeadline(deadline, eventId)
}

const deleteEventById = async (eventId) => {
  const key = `event:${eventId}`
  await client.del(key)
  await clearAllEventCache()
  await EventAttendance.deleteByEventId(eventId)
  return await Event.deleteById(eventId)
}


module.exports = {
  getAllEvents,
  getEventById,
  createEvent, 
  updateDeadline,
  deleteEventById
}
