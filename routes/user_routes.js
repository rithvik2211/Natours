const express = require('express');

const authControllers = require('./../controllers/auth_controller')
const userControllers = require('./../controllers/user_controller')

const router = express.Router();

router.post('/signup', authControllers.signup);
router.post('/login', authControllers.login);


router.post('/forgot-password', authControllers.forgot_password);
router.patch('/reset-password/:token', authControllers.reset_password);
router.patch('/update-password', authControllers.protect, authControllers.update_password);

router.patch('/update-me', authControllers.protect, userControllers.update_me);
router.delete('/delete-me', authControllers.protect, userControllers.delete_me);


router
    .route('/')
    .get(userControllers.get_all_users)
    .post(userControllers.post_user);

router
    .route('/:id')
    .get(userControllers.get_user)
    .patch(userControllers.patch_user);


module.exports = router;