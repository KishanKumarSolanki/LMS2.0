const router = require('express').Router();
const { sendContact, subscribeNewsletter } = require('../controllers/contact.controller');

router.post('/', sendContact);
router.post('/newsletter', subscribeNewsletter);

module.exports = router;