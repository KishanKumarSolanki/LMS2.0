const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    orderId: { type: String, required: true, unique: true },
    paymentId: { type: String, unique: true, sparse: true },
    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['created', 'paid'], default: 'created' },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);