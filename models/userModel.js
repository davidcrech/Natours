const mongoose = require('mongoose');
const validator = require('validator');

// name, email, photo (string), password, passwordConfirm

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell your name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide a email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please, provide your email']
    },
    photo: String,
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password']
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
