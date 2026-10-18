const crypto = require('crypto');

function isValidRazorpaySignature(payload, signature, secret) {
    if (typeof signature !== 'string' || !/^[a-f0-9]{64}$/i.test(signature) || !secret) return false;
    const expected = crypto.createHmac('sha256', secret).update(payload).digest();
    const provided = Buffer.from(signature, 'hex');
    return expected.length === provided.length && crypto.timingSafeEqual(expected, provided);
}

module.exports = { isValidRazorpaySignature };