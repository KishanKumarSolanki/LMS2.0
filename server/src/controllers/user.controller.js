const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const asyncHandler = require('../utils/asyncHandler');
const bcrypt = require('bcryptjs');

// GET /api/users  (private - admin)  optional ?role=teacher|student
const getUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  const users = await User.find(filter).sort('-createdAt').lean();
  const userIds = users.map((user) => user._id);
  const counts = userIds.length
    ? await Enrollment.aggregate([
      { $match: { student: { $in: userIds } } },
      { $group: { _id: '$student', count: { $sum: 1 } } },
    ])
    : [];
  const countByUser = new Map(counts.map(({ _id, count }) => [_id.toString(), count]));
  res.json(users.map((user) => ({ ...user, enrollmentCount: countByUser.get(user._id.toString()) || 0 })));
});

// POST /api/users/teachers  (private - admin) - create a teacher account
const addTeacher = asyncHandler(async (req, res) => {
  const { name, email, password, subject } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  const teacher = await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 12),
    role: 'teacher',
    subject,
    avatar: name.trim()[0]?.toUpperCase() || 'T',
  });

  res.status(201).json({ _id: teacher._id, name: teacher.name, email: teacher.email, role: teacher.role, subject: teacher.subject });
});

// DELETE /api/users/:id  (private - admin)
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (user.role === 'admin') {
    res.status(400);
    throw new Error('Admin accounts cannot be deleted');
  }

  if (user.role === 'teacher') {
    await Course.deleteMany({ teacher: user._id });
  }
  await Enrollment.deleteMany({ student: user._id });
  await user.deleteOne();

  res.json({ message: 'User deleted' });
});

module.exports = { getUsers, addTeacher, deleteUser };
