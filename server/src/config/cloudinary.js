const {v2: cloudinary} = require('cloudinary');
const ENV = require('./env');

cloudinary.config({
    cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
    api_key: ENV.CLOUDINARY_API_KEY,
    api_secret: ENV.CLOUDINARY_API_SECRET
})

module.exports = cloudinary;
