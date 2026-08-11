const fs = require('fs');
const path = require('path');
const multer = require('multer');
let sharp;
try {
    sharp = require('sharp');
} catch (e) {
    sharp = null;
}
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

exports.uploadProfilePhoto = upload.any();

exports.resizeProfilePhoto = catchAsync(async (req, res, next) => {
    if (!req.files || req.files.length === 0) return next();

    // 1) Handle Avatar Photo if provided
    const avatarFile = req.files.find(f => f.fieldname === 'photo');
    if (avatarFile) {
        try {
            let base64Photo = '';
            if (sharp) {
                const buffer = await sharp(avatarFile.buffer)
                    .resize(500, 500, { fit: 'cover', position: 'center' })
                    .toFormat('jpeg')
                    .jpeg({ quality: 80 })
                    .toBuffer();
                base64Photo = `data:image/jpeg;base64,${buffer.toString('base64')}`;
            } else {
                base64Photo = `data:${avatarFile.mimetype};base64,${avatarFile.buffer.toString('base64')}`;
            }
            req.body.photo = base64Photo;
        } catch (err) {
            console.error('Error processing avatar:', err);
        }
    }

    // 2) Handle Project Image Uploads
    const projectFiles = req.files.filter(f => f.fieldname.startsWith('project_image_'));
    if (projectFiles.length > 0) {
        let projects = [];
        if (req.body.projects) {
            try {
                projects = typeof req.body.projects === 'string' ? JSON.parse(req.body.projects) : req.body.projects;
            } catch (e) {
                projects = [];
            }
        }

        for (const file of projectFiles) {
            const index = parseInt(file.fieldname.replace('project_image_', ''), 10);
            if (!isNaN(index) && projects[index]) {
                try {
                    let base64Image = '';
                    if (sharp) {
                        const buffer = await sharp(file.buffer)
                            .resize(800, 520, { fit: 'cover' })
                            .toFormat('jpeg')
                            .jpeg({ quality: 80 })
                            .toBuffer();
                        base64Image = `data:image/jpeg;base64,${buffer.toString('base64')}`;
                    } else {
                        base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
                    }
                    projects[index].image = base64Image;
                } catch (err) {
                    console.error('Error processing project image:', err);
                }
            }
        }

        req.body.projects = JSON.stringify(projects);
    }

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
                statUsers: user.statUsers || '100k+',
                skills: user.skills || [],
                projects: user.projects || [],
                experiences: user.experiences || []
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
    if (req.body.skills !== undefined) {
        try {
            fieldsToUpdate.skills = typeof req.body.skills === 'string' ? JSON.parse(req.body.skills) : req.body.skills;
        } catch (err) {
            fieldsToUpdate.skills = req.body.skills;
        }
    }
    if (req.body.projects !== undefined) {
        try {
            fieldsToUpdate.projects = typeof req.body.projects === 'string' ? JSON.parse(req.body.projects) : req.body.projects;
        } catch (err) {
            fieldsToUpdate.projects = req.body.projects;
        }
    }
    if (req.body.experiences !== undefined) {
        try {
            fieldsToUpdate.experiences = typeof req.body.experiences === 'string' ? JSON.parse(req.body.experiences) : req.body.experiences;
        } catch (err) {
            fieldsToUpdate.experiences = req.body.experiences;
        }
    }

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
                statUsers: updatedUser.statUsers || '100k+',
                skills: updatedUser.skills || [],
                projects: updatedUser.projects || [],
                experiences: updatedUser.experiences || []
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
            statUsers: user && user.statUsers ? user.statUsers : '100k+',
            skills: user && user.skills ? user.skills : [],
            projects: user && user.projects ? user.projects : [],
            experiences: user && user.experiences ? user.experiences : []
        }
    });
});
