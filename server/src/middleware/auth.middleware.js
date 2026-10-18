const jwt = require('jsonwebtoken');
const ENV = require('../config/env');
const User = require('../models/User');

async function userFromToken(token) {
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    const user = await User.findById(decoded.id).select('role').lean();
    if (!user || user.role !== decoded.role) throw new Error('Account is deleted or role has changed');
    return decoded;
}

async function protect(req, res, next) {
    const token = req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : null;
    if (!token) return res.status(401).json({ message: 'Authentication required' });
    try {
        req.user = await userFromToken(token);
        next();
    } catch {
        return res.status(401).json({ message: 'Invalid, expired, or inactive account' });
    }
}

async function optionalAuth(req, res, next) {
    const token = req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : null;

    if (!token) return next();

    try {
        req.user = await userFromToken(token);
    } catch {
        req.user = undefined;
    }
    next();
}

function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'You do not have permission to perform this action' });
        }
        next();
    };
}

module.exports = { protect, optionalAuth, authorize, authenticate: protect };
