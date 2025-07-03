const db = require('../utils/db')

const getAll = async () => {
    const [rows] = await db.query('SELECT * FROM locations')
    return rows
}

const getById = async (id) => {
    const [rows] = await db.query('SELECT * FROM locations WHERE location_id = ?', [id])
    return rows[0]
}

const create = async ({name, address, lat, lng, room}) => {
    const [result] = await db.query('INSERT INTO locations (place_name, address, lat, lng, room) VALUES (?, ?, ?, ?, ?)', [name, address, lat, lng, room])
    return result
}

module.exports = {
    getAll,
    getById,
    create
}