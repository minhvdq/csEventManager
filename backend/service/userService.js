const db = require('../utils/db')

const getAllUsers = async () => {
    const [rows] = await db.query('SELECT * FROM users')
    return rows
}

const getUserById = async () => {

}

const createUser = async () => {

}

const getUserByEmail = async () => {

}

const deleteUser = async () => {
    
}

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    getUserByEmail,
    deleteUser
}