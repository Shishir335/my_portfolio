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
    widget1Title: {
        type: String,
        default: 'Flutter 3.x'
    },
    widget1Subtitle: {
        type: String,
        default: 'Dart & Impeller Engine'
    },
    widget2Title: {
        type: String,
        default: 'Clean Architecture'
    },
    widget2Subtitle: {
        type: String,
        default: 'Riverpod / BLoC Pattern'
    },
    careerStartDate: {
        type: Date
    },
    socialLinks: {
        github: { type: String, default: 'https://github.com' },
        linkedin: { type: String, default: 'https://linkedin.com' },
        facebook: { type: String, default: 'https://facebook.com' },
        whatsapp: { type: String, default: 'https://wa.me/1234567890' },
        email: { type: String, default: 'mahbub@gmail.com' }
    },
    footerText: {
        type: String,
        default: '© 2026 Flutter Developer Portfolio. Built with Flutter, Dart, Node.js & Express.'
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
    skills: {
        type: Array,
        default: [
            {
                title: 'Flutter & Dart Core',
                description: 'Custom painters, smooth 120 FPS animations, Impeller engine optimization, and native platform channels (Swift/Kotlin).',
                tags: ['Flutter 3.x', 'Dart 3', 'Platform Channels', 'Isolates'],
                icon: 'fa-brands fa-flutter',
                color: '#00D2FF'
            },
            {
                title: 'State & Architecture',
                description: 'Unidirectional data flow, clean architecture separation of concerns, dependency injection, and deterministic state.',
                tags: ['Riverpod', 'flutter_bloc', 'Provider', 'GetIt'],
                icon: 'fa-solid fa-sitemap',
                color: '#a855f7'
            },
            {
                title: 'Backend & APIs',
                description: 'Node.js Express REST APIs, MongoDB Mongoose ODM, Firebase Auth/FCM, GraphQL, and WebSockets.',
                tags: ['Node.js', 'Express', 'MongoDB', 'Firebase'],
                icon: 'fa-solid fa-server',
                color: '#10b981'
            }
        ]
    },
    projects: {
        type: Array,
        default: [
            {
                title: 'CryptoPulse - Real-time Trading Dashboard',
                badge: 'Flutter & Web',
                description: 'High-frequency crypto market tracker featuring 120 FPS WebSocket candlestick charts, portfolio analytics, and biometrics authentication.',
                image: '/img/app_showcase.png',
                tags: ['Flutter 3.x', 'Riverpod', 'WebSockets', 'Node.js'],
                playStoreLink: 'https://play.google.com/store/apps',
                appStoreLink: 'https://apps.apple.com/app'
            },
            {
                title: 'HealthHub - Telemedicine & Vital Sync',
                badge: 'Mobile App',
                description: 'Cross-platform mobile application providing HIPAA-compliant video consultations, Bluetooth medical device data sync, and instant prescription delivery.',
                image: '/img/app_showcase.png',
                tags: ['Flutter', 'flutter_bloc', 'Firebase', 'WebRTC'],
                playStoreLink: 'https://play.google.com/store/apps',
                appStoreLink: 'https://apps.apple.com/app'
            },
            {
                title: 'LogiTrack - Enterprise Fleet Management',
                badge: 'Enterprise System',
                description: 'Real-time GPS fleet tracking application with offline route calculation, driver safety metrics, and automated background sync.',
                image: '/img/app_showcase.png',
                tags: ['Flutter', 'Google Maps API', 'Express', 'MongoDB'],
                playStoreLink: 'https://play.google.com/store/apps',
                appStoreLink: 'https://apps.apple.com/app'
            }
        ]
    },
    experiences: {
        type: Array,
        default: [
            {
                role: 'Senior Software Engineer (Mobile, Flutter)',
                company: 'Bini Fintech Limited',
                duration: '07/2023 - Present',
                location: 'Dhaka, Bangladesh',
                description: 'Leading mobile fintech architecture, security compliance, and cross-platform release management.',
                highlights: [
                    'Leading the Flutter development team in the development and maintenance of the Bini personal finance application, ensuring secure, scalable, and high-quality mobile solutions.',
                    'Architecting and developing cross-platform applications using Flutter, Clean Architecture, and SOLID principles.',
                    'Integrating REST APIs, banking APIs, payment gateways, Firebase services, and third-party SDKs to deliver seamless financial features.',
                    'Implementing secure authentication and authorization using OAuth 2.0 while ensuring compliance with financial security standards.',
                    'Optimizing application performance, offline data synchronization, and API communication to enhance user experience and reliability.',
                    'Conducting code reviews, mentoring developers, and collaborating with cross-functional teams in an Agile environment.',
                    'Managing Git workflows and publishing production releases to the Google Play Store and Apple App Store.'
                ]
            }
        ]
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