const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');

process.on('unhandledRejection', (err) => {
    console.log('UNHANDLER REJECTION');
    console.log(err.name, err.message);
    console.log(err.stack);
    process.exit(1);
});

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
