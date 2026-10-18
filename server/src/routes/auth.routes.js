const router = require('express').Router();
const { login, register, googleLogin } = require('../controllers/auth.controller');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);

module.exports = router;