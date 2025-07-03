const db = require('../utils/db')
const crypto = require('crypto')
const bcrypt = require('bcrypt')
const {backendBase} = require('../utils/homeUrl')

const requestVerifyEmail = async (email, event_id) => { 
    await db.query(`DELETE FROM Token WHERE (email = ?, event_id = ?)`, [email, event_id])

    const verifyToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = await bcrypt.hash(verifyToken, 10)

    const savedTokenResponse = await db.query(`INSERT INTO Token (email, token, event_id) VALUES (?, ?, ?)`, [email, hashedToken, event_id])

    const link = `${backendBase}/verify`
}