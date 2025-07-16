const User = require('../dataaccess/user')
const bcrypt = require('bcrypt')
const saltRounds = 10

const getAllUsers = async () => {
    return await User.getAll()
}

const getUserById = async (id) => {
    return await User.getById(id)
}

const createUser = async (userData) => {
    const { firstName, lastName, email, password, isAdmin } = userData
    const hashPassword = await bcrypt.hash(password, saltRounds)
    return await User.create({firstName, lastName, email, hashPassword, isAdmin})
}

const getUserByEmail = async (email) => {
    return await User.getByEmail(email)
}

const deleteUser = async (id) => {
    return await User.deleteById(id)
}

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    getUserByEmail,
    deleteUser
}