const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, minlength: 6, select: false }, // optional for Google users
    googleId: { type: String, unique: true, sparse: true }, // sparse allows multiple nulls
    role: { type: String, enum: ['admin', 'teacher', 'student'], default: 'student' },
    subject: { type: String, trim: true },
    avatar: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
