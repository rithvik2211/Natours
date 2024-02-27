const AppError = require("../utils/appError");


const handle_JWT_error = () => {
    return (new AppError('Invalid token. Please login again', 401));
}
const handle_JWTExpired_error = () => {
    return (new AppError('Token Expired. Please login again', 401));
}
const handle_cast_error = err => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
}

const handle_duplicate_error = err => {

    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    console.log(value);
    const message = `duplicate field value: ${value}. please use another value.`
    return new AppError(message, 400);
}

const handle_validation_error = err => {
    const errors = Object.values(err.errors).map(el => el.message);

    const message = `Invalid input data. ${errors.join('. ')}`;

    return new AppError(message, 400);

}
const send_error_dev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
}


const send_error_prod = (err, res) => {

    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    } else {
        console.log('ERROR :', err);

        res.status(500).json({
            status: 'error',
            message: 'Something wrong',
        });
    }
}


module.exports = (err, req, res, next) => {
    // console.log(err.stack);

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {

        send_error_dev(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };

        if (error.name === 'CastError') error = handle_cast_error(error);
        if (error.name === 'ValidationError') error = handle_validation_error(error);
        if (error.code === 11000) error = handle_duplicate_error(error);
        if (error.name === 'JsonWebTokenError') error = handle_JWT_error();
        if (error.name === 'TokenExpiredError') error = handle_JWTExpired_error();


        send_error_prod(error, res);
    }

};
