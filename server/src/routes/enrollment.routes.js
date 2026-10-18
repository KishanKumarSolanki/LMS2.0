const { Router } = require('express');
const {
  enroll,
  getMyEnrollments,
  updateProgress,
  getCourseStudents,
  getAllEnrollments,
  issueCertificate,
  verifyCertificate,
} = require('../controllers/enrollment.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = Router();

router.get('/certificates/verify/:code', verifyCertificate);
router.post('/', protect, authorize('student'), enroll);
router.get('/me', protect, authorize('student'), getMyEnrollments);
router.get('/:id/certificate', protect, authorize('student'), issueCertificate);
router.patch('/:id/progress', protect, authorize('student'), updateProgress);
router.get('/course/:courseId', protect, authorize('teacher', 'admin'), getCourseStudents);
router.get('/', protect, authorize('admin'), getAllEnrollments);

module.exports = router;
