const { Router } = require('express');
const { getUsers, addTeacher, deleteUser } = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = Router();

router.use(protect, authorize('admin'));
router.get('/', getUsers);
router.post('/teachers', addTeacher);
router.delete('/:id', deleteUser);

module.exports = router;
