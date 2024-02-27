
const express = require('express');
const tourController = require('./../controllers/tour_controller')
const auth_controller = require('./../controllers/auth_controller');
const router = express.Router();

// router.param('id', tourController.check_id);

router.route('/top-5-cheap').get(tourController.alias_top_tours, tourController.get_all_tours);


router.route('/tour-stats').get(auth_controller.protect, tourController.get_tour_stats);
router.route('/monthly-plans/:year').get(tourController.get_monthly_plan);
router.route('/error').get(tourController.genrate_error);


router
    .route('/')
    .get(auth_controller.protect, tourController.get_all_tours)
    .post(tourController.post_tour);

router
    .route('/:id')
    .get(tourController.get_tour)
    .patch(tourController.patch_tour)
    .delete(auth_controller.protect, auth_controller.restrict_to('admin', 'lead-guide'), tourController.del_tour);

module.exports = router;