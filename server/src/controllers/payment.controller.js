const crypto = require('crypto');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Payment = require('../models/Payment');
const ENV = require('../config/env');
const asyncHandler = require('../utils/asyncHandler');
const { isValidRazorpaySignature } = require('../utils/paymentSignature');

function ensureRazorpayConfigured(res) {
    if (ENV.RAZORPAY_KEY_ID && ENV.RAZORPAY_KEY_SECRET) return;
    res.status(503);
    throw new Error('Online payments are not configured yet');
}

async function razorpayRequest(path, options = {}) {
    const response = await fetch(`https://api.razorpay.com/v1${path}`, {
        ...options,
        headers: {
            Authorization: `Basic ${Buffer.from(`${ENV.RAZORPAY_KEY_ID}:${ENV.RAZORPAY_KEY_SECRET}`).toString('base64')}`,
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const error = new Error(data.error?.description || 'Payment provider request failed');
        error.statusCode = 502;
        throw error;
    }
    return data;
}

const createOrder = asyncHandler(async (req, res) => {
    ensureRazorpayConfigured(res);
    const course = await Course.findById(req.body.courseId);
    if (!course || !course.isPublished) {
        res.status(404);
        throw new Error('Course not found');
    }
    if (course.price <= 0) {
        res.status(400);
        throw new Error('Free courses do not need a payment order');
    }
    if (await Enrollment.exists({ student: req.user.id, course: course._id })) {
        res.status(409);
        throw new Error('You are already enrolled in this course');
    }

    const amount = Math.round(course.price * 100);
    if (!Number.isSafeInteger(amount) || amount < 1) {
        res.status(400);
        throw new Error('Course price is below the payment provider minimum');
    }
    const order = await razorpayRequest('/orders', {
        method: 'POST',
        body: JSON.stringify({
            amount,
            currency: 'INR',
            receipt: `learnpro_${Date.now()}_${req.user.id.slice(-8)}`,
            notes: { courseId: course._id.toString(), studentId: req.user.id },
        }),
    });

    await Payment.create({
        student: req.user.id,
        course: course._id,
        orderId: order.id,
        amount,
        currency: order.currency,
    });

    res.status(201).json({
        orderId: order.id,
        keyId: ENV.RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        courseName: course.title,
    });
});

const verifyPayment = asyncHandler(async (req, res) => {
    ensureRazorpayConfigured(res);
    const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body;
    if (!orderId || !paymentId || !signature) {
        res.status(400);
        throw new Error('Payment verification details are incomplete');
    }

    const payment = await Payment.findOne({ orderId, student: req.user.id });
    if (!payment) {
        res.status(404);
        throw new Error('Payment order not found');
    }

    if (!isValidRazorpaySignature(`${orderId}|${paymentId}`, signature, ENV.RAZORPAY_KEY_SECRET)) {
        res.status(400);
        throw new Error('Payment signature is invalid');
    }

    const providerPayment = await razorpayRequest(`/payments/${encodeURIComponent(paymentId)}`);
    if (providerPayment.order_id !== orderId || providerPayment.amount !== payment.amount
        || providerPayment.currency !== payment.currency || providerPayment.status !== 'captured') {
        res.status(400);
        throw new Error('Payment has not been captured for this order');
    }

    if (payment.status !== 'paid') {
        await Payment.updateOne({ _id: payment._id, status: 'created' }, { $set: { status: 'paid', paymentId } });
    }
    await Enrollment.updateOne(
        { student: payment.student, course: payment.course },
        { $setOnInsert: { student: payment.student, course: payment.course } },
        { upsert: true, setDefaultsOnInsert: true },
    );

    res.json({ message: 'Payment verified and enrollment activated' });
});

const handleWebhook = asyncHandler(async (req, res) => {
    if (!ENV.RAZORPAY_WEBHOOK_SECRET) {
        res.status(503);
        throw new Error('Payment webhook is not configured');
    }

    const signature = req.headers['x-razorpay-signature'];
    if (!isValidRazorpaySignature(req.body, signature, ENV.RAZORPAY_WEBHOOK_SECRET)) {
        res.status(400);
        throw new Error('Webhook signature is invalid');
    }

    let event;
    try {
        event = JSON.parse(req.body.toString('utf8'));
    } catch {
        res.status(400);
        throw new Error('Webhook payload is invalid');
    }

    if (event.event !== 'payment.captured') return res.json({ received: true });
    const captured = event.payload?.payment?.entity;
    if (!captured?.order_id || !captured.id || captured.status !== 'captured') {
        res.status(400);
        throw new Error('Captured payment details are incomplete');
    }

    const payment = await Payment.findOne({ orderId: captured.order_id, amount: captured.amount, currency: captured.currency });
    if (!payment) {
        res.status(404);
        throw new Error('Payment order not found');
    }

    await Payment.updateOne({ _id: payment._id, status: 'created' }, { $set: { status: 'paid', paymentId: captured.id } });
    await Enrollment.updateOne(
        { student: payment.student, course: payment.course },
        { $setOnInsert: { student: payment.student, course: payment.course } },
        { upsert: true, setDefaultsOnInsert: true },
    );
    res.json({ received: true });
});

module.exports = { createOrder, verifyPayment, handleWebhook };