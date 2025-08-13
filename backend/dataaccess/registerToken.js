const db = require('../utils/db')

const getByEventIdAndEmail = async ({eventId, email}) => {
    const [rows] = await db.query(`SELECT * FROM register_tokens WHERE event_id = ? AND email = ?`, [eventId, email])
    if(!rows || rows.length < 1){
        return null
    }
    return rows[0]
}

const create = async ({eventId, email, token}) => {
    const [createResponse] = await db.query(`INSERT INTO register_tokens (event_id, email, token) VALUES (?, ?, ?)`, [eventId, email, token])
    return createResponse
}

const deleteByEventIdAndEmail = async (eventId, email) => {
    const [deleteResponse] = await db.query(`DELETE FROM register_tokens WHERE event_id = ? AND email = ?`, [eventId, email])
    return deleteResponse
}

module.exports = {
    getByEventIdAndEmail,
    create,
    deleteByEventIdAndEmail
}