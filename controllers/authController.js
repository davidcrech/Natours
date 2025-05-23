const { promisify } = require('util');
const crypto = require('crypto');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role,
        passwordResetToken: req.body.passwordResetToken,
        passwordResetExpires: req.body.passwordResetExpires
    });

    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // check if email and password exists
    if (!email || !password) {
        return next(new AppError('pls provide email and password', 400));
    }
    // check if the user exister && pasword is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('incorrect email or password', 401));
    }

    // if everthing is check, send the token
    createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
    // get the token, check if its exists
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(new AppError('You are not logged in', 401));
    }
    // validate the token
    const decoded = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET,
        () => {}
    );
    console.log(decoded);
    // check if user still exists
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
        return next(new AppError('the user does no longer exists', 401));
    }
    // check if user changed password after jwt token was issued
    if (freshUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('user recently changed password', 401));
    }

    // grant access to protected
    req.user = freshUser;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(
                    'you do not have permission to perform this action',
                    403
                )
            );
        }

        next();
    };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new AppError('there is no user with that email', 404));
    }

    //generate random token reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // send it to users email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passConfirm to ${resetURL}\nIf you didnt forget, please ignore this email`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token',
            message
        });

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email'
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new AppError('there was an error sending the email', 500));
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // get a user based on token
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    // if token has not expired, and theres user, set new password

    if (!user) {
        return next(new AppError('token is expired', 400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // update changed password

    // log the user, send JWT
    createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    // get the user from collection
    const user = await User.findById(req.user.id).select('+password');
    console.log('Senha vinda do body:', req.body.passwordCurrent);
    console.log('Senha do banco:', user.password);

    // check if POSTed password is correct
    if (
        !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
        return next(new AppError('password is incorrect', 401));
    }

    // if so, update the password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;

    await user.save();

    // log user in, send JWT
    createSendToken(user, 200, res);
});
