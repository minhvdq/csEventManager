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
    return rows[0]
}

const create = async (data) => {
    const { firstName, lastName, email, hashPassword, isAdmin } = userData
    const [result] = await db.query('INSERT INTO users (first_name, last_name, email, hash_password, is_admin) VALUES (?, ?, ?, ?, ?)', [firstName, lastName, email, hashPassword, isAdmin])
    return result
}

const deleteById = async (id) => {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id])
    return result
}

module.exports = {
    getAll,
    getById,
    getByEmail,
    create,
    deleteById
}