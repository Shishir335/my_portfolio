const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please enter your name'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'Please enter your email address'],
            trim: true,
            lowercase: true
        },
        subject: {
            type: String,
            default: 'Portfolio Contact Form Message',
            trim: true
        },
        message: {
            type: String,
            required: [true, 'Please enter your message'],
            trim: true
        },
        isRead: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
