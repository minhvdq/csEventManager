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
const authRouter = require('./controller/auth.route')
const photoRouter = require('./controller/photo')
const resourceRouter = require('./controller/resource')

const app = express();

// === CORS Configuration ===
const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://138.234.44.100',
    'http://cs100.cc.gettysburg.edu',
    'https://acm.gettysburg.edu',
    'https://acm.gettysburg.edu'
];

app.use((req, res, next) => {
    req.corsRequestUrl = req.originalUrl;
    next();
});

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            const err = new Error(`Not allowed by CORS: Origin '${origin}' tried to access '${this.req?.corsRequestUrl || '[unknown endpoint]'}'`);
            callback(err);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(middlewares.requestLogger);
app.use(middlewares.tokenExtractor);

// === API Routes ===
app.use('/eventHub/api/users', middlewares.adminAuth, userRouter);
app.use('/eventHub/api/events', eventRouter);
app.use('/eventHub/api/login', loginRouter);
app.use('/eventHub/api/locations', locationRouter);
app.use('/eventHub/api/students', studentRouter);
app.use('/eventHub/api/eventRegister', eventRegisterRouter);
app.use('/eventHub/api/photo', photoRouter);
app.use('/eventHub/api/resource', resourceRouter);
app.use('/eventHub/api/auth', authRouter)

// === Serve Static Files ===

app.use(
  '/eventHub',
  express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, filePath) => {
      // You can add headers for image files here if needed
      if (filePath.endsWith('.jpg') || filePath.endsWith('.png')) {
        res.setHeader('Content-Type', 'image/jpeg'); // or 'image/png'
      }
    }
  })
);

app.use(
  '/eventHub',
  express.static(path.join(__dirname, 'dist'), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      }
    }
  })
);

app.use('/eventHub', (req, res, next) => {
  // If request looks like a file, let static middleware handle it
  if (path.extname(req.path)) {
    return next();
  }
  res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

app.use('/eventHub/PasswordReset', (req, res) => {
  res.sendFile(path.join(__dirname, '/ui_assets/reset.html'))
})

app.use('/eventHub/PasswordResetRequest', (req, res) => {
  res.sendFile(path.join(__dirname, '/ui_assets/request.html'))
})

// === Error Handling Middleware (last!) ===
app.use(middlewares.unknownEndpoint);
app.use(middlewares.errorHandler);

module.exports = app;
