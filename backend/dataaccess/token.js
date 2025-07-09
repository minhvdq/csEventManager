const db = require('../utils/db')

const getByUserId = async (userId) => {
    const [rows] = await db.query(`SELECT * FROM tokens WHERE userId = ?`, [userId])
    if(!rows || rows.length < 1){
        return null
    }
    return rows[0]
}

const create = async (userId, token) => {
    const [createResponse] = await db.query(`INSERT INTO tokens (userId, token) VALUES (?, ?)`, [userId, token])
    return createResponse
}

const deleteById = async (id) => {
    const [deleteResponse] = await db.query(`DELETE FROM tokens WHERE id = ?`, [id])
    return deleteResponse
}

module.exports = {
    getByUserId,
    create,
    deleteById
}