const express = require('express');
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');

const router = express.Router();

// Public routes
router.get('/login', (req, res) => res.redirect('/admin'));
router.post('/login', adminController.loginAdmin);
router.get('/public-profile', adminController.getPublicProfile);

// Protected routes (Admin authentication & role required)
router.use(authController.protect);
router.use(authController.restrictTo('admin', 'dev'));

router
    .route('/profile')
    .get(adminController.getProfile)
    .patch(
        adminController.uploadProfilePhoto,
        adminController.resizeProfilePhoto,
        adminController.updateProfile
    );

module.exports = router;
