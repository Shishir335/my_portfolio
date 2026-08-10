const fs = require('fs');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Ensure an initial admin account exists for easy login
const ensureDefaultAdmin = async () => {
    try {
        const admin = await User.findOne({ email: 'admin@portfolio.dev' }).select('+password');
        if (!admin) {
            await User.create({
                name: 'Flutter Developer',
                email: 'admin@portfolio.dev',
                password: 'AdminPass123!',
                confirmPassword: 'AdminPass123!',
                role: 'admin',
                gender: 'male',
                birthDate: new Date('1998-05-15')
            });
            console.log('Default admin account created: admin@portfolio.dev / AdminPass123!');
        } else {
            const isMatch = await admin.correctPassword('AdminPass123!', admin.password);
            if (!isMatch) {
                admin.password = 'AdminPass123!';
                admin.confirmPassword = 'AdminPass123!';
                await admin.save();
                console.log('Default admin password reset to: AdminPass123!');
            }
        }
    } catch (err) {
        console.error('Auto-seed admin warning:', err.message);
    }
};

exports.ensureDefaultAdmin = ensureDefaultAdmin;

const signToken = id => jwt.sign({ id }, process.env.JWT_SECRET || 'super-secret-jwt-key-portfolio-2026', {
    expiresIn: process.env.JWT_EXPIRES_IN || '90d'
});

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Only image files are allowed!', 400), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
});

exports.uploadProfilePhoto = upload.single('photo');

exports.resizeProfilePhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    const targetDir = path.join(__dirname, '..', 'public', 'img', 'users');
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    const filename = 'custom-avatar.jpg';
    const filePath = path.join(targetDir, filename);

    await sharp(req.file.buffer)
        .resize(600, 600, { fit: 'cover', position: 'center' })
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(filePath);

    req.body.photo = `/img/users/${filename}?t=${Date.now()}`;
    next();
});

exports.loginAdmin = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    const cleanEmail = email.toLowerCase().trim();

    if (cleanEmail === 'admin@portfolio.dev') {
        await ensureDefaultAdmin();
    }

    const user = await User.findOne({ email: cleanEmail }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    if (user.role !== 'admin' && user.role !== 'dev') {
        return next(new AppError('Access denied. Only admin users can log in.', 403));
    }

    // Auto-hash plain text passwords manually created in DB
    if (!user.password.startsWith('$2a$') && !user.password.startsWith('$2b$') && !user.password.startsWith('$2y$')) {
        user.password = password;
        user.confirmPassword = password;
        await user.save();
    }

    const token = signToken(user._id);
    user.password = undefined;

    res.status(200).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
});

exports.getProfile = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    const customAvatarPath = path.join(__dirname, '..', 'public', 'img', 'users', 'custom-avatar.jpg');
    let photoUrl = user.photo;
    if (fs.existsSync(customAvatarPath)) {
        photoUrl = `/img/users/custom-avatar.jpg?t=${Date.now()}`;
    } else if (!photoUrl || photoUrl === 'profile.png') {
        photoUrl = '/img/avatar.png';
    }

    res.status(200).json({
        status: 'success',
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                photo: photoUrl,
                birthDate: user.birthDate ? user.birthDate.toISOString().split('T')[0] : '',
                gender: user.gender || 'prefer-not-to-say',
                aboutBadge: user.aboutBadge || 'Available for Senior Flutter & Mobile Engineering Roles',
                aboutTitle: user.aboutTitle || 'Crafting 60 FPS Cross-Platform Mobile Apps',
                aboutBio: user.aboutBio || 'Senior Flutter & Dart Developer specializing in pixel-perfect UI, clean architecture, Riverpod/BLoC state management, and seamless Node.js REST API integrations for iOS, Android & Web.',
                statYearsExp: user.statYearsExp || '4+',
                statApps: user.statApps || '25+',
                statCrashFree: user.statCrashFree || '99.9%',
                statUsers: user.statUsers || '100k+'
            }
        }
    });
});

