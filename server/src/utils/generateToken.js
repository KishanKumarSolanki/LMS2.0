const jwt = require('jsonwebtoken');
const ENV = require('../config/env');

const generateToken = (id) => {
  return jwt.sign({ id }, ENV.JWT_SECRET, { expiresIn: ENV.JWT_EXPIRES_IN || '24h' });
};

module.exports = generateToken;
