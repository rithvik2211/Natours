const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongo_sanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const fs = require('fs');
const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');


const AppError = require('./utils/appError');
const global_error_handler = require('./controllers/error_controller');


const tourRouter = require('./routes/tour_routes');
const userRouter = require('./routes/user_routes');
const reviewRouter = require('./routes/review_routes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(
    helmet({
        contentSecurityPolicy: false, // Disable CSP middleware
    })
);

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again later.'
});


app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// PREVENT NOSQL INJECTION
app.use(mongo_sanitize());

// PREVENT XSS
app.use(xss());

// PREVENT PARAMETER POLLUTION
app.use(hpp({
    whitelist: [
        'duration',
        'ratingQunatity',
        'ratingAverage',
        'maxgroupSize',
        'difficulty',
        'price'
    ]
}));


app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
    // res.status(404).json({
    //     status: 'fail',
    //     message: `can't find ${req.originalUrl} on this server!`
    // });  
    next(new AppError(`can't find ${req.originalUrl} on this server!`, 404));
});


app.use(global_error_handler);

module.exports = app;
