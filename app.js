const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');

const userRouter = require('./routes/userRoutes');
const uploadRouter = require('./routes/uploadRoutes');
const adminRouter = require('./routes/adminRoutes');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

// 1) GLOBAL MIDDLEWARES

// SET SECURITY HTTP HEADERS
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// USING THIS TO LIMIT THE API CALL FROM A SINGLE IP ADDRESS.
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many request from this IP. Please try again in an hour!'
});

app.use('/api', limiter);

// BODY PARSER, READING DATA FROM THE body INTO req.body
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// DATA SANITIZATION AGAINST NoSQL QUERY INJECTION
app.use(mongoSanitize());

// DATA SANITIZATION AGAINST XSS
app.use(xss());

// PREVENT PARAMETER POLLUTION
app.use(hpp());

// SERVING STATIC FILE
app.use(express.static(`${__dirname}/public`));

app.use(compression());

// TEST MIDDLEWARE
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// 3) ROUTES

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/api/v1', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Welcome to Flutter Developer Portfolio & Admin API!',
        endpoints: {
            admin: '/api/v1/admin',
            publicProfile: '/api/v1/admin/public-profile',
            uploadAvatar: '/api/v1/upload-avatar',
            users: '/api/v1/users'
        }
    });
});

app.use('/api/v1/users', userRouter);
app.use('/api/v1/upload-avatar', uploadRouter);
app.use('/api/v1/admin', adminRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE ? process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD) : "mongodb+srv://mahbubshishir973:mahbubullah@cluster0.3k09t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const { ensureDefaultAdmin } = require('./controllers/adminController');

mongoose.connect(DB)
    .then(async () => {
        console.log('DB connection successful!');
        await ensureDefaultAdmin();
    })
    .catch(err => {
        console.error('DB Connection Warning:', err.message);
    });

const port = process.env.PORT || 10000;

app.listen(port, '0.0.0.0', () => {
    console.log(`App running on port ${port}...`);
});

module.exports = app;