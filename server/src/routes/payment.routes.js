const router = require('express').Router();
const { createOrder, verifyPayment } = require('../controllers/payment.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect, authorize('student'));
router.post('/orders', createOrder);
router.post('/verify', verifyPayment);

module.exports = router;