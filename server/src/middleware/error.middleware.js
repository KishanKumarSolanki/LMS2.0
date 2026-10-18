const ENV = require('../config/env');

const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
}

const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode
        || err.status
        || (err.name === 'ValidationError' ? 400 : null)
        || (err.code === 11000 ? 409 : null)
        || (res.statusCode === 200 ? 500 : res.statusCode);
    const message = err.code === 11000
        ? (err.keyPattern?.email ? 'Email is already registered' : 'A record with this value already exists')
        : err.message;
    res.status(statusCode);
    res.json({
        message,
        stack: ENV.NODE_ENV === 'production' ? null : err.stack
    });
}

module.exports = {notFound, errorHandler};