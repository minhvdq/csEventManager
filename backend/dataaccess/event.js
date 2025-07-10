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
        capacity
    } = body
    const [result] = await db.query(
      `INSERT INTO events (name, description, location_id, start_time, end_time, need_resume, need_major, on_campus, is_colloquium, created_by, poster_data, capacity) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        capacity
      ]
    );
  
    return result;
  };

module.exports = {
    getAll,
    getById,
    create
}
