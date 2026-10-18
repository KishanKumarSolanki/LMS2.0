const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { test } = require('node:test');
const { isValidRazorpaySignature } = require('../src/utils/paymentSignature');
const googleRoleForEmail = require('../src/utils/googleRoleForEmail');

const secret = 'local-test-secret';

function sign(payload) {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

test('accepts a valid Razorpay checkout signature', () => {
    const payload = 'order_123|pay_456';
    assert.equal(isValidRazorpaySignature(payload, sign(payload), secret), true);
});

test('accepts a valid webhook signature over raw bytes', () => {
    const payload = Buffer.from('{"event":"payment.captured"}');
    assert.equal(isValidRazorpaySignature(payload, sign(payload), secret), true);
});

test('rejects a changed payload and malformed signatures', () => {
    assert.equal(isValidRazorpaySignature('order_123|pay_456', sign('order_other|pay_456'), secret), false);
    assert.equal(isValidRazorpaySignature('payload', 'not-a-signature', secret), false);
    assert.equal(isValidRazorpaySignature('payload', sign('payload'), ''), false);
});

test('assigns Google roles from email allowlists with admin precedence', () => {
    const admins = ['admin@example.com'];
    const teachers = ['teacher@example.com', 'admin@example.com'];
    assert.equal(googleRoleForEmail(' ADMIN@example.com ', admins, teachers), 'admin');
    assert.equal(googleRoleForEmail('teacher@example.com', admins, teachers), 'teacher');
    assert.equal(googleRoleForEmail('student@example.com', admins, teachers), null);
});