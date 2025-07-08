const db = require('../utils/db')

const getAll = async () => {
    const [rows] = await db.query(`SELECT * FROM event_attendance`)
    return rows
}

const getByEventId = async (eventId) => {
    const [rows] = await db.query(`SELECT * FROM event_attendance WHERE event_id = ?`, [eventId])
    return rows
}

const getByStudentId = async (studentId) => {
    const [rows] = await db.query(`SELECT * FROM event_attendance WHERE student_id = ?`, [studentId])
    return rows
}

const create = async (studentId, eventId) => {
    const [rows] = await db.query(`SELECT * FROM event_attendance WHERE student_id = ? AND event_id = ?`, [studentId, eventId]);
    
    if(rows && rows.length > 0){
        return null; // Already exists
    }

    const [response] = await db.query(`INSERT INTO event_attendance (student_id, event_id) VALUES (?, ?)`,[
        studentId,
        eventId
    ]);

    return response;
}

module.exports = {
    getAll,
    getByEventId,
    getByStudentId,
    create
}