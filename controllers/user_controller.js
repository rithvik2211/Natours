const AppError = require('../utils/appError');
const User = require('./../models/user_model');
const catchAync = require('./../utils/catchAsync');


const filerObj = (obj, ...allowed_fields) => {
    let new_obj = {}
    Object.keys(obj).forEach(el => {
        if (allowed_fields.includes(el)) new_obj[el] = obj[el];
    });

    return new_obj;
}

// Route Handlers 
exports.get_all_users = catchAync(async (req, res, next) => {
    const users = await User.find();
    res
        .status(200)
        .json({
            status: 'success',
            // requestedAt: req.requestTime,
            results: users.length,
            data: { users }
        });
});

exports.update_me = catchAync(async (req, res, next) => {
    if (req.body.password || req.body.password_confirm) {
        return next(new AppError('This route is not for password updtaes', 400));
    };

    const filtered_body = filerObj(req.body, 'name', 'email');
    const updated_user = await User.findByIdAndUpdate(req.user.id, filtered_body, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        status: 'success',
        data: {
            user: updated_user
        }
    });

});

exports.get_user = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'not yet created'
    })
};

exports.update_user = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'not yet created'
    })
};

exports.post_user = (req, res) => {
    // console.log(req.body);
    res.status(500).json({
        status: 'error',
        message: 'not yet created'
    })
};

exports.patch_user = (req, res) => {
    // console.log(req.body);
    res.status(500).json({
        status: 'error',
        message: 'not yet created'
    })
};

exports.delete_me = catchAync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success',
        data: null
    });
});