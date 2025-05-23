const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const express = require('express');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1) GLBOAL MIDDLEWARES
// security http headers
app.use(helmet());

// dev login
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// rate limit
const limiter = rateLimit({
    max: 100,
    windowsMs: 60 * 60 * 1000,
    message: 'too many request, try again in  1 hour'
});

app.use('/api', limiter);

// body parser, reads data from body into req.body
app.use(
    express.json({
        limit: '10kb'
    })
);

// serving static files
app.use(express.static(`${__dirname}/public`));

// app.use((req, res, next) => {
//     req.requestTime = new Date().toISOString();
//     console.log(req.headers);
//     next();
// });

// 4) ROUTES

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
