
const { request, json } = require('express');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');


const user_schema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'please tell us ur name!']
    },
    email: {
        type: String,
        required: [true, 'please tell us ur email!'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: String,
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'please provie your!'],
        minlength: 8,
        select: false
    },
    password_confirm: {
        type: String,
        required: [true, 'please provie your!'],
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: "Passwords don't match."

        }
    },
    password_changed_at: Date,
    password_reset_token: String,
    password_reset_expire: Date

});


user_schema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);

    this.password_confirm = undefined;
    next();
});

user_schema.methods.correct_password = function (candidate_password, user_password) {
    return bcrypt.compare(candidate_password, user_password);
}

user_schema.methods.changed_password_after = function (JWTTimestamp) {
    // console.log(this.password_changed_at)
    if (this.password_changed_at) {
        const password_changed_at = parseInt(this.password_changed_at.getTime() / 1000, 10);

        console.log(password_changed_at, JWTTimestamp);

        return JWTTimestamp < password_changed_at;
    }
}

user_schema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.password_changed_at = Date.now() - 1000;
    next();
});

user_schema.methods.create_password_reset_token = function () {
    const reset_token = crypto.randomBytes(32).toString('hex');
    this.password_reset_token = crypto.createHash('sha256').update(reset_token).digest('hex');

    this.password_reset_expire = Date.now() + 10 * 60 * 1000;

    return reset_token;
}




const User = mongoose.model('User', user_schema);

module.exports = User;