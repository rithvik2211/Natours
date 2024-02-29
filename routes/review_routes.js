const express = require('express');

const auth_controller = require('./../controllers/auth_controller');
const review_controller = require('./../controllers/review_controller');


const router = express.Router();

router
    .route('/')
    .get(auth_controller.protect, review_controller.get_all_reviews)
    .post(auth_controller.protect, auth_controller.restrict_to('user'), review_controller.create_review);


module.exports = router;