exports.updateProfile = catchAsync(async (req, res, next) => {
    const fieldsToUpdate = {};
    if (req.body.name !== undefined) fieldsToUpdate.name = req.body.name;
    if (req.body.birthDate !== undefined) {
        fieldsToUpdate.birthDate = req.body.birthDate ? req.body.birthDate : null;
    }
    if (req.body.gender !== undefined) fieldsToUpdate.gender = req.body.gender;
    if (req.body.photo !== undefined) fieldsToUpdate.photo = req.body.photo;
    if (req.body.aboutBadge !== undefined) fieldsToUpdate.aboutBadge = req.body.aboutBadge;
    if (req.body.aboutTitle !== undefined) fieldsToUpdate.aboutTitle = req.body.aboutTitle;
    if (req.body.aboutBio !== undefined) fieldsToUpdate.aboutBio = req.body.aboutBio;
    if (req.body.statYearsExp !== undefined) fieldsToUpdate.statYearsExp = req.body.statYearsExp;
    if (req.body.statApps !== undefined) fieldsToUpdate.statApps = req.body.statApps;
    if (req.body.statCrashFree !== undefined) fieldsToUpdate.statCrashFree = req.body.statCrashFree;
    if (req.body.statUsers !== undefined) fieldsToUpdate.statUsers = req.body.statUsers;

    const updatedUser = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });

    const customAvatarPath = path.join(__dirname, '..', 'public', 'img', 'users', 'custom-avatar.jpg');
    let photoUrl = updatedUser.photo;
    if (fs.existsSync(customAvatarPath)) {
        photoUrl = `/img/users/custom-avatar.jpg?t=${Date.now()}`;
    } else if (!photoUrl || photoUrl === 'profile.png') {
        photoUrl = '/img/avatar.png';
    }

    res.status(200).json({
        status: 'success',
        message: 'Profile updated successfully',
        data: {
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                photo: photoUrl,
                birthDate: updatedUser.birthDate ? updatedUser.birthDate.toISOString().split('T')[0] : '',
                gender: updatedUser.gender || 'prefer-not-to-say',
                aboutBadge: updatedUser.aboutBadge || 'Available for Senior Flutter & Mobile Engineering Roles',
                aboutTitle: updatedUser.aboutTitle || 'Crafting 60 FPS Cross-Platform Mobile Apps',
                aboutBio: updatedUser.aboutBio || 'Senior Flutter & Dart Developer specializing in pixel-perfect UI, clean architecture, Riverpod/BLoC state management, and seamless Node.js REST API integrations for iOS, Android & Web.',
                statYearsExp: updatedUser.statYearsExp || '4+',
                statApps: updatedUser.statApps || '25+',
                statCrashFree: updatedUser.statCrashFree || '99.9%',
                statUsers: updatedUser.statUsers || '100k+'
            }
        }
    });
});

exports.getPublicProfile = catchAsync(async (req, res, next) => {
    // Find most recently updated admin user or active user
    let user = await User.findOne({ role: 'admin' }).sort({ updatedAt: -1, _id: -1 });
    if (!user) {
        user = await User.findOne().sort({ updatedAt: -1, _id: -1 });
    }

    const customAvatarPath = path.join(__dirname, '..', 'public', 'img', 'users', 'custom-avatar.jpg');
    const hasCustomFile = fs.existsSync(customAvatarPath);
    const photoUrl = hasCustomFile
        ? `/img/users/custom-avatar.jpg?t=${Date.now()}`
        : (user && user.photo && user.photo !== 'profile.png' ? user.photo : '/img/avatar.png');

    res.status(200).json({
        status: 'success',
        data: {
            name: user ? user.name : 'Flutter Developer',
            photo: photoUrl,
            birthDate: user && user.birthDate ? user.birthDate.toISOString().split('T')[0] : '',
            gender: user && user.gender ? user.gender : 'prefer-not-to-say',
            aboutBadge: user && user.aboutBadge ? user.aboutBadge : 'Available for Senior Flutter & Mobile Engineering Roles',
            aboutTitle: user && user.aboutTitle ? user.aboutTitle : 'Crafting 60 FPS Cross-Platform Mobile Apps',
            aboutBio: user && user.aboutBio ? user.aboutBio : 'Senior Flutter & Dart Developer specializing in pixel-perfect UI, clean architecture, Riverpod/BLoC state management, and seamless Node.js REST API integrations for iOS, Android & Web.',
            statYearsExp: user && user.statYearsExp ? user.statYearsExp : '4+',
            statApps: user && user.statApps ? user.statApps : '25+',
            statCrashFree: user && user.statCrashFree ? user.statCrashFree : '99.9%',
            statUsers: user && user.statUsers ? user.statUsers : '100k+'
        }
    });
});
