const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');


const tour_schema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        // validator: [validator.isAlpha, 'tour name must contain only characters']

    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    ratingsAverage: {
        type: Number,
        default: 3,
        min: [1, 'Rating must be above 1'],
        max: [5, 'rating must be below 5']
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty']
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    pricediscount: {
        type: Number,
        validate: {
            validator: function (val) {
                return val < this.price;
            },
            message: 'discount price ({VALUE}) should be price'
        }
    },
    summary: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have an image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    }

}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

tour_schema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

tour_schema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

// tour_schema.post('post', function(doc,next){
//     console.log(doc);
//     next()
// });

tour_schema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } });
    next();
})

tour_schema.pre('aggregate', function (next) {

    // pipeline is function which shows our input array 
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
    next();
});



const Tour = mongoose.model('Tour', tour_schema);

module.exports = Tour;