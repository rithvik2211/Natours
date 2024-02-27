const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const global_error_handler = require('./controllers/error_controller');

const tourRouter = require('./routes/tour_routes');
const userRouter = require('./routes/user_routes');

const app = express();

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});


app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/user', userRouter);

app.all('*', (req, res, next) => {
    // res.status(404).json({
    //     status: 'fail',
    //     message: `can't find ${req.originalUrl} on this server!`
    // });
    next(new AppError(`can't find ${req.originalUrl} on this server!`, 404));
});


app.use(global_error_handler);

module.exports = app;
