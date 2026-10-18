const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    shortDescription: { type: String, default: '', trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    duration: { type: String, required: true },
    price: { type: Number, min: 0, default: 0 },
    thumbnail: String,
    syllabus: [{ type: String }],
    lessons: [{
        title: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        videoUrl: { type: String, default: '' },
        resources: [{
            title: { type: String, trim: true },
            url: { type: String, trim: true },
        }],
    }],
    isShort: { type: Boolean, default: false },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isPublished: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
