const User = require('./../models/user_model');
const catchAync = require('./../utils/catchAsync');


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

exports.get_user = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'not yet created'
    })
};

exports.patch_user = (req, res) => {
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