// const fs = require('fs');


const Tour = require('./../models/tour_model')
const APIFeatures = require('../utils/APIFeatures')
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handler_factory');


// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)); 


// Middleware

// exports.check_id = (req, res, next, val) => {
//     console.log(`Tour id is: ${val}`);
//     if (req.params.id * 1 > tours.length) {
//         return res.status(404).json({
//             status: "fail",
//             message: 'invalid ID'
//         });
//     };
//     next();
// }

// exports.check_body = (req, res, next) => {
//     if (!req.body.name || !req.body.price) {
//         return res.status(400).json({
//             message: 'missing name or price'
//         });
//         next();
//     }
// }

// Route Handlers 


exports.alias_top_tours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingAverage,summary,difficulty';
    next();
}


exports.genrate_error = catchAsync(async (req, res, next) => {
    throw new AppError('No tour found with that id', 404);
});

exports.get_all_tours = factory.get_all(Tour);

exports.get_tour = factory.get_one(Tour, 'reviews');

exports.patch_tour = factory.update_one(Tour);

exports.post_tour = factory.create_one(Tour);

exports.del_tour = factory.del_one(Tour);


exports.get_tour_stats = catchAsync(async (req, res, next) => {

    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                _id: '$difficulty',
                numTours: { $sum: 1 },
                numRating: { $sum: '$ratingsAverage' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        }
    ]);


    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    });

});


exports.get_monthly_plan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numToursStarts: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            $project: {
                _id: 0
            }
        },
        {
            $sort: { numToursStarts: -1 }
        },
        {
            $limit: 12
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            plan
        }
    });

});


exports.get_tours_within = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    const [lat, lng] = latlng.split(',');

    if (!lat || !lng) {
        return next(new AppError('please provide latitude and longitude in format lat,lng', 400));
    }

    const tours = await Tour.find({ startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } } });
    console.log(distance, lat, lng, unit);
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours
        }
    });
});

exports.get_distances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    // const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    const [lat, lng] = latlng.split(',');

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if (!lat || !lng) {
        return next(new AppError('please provide latitude and longitude in format lat,lng', 400));
    }

    const tours = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ]);

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours
        }
    });
});

