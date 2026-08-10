const express = require('express');
const uploadController = require('../controllers/uploadController');

const router = express.Router();

router
    .route('/')
    .get(uploadController.getAvatar)
    .post(
        uploadController.uploadAvatarPhoto,
        uploadController.resizeAvatarPhoto,
        uploadController.uploadAvatar
    )
    .delete(uploadController.resetAvatar);

module.exports = router;
