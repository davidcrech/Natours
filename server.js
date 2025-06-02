const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');

// console.log(process.env);
const DB = process.env.DATABASE;

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
    .then(() => console.log('db connection successful'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`app running on ${port}...`);
});

process.on('unhandledRejection', (err) => {
    console.log('UNHANDLER REJECTION');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});
