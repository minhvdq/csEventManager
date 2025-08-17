const db = require('../utils/db')

const getAll = async () => {
    const [photos] = await db.query('SELECT * FROM resources')
    return photos;
}

const getByEventId = async (id) => {
    const [rows] = await db.query('SELECT * FROM resources WHERE event_id = ?', [id])
    return rows
}

const create = async(body) => {
    const {
        eventId, 
        title, 
        description,
        fileUrl
    } = body;

    const [response] = await db.query('INSERT INTO resources (event_id, title, description, file_url) VALUES (?, ?, ?, ?)', [eventId, title, description, fileUrl]);
    return response;
}

const deleteResource = async(id) => {
    const [response] = await db.query('DELETE FROM resources WHERE resource_id = ?', [id]);
    return response;
}

module.exports = {
    getAll,
    getByEventId,
    create,
    deleteResource
}

