const dotenv = require('dotenv');
dotenv.config();

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);


const ENV = {
    PORT: Number(process.env.PORT) || 5001,
    NODE_ENV: process.env.NODE_ENV || 'development',
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET || 'change-this-development-secret',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
    ADMIN_URL: process.env.ADMIN_URL || 'http://localhost:5173',
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    MAILTRAP_PORT: process.env.MAILTRAP_PORT,
    MAILTRAP_HOST: process.env.MAILTRAP_HOST,
    MAILTRAP_USERNAME: process.env.MAILTRAP_USERNAME,
    MAILTRAP_PASSWORD: process.env.MAILTRAP_PASSWORD || process.env.MAILTRAP_PASS,
    MAIL_FROM: process.env.MAIL_FROM,
    CONTACT_EMAIL: process.env.CONTACT_EMAIL,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    ADMIN_EMAILS: (process.env.ADMIN_EMAILS || '').split(',').map((email) => email.trim().toLowerCase()).filter(Boolean),
    TEACHER_EMAILS: (process.env.TEACHER_EMAILS || '').split(',').map((email) => email.trim().toLowerCase()).filter(Boolean),
}

if (ENV.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'change-this-development-secret')) {
    throw new Error('A unique JWT_SECRET must be configured in production');
}

module.exports = ENV;
