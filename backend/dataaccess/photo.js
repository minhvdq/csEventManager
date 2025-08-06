const db = require('../utils/db')

const getAll = async () => {
    const [photos] = await db.query('SELECT * FROM photos')
    return photos;
}

const getByEventId = async (id) => {
    const [rows] = await db.query('SELECT * FROM photos WHERE event_id = ?', [id])
    return rows
}

const create = async(body) => {
    const {
        eventId, 
        photoData, 
        caption
    } = body;

    const [response] = await db.query('INSERT INTO photos (event_id, photo_data, caption) VALUES (?, ?, ?)', [eventId, photoData, caption]);
    return response;
}

const deletePhoto = async(id) => {
    const [response] = await db.query('DELETE FROM photos WHERE photo_id = ?', [id]);
    return response;
}

module.exports = {
    getAll,
    getByEventId,
    create,
    deletePhoto
}

