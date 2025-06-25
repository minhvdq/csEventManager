require('dotenv').config()

// const MONGODB_URI = process.env.MONGODB_URI
const PORT = process.env.PORT
const DB_HOST = process.env.DB_HOST
const DB_USERNAME = process.env.DB_USERNAME
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_PORT = process.env.DB_PORT
const DB_DATABASE = process.env.DB_DATABASE

module.exports = { 
                    // MONGODB_URI, 
                    PORT, 
                    DB_HOST,
                    DB_USERNAME,
                    DB_PASSWORD,
                    DB_PORT,
                    DB_DATABASE
                    // SECRET, 
                    // EMAIL_PASSWORD, 
                    // ADMIN_SECRET_KEY, 
                    // EMAIL_USER, 
                    // EMAIL_HOST 
                }