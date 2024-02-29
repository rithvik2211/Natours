
const Review = require('./../models/review_model')
// const APIFeatures = require('../utils/APIFeatures')
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');




exports.get_all_reviews = catchAsync(async (req, res, next) => {
    const review = await Review.find();
    console.log(req);
    res.status(200).json({
        status: 'success',
        results: review.length,
        data: {
            review
        }
    });
});

exports.create_review = catchAsync(async (req, res, next) => {
    const new_review = await Review.create({
        review: req.body.review,
        rating: req.body.rating,
        tour: req.body.tour,
        user: req.user._id
    });

    res.status(201).json({
        status: 'success',
        data: {
            new_review
        }
    });
});


