// const fs = require('fs');


const Tour = require('./../models/tour_model')
const APIFeatures = require('../utils/APIFeatures')
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');


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

exports.get_all_tours = catchAsync(async (req, res, next) => {

    console.log(req.query);
    const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().pagination();
    const tours = await features.query;
    res
        .status(200)
        .json({
            status: 'success',
            // requestedAt: req.requestTime,
            results: tours.length,
            data: { tours }
        });

});

exports.get_tour = catchAsync(async (req, res, next) => {
    // console.log(req.params);
    const tour = await Tour.findById(req.params.id);
    // console.log(tour);
    if (!tour) {
        throw (new AppError('No tour found with that id', 404));
    }
    res
        .status(200)
        .json({
            status: 'success',
            data: { tour }
        });
    // if (id <= tours.length) {
    //     const tour = tours.find(el => el.id === id);
    //     res.status(200).json({
    //         status: 'success',
    //         data: {
    //             tours: tour
    //         }
    //     });
    // }
});

exports.patch_tour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res
        .status(200)
        .json({
            status: 'success',
            data: { tour }
        });

});
exports.post_tour = catchAsync(async (req, res, next) => {
    const new_tour = await Tour.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            new_tour
        }
    });

    // console.log(req.body);
    // const new_id = tours[tours.length - 1].id + 1;
    // const new_tour = Object.assign({ id: new_id }, req.body);

    // tours.push(new_tour);
    // fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
    //     res.status(201).json({
    //         status: 'success',
    //         data: {
    //             tour: new_tour
    //         }
    //     });
    // });
});


exports.del_tour = catchAsync(async (req, res, next) => {

    const new_tour = await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
        status: 'success',
        data: null
    });
});


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


