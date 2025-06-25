const db = require('../utils/db')

const getAllUsers = async () => {
    const [rows] = await db.query('SELECT * FROM users')
    return rows
}

const getUserById = async () => {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id])
    return rows[0]
}

const createUser = async () => {
    const [result] = await db.query('INSERT INTO users (first_name, last_name, email, hash_password, is_admin) VALUES (?, ?, ?, ?, ?)', [firstName, lastName, email, hashPassword, isAdmin])
    return result
}

const getUserByEmail = async (email) => {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email])
    return rows[0]
}

const deleteUser = async (id) => {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id])
    return result
}

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    getUserByEmail,
    deleteUser
}