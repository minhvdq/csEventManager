const db = require('../utils/db')

const getAll = async () => {
    const [rows] = await db.query('SELECT * FROM users')
    return rows
}

const getById = async (id) => {
    const [rows] = await db.query('SELECT * FROM users WHERE user_id = ?', [id])
    return rows[0]
}

const getByEmail = async (email) => {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email])
    if(!rows || rows.length < 1){
        return null
    }
    return rows[0]
}

const updatePasswordById = async (hashPassword, id) => {
    const [updateResponse] = await db.query(`UPDATE users SET hash_password = ? WHERE user_id = ?`, [hashPassword, id])
    return updateResponse
}

const create = async (data) => {
    const { firstName, lastName, email, hashPassword, isAdmin } = data
    const [result] = await db.query('INSERT INTO users (first_name, last_name, email, hash_password, is_admin) VALUES (?, ?, ?, ?, ?)', [firstName, lastName, email, hashPassword, isAdmin])
    return result
}

const deleteById = async (id) => {
    const [result] = await db.query('DELETE FROM users WHERE user_id = ?', [id])
    return result
}

module.exports = {
    getAll,
    getById,
    getByEmail,
    create,
    updatePasswordById,
    deleteById
}