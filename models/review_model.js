const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const Tour = require('./tour_model');
const AppError = require('../utils/appError');


const review_schema = new mongoose.Schema({
    review: String,
    rating: {
        type: Number,
        required: [true, 'Please rate the tour.'],
        validate: {
            validator: function (val) {
                return val > 0 && val <= 5
            },
            message: 'Give a rating between 0and 5'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour.']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user.']
    }
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    });

review_schema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name email'
    });
    next();
});

review_schema.statics.cal_avg_ratings = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);
    // console.log(stats);

    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 3
        });
    }
};


review_schema.index({ tour: 1, user: 1 }, { unique: true });

review_schema.post('save', function () {
    this.constructor.cal_avg_ratings(this.tour);
});

review_schema.pre(/^findOneAnd/, async function (next) {
    this.r = await this.findOne();
    // console.log(this.r);
    next();
});

review_schema.post(/^findOneAnd/, async function () {
    await this.r.constructor.cal_avg_ratings(this.r.tour);
});

const Review = mongoose.model('Review', review_schema);

module.exports = Review;