const fs = require('fs');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Please upload an image file (PNG, JPG, WEBP, etc.).', 400), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

exports.uploadAvatarPhoto = upload.single('photo');

exports.resizeAvatarPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    const targetDir = path.join(__dirname, '..', 'public', 'img', 'users');
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    const filename = 'custom-avatar.jpg';
    const filePath = path.join(targetDir, filename);

    await sharp(req.file.buffer)
        .resize(600, 600, {
            fit: 'cover',
            position: 'center'
        })
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(filePath);

    req.avatarUrl = `/img/users/${filename}?t=${Date.now()}`;
    next();
});

exports.uploadAvatar = catchAsync(async (req, res, next) => {
    if (!req.file) {
        return next(new AppError('No photo provided. Please upload an image file.', 400));
    }

    res.status(200).json({
        status: 'success',
        message: 'Avatar uploaded successfully',
        data: {
            avatarUrl: req.avatarUrl
        }
    });
});

exports.getAvatar = catchAsync(async (req, res, next) => {
    const avatarPath = path.join(__dirname, '..', 'public', 'img', 'users', 'custom-avatar.jpg');
    const exists = fs.existsSync(avatarPath);

    res.status(200).json({
        status: 'success',
        data: {
            hasCustomAvatar: exists,
            avatarUrl: exists ? `/img/users/custom-avatar.jpg?t=${Date.now()}` : '/img/avatar.png'
        }
    });
});

exports.resetAvatar = catchAsync(async (req, res, next) => {
    const avatarPath = path.join(__dirname, '..', 'public', 'img', 'users', 'custom-avatar.jpg');
    if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
    }

    res.status(200).json({
        status: 'success',
        message: 'Avatar reset to default',
        data: {
            avatarUrl: '/img/avatar.png'
        }
    });
});
