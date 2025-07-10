const db = require('../utils/db')

const getAll = async () => {
    const [events] = await db.query('SELECT * FROM events')
    return events;
}

const getById = async (id) => {
    const [rows] = await db.query('SELECT * FROM events WHERE event_id = ?', [id])
    return rows[0]
}

const create = async (body) => {
    const{
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
    } = body
    const [result] = await db.query(
      `INSERT INTO events (name, description, location_id, start_time, end_time, need_resume, need_major, on_campus, is_colloquium, created_by, poster_data, capacity, deadline) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
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
      ]
    );
  
    return result;
};

const updateDeadline = async (deadline, eventId) => {
  const [response] = await db.query(`UPDATE events SET deadline = ? WHERE event_id = ?`, [deadline, eventId])
  return response
}

const deleteById = async (eventId) => {
  const [response] = await db.query(`DELETE FROM events WHERE event_id = ?`, [eventId])
  return response
}


module.exports = {
    getAll,
    getById,
    create,
    updateDeadline,
    deleteById
}
