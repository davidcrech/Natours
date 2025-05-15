
const morgan = require('morgan');
const express = require('express');

const tourRouter = require('./routes/tour');
const userRouter = require('./routes/user');

const app = express();

// 1) MIDDLEWARES

app.use(morgan('dev'));
app.use(express.json());

// 4) ROUTES

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter)

module.exports = app;
