const Contact = require('../models/contactModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Public route: Submit a contact message
exports.createContactMessage = catchAsync(async (req, res, next) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
        return next(new AppError('Please provide name, email, and message', 400));
    }

    const newMessage = await Contact.create({
        name,
        email,
        subject: subject || 'Portfolio Contact Form Message',
        message
    });

    res.status(201).json({
        status: 'success',
        message: 'Your message has been sent successfully!',
        data: {
            contact: newMessage
        }
    });
});

// Admin route: Get all contact messages
exports.getContactMessages = catchAsync(async (req, res, next) => {
    const messages = await Contact.find().sort({ createdAt: -1 });

    res.status(200).json({
        status: 'success',
        results: messages.length,
        data: {
            messages
        }
    });
});

// Admin route: Delete a message
exports.deleteContactMessage = catchAsync(async (req, res, next) => {
    const message = await Contact.findByIdAndDelete(req.params.id);

    if (!message) {
        return next(new AppError('No message found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        message: 'Message deleted successfully'
    });
});

// Admin route: Mark message as read
exports.markMessageRead = catchAsync(async (req, res, next) => {
    const message = await Contact.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });

    if (!message) {
        return next(new AppError('No message found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            message
        }
    });
});
