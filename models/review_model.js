const mongoose = require('mongoose');



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



const Review = mongoose.model('Review', review_schema);

module.exports = Review;