const crypto = require('crypto');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/enrollments  (private - student)  body: { courseId }
const enroll = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  const course = await Course.findById(courseId);
  if (!course || !course.isPublished) {
    res.status(404);
    throw new Error('Course not found');
  }
  if (course.price > 0) {
    res.status(402);
    throw new Error('Complete payment before enrolling in this course');
  }

  const existing = await Enrollment.findOne({ student: req.user.id, course: courseId });
  if (existing) {
    return res.status(200).json(existing);
  }

  const enrollment = await Enrollment.create({ student: req.user.id, course: courseId });
  res.status(201).json(enrollment);
});

// GET /api/enrollments/me  (private - student) - courses the logged-in student is enrolled in
const getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user.id }).populate({
    path: 'course',
    populate: { path: 'teacher', select: 'name' },
  });
  res.json(enrollments);
});

// PATCH /api/enrollments/:id/progress  (private - student, owner only)  body: { progress, completedLessons }
const updateProgress = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findById(req.params.id);
  if (!enrollment) {
    res.status(404);
    throw new Error('Enrollment not found');
  }
  if (enrollment.student.toString() !== req.user.id) {
    res.status(403);
    throw new Error('You can only update your own progress');
  }

  const course = await Course.findById(enrollment.course).select('lessons syllabus');
  const lessonIds = course.lessons.length
    ? course.lessons.map((lesson) => lesson._id.toString())
    : course.syllabus.map((_, index) => `legacy-${index}`);
  const requested = Array.isArray(req.body.completedLessons)
    ? [...new Set(req.body.completedLessons.map(String))]
    : enrollment.completedLessons;
  const completedLessons = requested.map((lessonId) => {
    if (lessonIds.includes(lessonId)) return lessonId;
    const legacyIndex = Number(lessonId);
    if (Number.isInteger(legacyIndex) && legacyIndex >= 0 && legacyIndex < lessonIds.length) {
      return lessonIds[legacyIndex];
    }
    return null;
  });

  if (completedLessons.some((lessonId) => lessonId === null)) {
    res.status(400);
    throw new Error('One or more lesson IDs are invalid');
  }

  enrollment.completedLessons = [...new Set(completedLessons)];
  enrollment.progress = lessonIds.length
    ? Math.round((enrollment.completedLessons.length / lessonIds.length) * 100)
    : 0;

  await enrollment.save();
  res.json(enrollment);
});

// GET /api/enrollments/course/:courseId  (private - owning teacher, admin) - students enrolled in a course
const getCourseStudents = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  const isOwner = course.teacher.toString() === req.user.id;
  if (req.user.role !== 'admin' && !isOwner) {
    res.status(403);
    throw new Error('You can only view students for your own courses');
  }

  const enrollments = await Enrollment.find({ course: req.params.courseId }).populate('student', 'name email avatar');
  res.json(enrollments);
});

// GET /api/enrollments  (private - admin) - every enrollment, for the admin dashboard
const getAllEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find()
    .populate('student', 'name email avatar')
    .populate('course', 'title price')
    .sort('-createdAt');
  res.json(enrollments);
});

const issueCertificate = asyncHandler(async (req, res) => {
  let enrollment = await Enrollment.findOne({ _id: req.params.id, student: req.user.id });
  if (!enrollment) {
    res.status(404);
    throw new Error('Enrollment not found');
  }

  const course = await Course.findById(enrollment.course);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  const lessonIds = course.lessons.length
    ? course.lessons.map((lesson) => lesson._id.toString())
    : course.syllabus.map((_, index) => `legacy-${index}`);
  const completed = new Set(enrollment.completedLessons.map(String));
  const isComplete = lessonIds.length > 0 && lessonIds.every((lessonId, index) =>
    completed.has(lessonId) || completed.has(String(index))
  );
  if (!isComplete) {
    res.status(409);
    throw new Error('Complete every lesson before requesting a certificate');
  }

  if (!enrollment.certificateCode) {
    const certificateCode = crypto.randomBytes(10).toString('hex').toUpperCase();
    await Enrollment.updateOne(
      { _id: enrollment._id, certificateCode: { $exists: false } },
      { $set: { certificateCode, certificateIssuedAt: new Date() } },
    );
  }

  enrollment = await Enrollment.findById(enrollment._id)
    .populate('student', 'name')
    .populate({ path: 'course', populate: { path: 'teacher', select: 'name' } });
  res.json({
    certificate: {
      code: enrollment.certificateCode,
      issuedAt: enrollment.certificateIssuedAt,
      learnerName: enrollment.student.name,
      courseTitle: enrollment.course.title,
      instructorName: enrollment.course.teacher?.name || 'LearnPro Instructor',
    },
  });
});

const verifyCertificate = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOne({ certificateCode: req.params.code.toUpperCase() })
    .populate('student', 'name')
    .populate({ path: 'course', populate: { path: 'teacher', select: 'name' } });
  if (!enrollment?.course || !enrollment.student) {
    res.status(404);
    throw new Error('Certificate not found');
  }

  res.json({
    certificate: {
      code: enrollment.certificateCode,
      issuedAt: enrollment.certificateIssuedAt,
      learnerName: enrollment.student.name,
      courseTitle: enrollment.course.title,
      instructorName: enrollment.course.teacher?.name || 'LearnPro Instructor',
    },
  });
});

module.exports = { enroll, getMyEnrollments, updateProgress, getCourseStudents, getAllEnrollments, issueCertificate, verifyCertificate };
