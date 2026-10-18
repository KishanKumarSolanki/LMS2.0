const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const cloudinary = require('../config/cloudinary');

async function uploadThumbnail(req, res, next) {
    if (!req.file) return res.status(400).json({ message: 'Choose an image to upload' });
    const cloudinaryConfig = cloudinary.config();
    if (!cloudinaryConfig.cloud_name || !cloudinaryConfig.api_key || !cloudinaryConfig.api_secret) {
        return res.status(503).json({ message: 'Image uploads are not configured. Set the Cloudinary credentials in the server environment.' });
    }

    try {
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream({
                folder: 'course-thumbnails',
                resource_type: 'image',
            }, (error, uploadedImage) => error ? reject(error) : resolve(uploadedImage));
            stream.end(req.file.buffer);
        });
        res.json({ thumbnail: result.secure_url });
    } catch (error) { next(error); }
}

async function withEnrollmentCounts(courses, includeLessonContent = false) {
    const courseIds = courses.map((course) => course._id);
    const counts = courseIds.length
        ? await Enrollment.aggregate([
            { $match: { course: { $in: courseIds } } },
            { $group: { _id: '$course', count: { $sum: 1 } } },
        ])
        : [];
    const countByCourse = new Map(counts.map(({ _id, count }) => [_id.toString(), count]));

    return courses.map((course) => {
        const data = course.toObject();
        if (!includeLessonContent) {
            data.lessons = (data.lessons || []).map(({ _id, title }) => ({ _id, title }));
        }
        return {
            ...data,
            enrollmentCount: countByCourse.get(course._id.toString()) || 0,
        };
    });
}

async function listCourses(req, res, next) {
    try {
        const wantsAll = req.query.all === 'true';
        if (wantsAll && req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Only administrators can view unpublished courses' });
        }
        const filter = wantsAll ? {} : { isPublished: true };
        const courses = await Course.find(filter).populate('teacher', 'name email subject').sort({ createdAt: -1 });
        res.json({ courses: await withEnrollmentCounts(courses, wantsAll) });
    } catch (error) { next(error); }
}

async function getCourse(req, res, next) {
    try {
        const course = await Course.findById(req.params.id).populate('teacher', 'name email subject');
        if (!course) return res.status(404).json({ message: 'Course not found' });
        const isOwner = req.user?.role === 'teacher' && course.teacher?._id.toString() === req.user.id;
        if (!course.isPublished && req.user?.role !== 'admin' && !isOwner) {
            return res.status(404).json({ message: 'Course not found' });
        }
        const isAdmin = req.user?.role === 'admin';
        const isEnrolled = req.user?.role === 'student'
            && Boolean(await Enrollment.exists({ student: req.user.id, course: course._id }));
        const courseData = (await withEnrollmentCounts([course], isAdmin || isOwner || isEnrolled))[0];
        if (req.user?.role === 'student') courseData.isEnrolled = isEnrolled;
        res.json({ course: courseData });
    } catch (error) { next(error); }
}

async function getMyCourses(req, res, next) {
    try {
        const courses = await Course.find({ teacher: req.user.id }).populate('teacher', 'name email subject').sort({ createdAt: -1 });
        res.json({ courses: await withEnrollmentCounts(courses, true) });
    } catch (error) { next(error); }
}

function coursePayload(body) {
    const fields = ['title', 'shortDescription', 'description', 'category', 'level', 'duration', 'price', 'thumbnail', 'syllabus', 'lessons', 'isShort', 'isPublished'];
    return Object.fromEntries(fields.filter((field) => body[field] !== undefined).map((field) => [field, body[field]]));
}

function validateLessons(lessons) {
    const isHttpUrl = (value) => {
        if (!value) return true;
        try {
            return ['http:', 'https:'].includes(new URL(value).protocol);
        } catch {
            return false;
        }
    };

    return Array.isArray(lessons) && lessons.every((lesson) =>
        lesson && typeof lesson.title === 'string' && lesson.title.trim()
        && isHttpUrl(lesson.videoUrl)
        && Array.isArray(lesson.resources || [])
        && (lesson.resources || []).every((resource) => resource
            && typeof resource.url === 'string'
            && resource.url.trim()
            && isHttpUrl(resource.url))
    );
}

async function createCourse(req, res, next) {
    try {
        const payload = coursePayload(req.body);
        if (!payload.title || !payload.description || !payload.category || !payload.duration) {
            return res.status(400).json({ message: 'Title, description, category, and duration are required' });
        }
        if (payload.lessons !== undefined && !validateLessons(payload.lessons)) {
            return res.status(400).json({ message: 'Each lesson needs a title and valid resources' });
        }
        const course = await Course.create({ ...payload, teacher: req.user.id });
        const populated = await course.populate('teacher', 'name email subject');
        res.status(201).json({ course: (await withEnrollmentCounts([populated], true))[0] });
    } catch (error) { next(error); }
}

async function updateCourse(req, res, next) {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        const isOwner = course.teacher.toString() === req.user.id;
        if (req.user.role !== 'admin' && !isOwner) {
            return res.status(403).json({ message: 'You can only edit your own courses' });
        }
        const payload = coursePayload(req.body);
        if (payload.lessons !== undefined && !validateLessons(payload.lessons)) {
            return res.status(400).json({ message: 'Each lesson needs a title and valid resources' });
        }
        Object.assign(course, payload);
        await course.save();
        const populated = await course.populate('teacher', 'name email subject');
        res.json({ course: (await withEnrollmentCounts([populated], true))[0] });
    } catch (error) { next(error); }
}

async function deleteCourse(req, res, next) {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        const isOwner = course.teacher.toString() === req.user.id;
        if (req.user.role !== 'admin' && !isOwner) {
            return res.status(403).json({ message: 'You can only delete your own courses' });
        }
        await Enrollment.deleteMany({ course: course._id });
        await course.deleteOne();
        res.json({ message: 'Course deleted' });
    } catch (error) { next(error); }
}

module.exports = { listCourses, getCourse, getMyCourses, uploadThumbnail, createCourse, updateCourse, deleteCourse };
