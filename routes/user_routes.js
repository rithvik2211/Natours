const express = require('express');

const authControllers = require('./../controllers/auth_controller')
const userControllers = require('./../controllers/user_controller')

const router = express.Router();
router.post('/signup', authControllers.signup);
router.post('/login', authControllers.login);
router.post('/forgot-password', authControllers.forgot_password);
router.patch('/reset-password/:token', authControllers.reset_password);

router.use(authControllers.protect)
router.get('/me', userControllers.get_me, userControllers.get_user);
router.patch('/update-password', authControllers.update_password);
router.patch('/update-me', userControllers.update_me);
router.delete('/delete-me', userControllers.delete_me);

router.use(authControllers.restrict_to('admin'));

router
    .route('/')
    .get(userControllers.get_all_users);

router
    .route('/:id')
    .get(userControllers.get_user)
    .patch(userControllers.update_user)
    .delete(userControllers.delete_user);


module.exports = router;