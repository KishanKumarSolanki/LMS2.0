const nodemailer = require('nodemailer');
const ENV = require('../config/env');

let transporter;

function getMailer() {
    if (!ENV.MAILTRAP_HOST || !ENV.MAILTRAP_USERNAME || !ENV.MAILTRAP_PASSWORD || !ENV.MAIL_FROM) {
        const error = new Error('Email delivery is not configured yet');
        error.statusCode = 503;
        throw error;
    }

    if (!transporter) {
        const port = Number(ENV.MAILTRAP_PORT) || 587;
        transporter = nodemailer.createTransport({
            host: ENV.MAILTRAP_HOST,
            port,
            secure: port === 465,
            auth: { user: ENV.MAILTRAP_USERNAME, pass: ENV.MAILTRAP_PASSWORD },
        });
    }

    return transporter;
}

async function sendContactMessage({ name, email, subject, message }) {
    const mailer = getMailer();
    await mailer.sendMail({
        from: ENV.MAIL_FROM,
        to: ENV.CONTACT_EMAIL || ENV.MAIL_FROM,
        replyTo: email,
        subject: `[LearnPro] ${subject}`,
        text: `From: ${name} <${email}>\n\n${message}`,
    });
}

module.exports = { sendContactMessage };