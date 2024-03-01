const express = require('express');

const auth_controller = require('./../controllers/auth_controller');
const review_controller = require('./../controllers/review_controller');


const router = express.Router({ mergeParams: true });

router.use(auth_controller.protect)

router
    .route('/')
    .get(review_controller.get_all_reviews)
    .post(auth_controller.restrict_to('user'), review_controller.set_user_and_tour_details, review_controller.create_review);
router
    .route('/:id')
    .delete(auth_controller.restrict_to('user', 'admin'), review_controller.delete_review)
    .patch(auth_controller.restrict_to('user', 'admin'), review_controller.update_review)
    .get(review_controller.get_review);


module.exports = router;