const fs = require('fs');
const multer = require('multer');
let sharp;
try {
    sharp = require('sharp');
} catch (e) {
    sharp = null;
}
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image! please upload only image.', 400), false);
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
    const targetPath = `public/img/users/${req.file.filename}`;

    if (sharp) {
        try {
            await sharp(req.file.buffer)
                .resize(500, 500)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(targetPath);
        } catch (err) {
            fs.writeFileSync(targetPath, req.file.buffer);
        }
    } else {
        fs.writeFileSync(targetPath, req.file.buffer);
    }

    next();
});

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(item => {
        if (allowedFields.includes(item)) {
            newObj[item] = obj[item];
        }
    });

    return newObj;
}

exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) Create error if user Posts password data
    if (req.body.password || req.body.confirmPassword) {
        return next(new AppError('This route is not for password update', 400));
    }

    // 2) filtered out unwanted fields that are not allowed to update
    const filteredBody = filterObj(req.body, 'name', 'email');
    if (req.file) filteredBody.photo = req.file.filename;

    // 3) Update user document
    const updateUser =
        await User.findByIdAndUpdate(req.user.id, filteredBody,
            { new: true, runValidators: true });

    res.status(200).json({
        status: 'success',
        data: updateUser
    });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success'
    });
})

exports.getProfile = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({
        status: 'success',
        results: users.length,
        data: users
    });
});

exports.getUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new AppError('No user found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: user
    });
});

exports.createUser = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);
    res.status(201).json({
        status: 'success',
        data: newUser
    });
});

exports.updateUser = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!user) {
        return next(new AppError('No user found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: user
    });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
        return next(new AppError('No user found with that ID', 404));
    }
    res.status(204).json({
        status: 'success',
        data: null
    });
});