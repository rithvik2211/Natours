
const { populate } = require('../models/review_model');
const AppError = require('../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const APIFeatures = require('./../utils/APIFeatures');


exports.del_one = MODEL => catchAsync(async (req, res, next) => {
    console.log(req.params.id)
    const doc = await MODEL.findByIdAndDelete(req.params.id);

    if (!doc) {
        return next(new AppError('No document found with that id', 404));
    }
    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.update_one = MODEL => catchAsync(async (req, res, next) => {
    const doc = await MODEL.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });


    if (!doc) {
        return next(new AppError('No document found with that id', 404));
    }

    res
        .status(200)
        .json({
            status: 'success',
            data: doc
        });

});


exports.create_one = MODEL => catchAsync(async (req, res, next) => {
    const doc = await MODEL.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            doc
        }
    });
});

exports.get_one = (MODEL, populate_optns) => catchAsync(async (req, res, next) => {
    // console.log(req.params);

    let query = await MODEL.findById(req.params.id);
    // console.log(query);
    if (!query) {
        throw (new AppError('No document found with that id', 404));
    }
    if (populate_optns) query = query.populate(populate_optns);

    const doc = await query;
    // console.log(tour);
    res
        .status(200)
        .json({
            status: 'success',
            data: doc
        });
});


exports.get_all = MODEL => catchAsync(async (req, res, next) => {
    let filter = {}
    if (req.params.tourId) filter = { tour: req.params.tourId };


    const features = new APIFeatures(MODEL.find(filter), req.query).filter().sort().limitFields().pagination();
    const doc = await features.query;


    res
        .status(200)
        .json({
            status: 'success',
            results: doc.length,
            data: doc
        });

});

