const db = require('../db')

const getLocationById = async (id) => {
    const [rows] = await db.query('SELECT * FROM locations WHERE id = ?', [id])
    return rows[0]
}

const createLocation = async ({name, address, lat, lng, room}) => {
    const [result] = await db.query('INSERT INTO locations (place_name, address, lat, lng, room) VALUES (?, ?, ?, ?, ?)', [name, address, lat, lng, room])
    return result
}

module.exports = {
    getLocationById,
    createLocation
}