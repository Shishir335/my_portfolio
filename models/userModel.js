const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell ur your name']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail]
    },
    photo: {
        type: String,
        default: 'profile.png'
    },
    birthDate: {
        type: Date
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other', 'prefer-not-to-say'],
        default: 'prefer-not-to-say'
    },
    aboutBadge: {
        type: String,
        default: 'Available for Senior Flutter & Mobile Engineering Roles'
    },
    aboutTitle: {
        type: String,
        default: 'Crafting 60 FPS Cross-Platform Mobile Apps'
    },
    aboutBio: {
        type: String,
        default: 'Senior Flutter & Dart Developer specializing in pixel-perfect UI, clean architecture, Riverpod/BLoC state management, and seamless Node.js REST API integrations for iOS, Android & Web.'
    },
    statYearsExp: {
        type: String,
        default: '4+'
    },
    statApps: {
        type: String,
        default: '25+'
    },
    statCrashFree: {
        type: String,
        default: '99.9%'
    },
    statUsers: {
        type: String,
        default: '100k+'
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'dev'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please enter password'],
        minlength: 8,
        select: false
    },
    confirmPassword: {
        type: String,
        required: [true, 'Please confirm password'],
        validate: {
            validator: function (el) {
                return el === this.password
            },
            message: 'Passwords are not same'
        },
        select: false
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpire: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);

    this.confirmPassword = undefined;
    next();
});

userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.pre(/^find/, function (next) {
    // this points to current query
    this.find({ active: { $ne: false } });
    next();
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    if (!userPassword) return false;
    if (userPassword.startsWith('$2a$') || userPassword.startsWith('$2b$') || userPassword.startsWith('$2y$')) {
        try {
            return await bcrypt.compare(candidatePassword, userPassword);
        } catch (err) {
            return false;
        }
    }
    return candidatePassword === userPassword;
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

        // 2-second grace period so tokens created immediately after password saving remain valid
        return JWTTimestamp + 2 < changedTimestamp;
    }

    // false means not changed
    return false;
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.passwordResetExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

const User = mongoose.model('User', userSchema);

module.exports = User;