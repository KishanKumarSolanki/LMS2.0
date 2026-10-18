const router = require('express').Router();
const multer = require('multer');
const { listCourses, getCourse, getMyCourses, uploadThumbnail, createCourse, updateCourse, deleteCourse } = require('../controllers/course.controller');
const { protect, optionalAuth, authorize } = require('../middleware/auth.middleware');

const parseThumbnailUpload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 5 * 1024 * 1024 },
	fileFilter: (req, file, callback) => {
		if (['image/png', 'image/jpeg', 'image/webp'].includes(file.mimetype)) return callback(null, true);
		callback(new Error('Choose a PNG, JPG, or WEBP image'));
	},
}).single('thumbnail');

router.get('/', optionalAuth, listCourses);
router.get('/mine', protect, authorize('teacher', 'admin'), getMyCourses);
router.post('/thumbnail', protect, authorize('teacher', 'admin'), (req, res, next) => {
	parseThumbnailUpload(req, res, (error) => {
		if (error) return res.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ message: error.code === 'LIMIT_FILE_SIZE' ? 'Image must be 5MB or smaller' : error.message });
		next();
	});
}, uploadThumbnail);
router.post('/', protect, authorize('teacher', 'admin'), createCourse);
router.get('/:id', optionalAuth, getCourse);
router.put('/:id', protect, authorize('teacher', 'admin'), updateCourse);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteCourse);

module.exports = router;
