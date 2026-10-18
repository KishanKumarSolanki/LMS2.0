const Subscriber = require('../models/Subscriber');
const asyncHandler = require('../utils/asyncHandler');
const { sendContactMessage } = require('../services/mailer');

const validEmail = (email) => typeof email === 'string'
  && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  && email.length <= 254;

const sendContact = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (typeof name !== 'string' || !name.trim() || name.length > 120
      || !validEmail(email) || typeof subject !== 'string' || !subject.trim() || subject.length > 160
      || typeof message !== 'string' || !message.trim() || message.length > 5000) {
    res.status(400);
    throw new Error('Please provide a valid name, email, subject, and message');
  }

  await sendContactMessage({ name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() });
  res.status(202).json({ message: 'Your message has been sent' });
});

const subscribeNewsletter = asyncHandler(async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  if (!validEmail(email)) {
    res.status(400);
    throw new Error('Enter a valid email address');
  }

  await Subscriber.updateOne({ email }, { $setOnInsert: { email } }, { upsert: true });
  res.status(200).json({ message: 'You are subscribed to course updates' });
});

module.exports = { sendContact, subscribeNewsletter };