const User = require('./../models/user_model');
const catchAync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const crypto = require('crypto');
const send_email = require('./../utils/email');

const { promisify } = require('util');
const { AsyncResource } = require('async_hooks');

const create_send_token = (user, statuscode, res) => {

    const token = signToken(user._id);
    const cookie_optns = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRY * 24 * 60 * 60 * 1000),
        // secure: true,
        httpOnly: true
    }

    if (process.env.NODE_ENV === "production") cookie_optns.secure = true;


    res.cookie('jwt', token, cookie_optns);

    user.password = undefined;

    res.status(200).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
}

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE })
}


exports.signup = catchAync(async (req, res, next) => {
    const new_user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        password_confirm: req.body.password_confirm,
        password_changed_at: req.body.password_changed_at,
        role: req.body.role
    });

    create_send_token(new_user, 201, res);


});



exports.login = catchAync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correct_password(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    create_send_token(user, 200, res);
});

exports.protect = catchAync(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // console.log(token);
    if (!token) {
        return next(new AppError('You are not logged in. please log in to get access', 401));
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // console.log(decoded);


    const fresh_user = await User.findById(decoded.id);
    if (!fresh_user) {
        return next(new AppError('User no longer exists.', 401));
    }


    if (fresh_user.changed_password_after(decoded.iat)) {
        return next(new AppError('user changed password recently. please login again.', 401));
    };

    req.user = fresh_user;
    next();
});


exports.restrict_to = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You dont have permission.', 403));
        }

        next();
    }
}


exports.forgot_password = catchAync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('There is no user with that email'));
    }

    const reset_token = user.create_password_reset_token();
    await user.save({ validateBeforeSave: false });


    const reset_url = `${req.protocol}://${req.get('host')}/api/v1/user/reset-password/${reset_token}`;

    const message = `forgot your password? submit a Patch request with new password and confirm password to ${reset_url}. \nIf you didnt forget your password please ignore this email.`;


    try {
        await send_email({
            email: user.email,
            subject: 'Your password reset token is valid for 10 minutes only.',
            message: message
        });

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email'
        })

    } catch (error) {
        user.password_reset_token = undefined,
            user.password_reset_expire = undefined
        await user.save({ validateBeforeSave: false });
        next(new AppError("There was an error sending email. Try again later!"));
    }
})

exports.reset_password = catchAync(async (req, res, next) => {

    const hashed_token = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({ password_reset_token: hashed_token, password_reset_expire: { $gt: Date.now() } });

    if (!user) {
        return next(new AppError('Token is invalid or has expired', 400));
    }

    user.password = req.body.password;
    user.password_confirm = req.body.password_confirm;
    user.password_reset_expire = undefined;
    user.password_reset_token = undefined;

    await user.save();

    create_send_token(user, 200, res);

});


exports.update_password = catchAync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');
    // const password = req.body.password;

    if (!(await user.correct_password(req.body.current_password, user.password))) {
        return next(new AppError('User not found.', 401));
    }



    user.password = req.body.password;
    user.password_confirm = req.body.password_confirm;

    await user.save();

    create_send_token(user, 200, res);


});