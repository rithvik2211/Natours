
const Review = require('./../models/review_model')
// const APIFeatures = require('../utils/APIFeatures')
// const catchAsync = require('./../utils/catchAsync');
const factory = require('./handler_factory');





exports.get_all_reviews = factory.get_all(Review);

exports.set_user_and_tour_details = (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId;

    req.body.user = req.user._id;

    next();

}

exports.create_review = factory.create_one(Review);
exports.delete_review = factory.del_one(Review);
exports.update_review = factory.update_one(Review);
exports.get_review = factory.get_one(Review);