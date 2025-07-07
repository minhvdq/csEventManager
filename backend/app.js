const express = require('express');
const cors = require('cors');
const path = require('path');
const logger = require('./utils/logger');
const config = require('./utils/config');
const middlewares = require('./utils/middlewares');

// Import routes
const userRouter = require('./controller/user');
const eventRouter = require('./controller/event');
const loginRouter = require('./controller/login');
const locationRouter = require('./controller/location');
const studentRouter = require('./controller/student');
const eventRegisterRouter = require('./controller/eventRegister');

const app = express();

// === CORS Configuration ===
const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
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
    optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(middlewares.requestLogger);
app.use(middlewares.tokenExtractor);

// === API Routes ===
app.use('/api/users', userRouter);
app.use('/api/events', eventRouter);
app.use('/api/login', loginRouter);
app.use('/api/locations', locationRouter);
app.use('/api/students', studentRouter);
app.use('/api/eventRegister', eventRegisterRouter);

// === Serve Static Files ===
app.use(express.static(path.join(__dirname, 'dist'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        } else if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
    }
}));

// === React SPA Fallback Route (Safe from path-to-regexp errors) ===
// Matches only non-API, non-file routes
app.get(/^\/(?!api|.*\..*).*/, (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

// === Error Handling Middleware (last!) ===
app.use(middlewares.unknownEndpoint);
app.use(middlewares.errorHandler);

module.exports = app;
