const express = require('express');
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');
const contactController = require('../controllers/contactController');

const router = express.Router();

// Public routes
router.get('/login', (req, res) => res.redirect('/admin'));
router.post('/login', adminController.loginAdmin);
router.get('/public-profile', adminController.getPublicProfile);
router.post('/contact', contactController.createContactMessage);

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

router.patch('/change-password', authController.changePassword);

router.get('/messages', contactController.getContactMessages);
router.delete('/messages/:id', contactController.deleteContactMessage);
router.patch('/messages/:id/read', contactController.markMessageRead);

module.exports = router;
