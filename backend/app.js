const express = require('express')
const app = express()
const cors = require('cors')
const logger = require('./utils/logger')
const config = require('./utils/config')
const middlewares = require('./utils/middlewares')
const path = require('path')

// Import routes
const userRouter = require('./controller/user')
const eventRouter = require('./controller/event')
const loginRouter = require('./controller/login')

const allowedOrigins = [
    'http://localhost:5173',   // Vite dev server
    'http://127.0.0.1:5173',   // Vite dev server alternative
    'http://localhost:3000',   // Production
    'http://127.0.0.1:3000',   // Production alternative
    'https://rate-my-classes-gb.fly.dev' // Production domain
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    optionsSuccessStatus: 204
};

// Apply CORS with options
app.use(cors(corsOptions));

// Middleware
app.use(express.json())
app.use(middlewares.requestLogger)
app.use(middlewares.tokenExtractor)

// Register routes
app.use('/api/users', userRouter)
app.use('/api/events', eventRouter)
app.use('/api/login', loginRouter)

// Error handling middleware should be last
app.use(middlewares.unknownEndpoint)
app.use(middlewares.errorHandler)

module.exports = app