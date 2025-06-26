const db = require('../utils/db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const config = require('../utils/config')

const login = async ({email, password}) => {
    if(!email || !password) {
        throw new Error('Email and password are required')
    }
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email])
    const user = rows[0]
    if (!user) {
        throw new Error('User not found')
    }
    const passwordMatch = await bcrypt.compare(password, user.hash_password)
    if (!passwordMatch) {
        throw new Error('Invalid password')
    }

    const userForToken = {
        id: user.id,
        email: user.email,
        isAdmin: user.is_admin
    }
    const token = jwt.sign(userForToken, config.SECRET)
    return { token, email: user.email, isAdmin: user.is_admin }
}

module.exports = { login }