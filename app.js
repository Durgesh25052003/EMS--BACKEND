const bodyParser = require('body-parser');
const express = require('express');
const userRouter = require('./Routers/userRoutes');
const leaveRouter = require('./Routers/leaveRoutes');
const eventRouter = require('./Routers/eventRoutes');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const app = express();

app.use(cors({
  origin:true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie', 'Authorization', 'Access-Control-Allow-Origin'],
}));

app.options('*', cors());


// Security middleware
app.use(helmet());  // Adds various HTTP headers for security

// Rate limiting
const limiter = rateLimit({
  max: 100, // limit each IP to 100 requests per windowMs
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XS
// Regular middleware
app.use(cookieParser());
app.use(bodyParser.json({ limit: '10kb' }));  // Body size limit
app.use(xss());


// Add this after cors middleware  // Enable pre-flight for all routes

app.use(express.static('public'));

// Routes
app.use('/api/v1/user', userRouter);
app.use('/api/v1/leave', leaveRouter);
app.use('/api/v1/events', eventRouter);

module.exports = app;
