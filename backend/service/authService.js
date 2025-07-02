const db = require('../utils/db')
const crypto = require('crypto')
const bcrypt = require('bcrypt')

const requestVerifyEmail = async (email) => { 
    let token = await db.query(`SELECT * FROM `)
}