const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const ENV = require('../config/env');
const googleRoleForEmail = require('../utils/googleRoleForEmail');
const normalizeEmail = require('../utils/normalizeEmail');

const googleClient = new OAuth2Client(ENV.GOOGLE_CLIENT_ID);

function publicUser(user) {
    return { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar || user.name[0] };
}

function tokenFor(user) {
    return jwt.sign({ id: user._id.toString(), role: user.role, email: user.email }, ENV.JWT_SECRET, { expiresIn: ENV.JWT_EXPIRES_IN });
}

async function register(req, res, next) {
    try {
        const { name, email, password } = req.body;
        const normalizedName = typeof name === 'string' ? name.trim() : '';
        const normalizedEmail = normalizeEmail(email);
        if (!normalizedName || !normalizedEmail || typeof password !== 'string') {
            return res.status(400).json({ message: 'Name, email and password are required' });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return res.status(400).json({ message: 'Enter a valid email address' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }
        if (await User.findOne({ email: normalizedEmail })) {
            return res.status(409).json({ message: 'Email is already registered' });
        }

        const user = await User.create({
            name: normalizedName,
            email: normalizedEmail,
            password: await bcrypt.hash(password, 12),
            role: 'student',
        });
        return res.status(201).json({ token: tokenFor(user), user: publicUser(user) });
    } catch (error) { next(error); }
}

async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        const normalizedEmail = normalizeEmail(email);
        if (!normalizedEmail || typeof password !== 'string') {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        const user = await User.findOne({ email: normalizedEmail }).select('+password');
        if (!user || !(await bcrypt.compare(password || '', user.password))) return res.status(401).json({ message: 'Invalid email or password' });
        return res.json({ token: tokenFor(user), user: publicUser(user) });
    } catch (error) { next(error); }
}

async function googleLogin(req, res, next) {
    try {
        const { credential } = req.body;
        if (!credential) return res.status(400).json({ message: 'Google credential is required' });

        // Verify Google token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: ENV.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;
        if (!email || payload.email_verified !== true) {
            return res.status(401).json({ message: 'A verified Google email is required' });
        }
        const normalizedEmail = normalizeEmail(email);
        const assignedRole = googleRoleForEmail(normalizedEmail, ENV.ADMIN_EMAILS, ENV.TEACHER_EMAILS);

        // Check if user already exists (by googleId or email)
        let user = await User.findOne({ $or: [{ googleId }, { email: normalizedEmail }] }).select('+password');

        if (user) {
            // Existing user — update googleId & avatar if not set
            if (!user.googleId) user.googleId = googleId;
            if (!user.avatar) user.avatar = picture;
            if (assignedRole) user.role = assignedRole;
            else if (!user.password) user.role = 'student';
            await user.save();
        } else {
            // New user — create in MongoDB
            user = await User.create({
                name,
                email: normalizedEmail,
                googleId,
                avatar: picture,
                role: assignedRole || 'student',
            });
        }

        return res.json({ token: tokenFor(user), user: publicUser(user) });
    } catch (error) { next(error); }
}

module.exports = { register, login, googleLogin };