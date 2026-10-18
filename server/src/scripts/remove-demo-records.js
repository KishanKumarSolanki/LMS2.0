const mongoose = require('mongoose');
const connectDB = require('../config/database');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Payment = require('../models/Payment');

const demoEmails = ['admin@lms.com', 'teacher@lms.com', 'student@lms.com'];
const applyChanges = process.argv.includes('--apply');

async function removeDemoRecords() {
    await connectDB();
    const users = await User.find({ email: { $in: demoEmails } }).select('_id').lean();
    const userIds = users.map((user) => user._id);
    const courseIds = userIds.length
        ? await Course.distinct('_id', { teacher: { $in: userIds } })
        : [];
    const relatedFilter = {
        $or: [
            { student: { $in: userIds } },
            { course: { $in: courseIds } },
        ],
    };
    const counts = {
        users: users.length,
        courses: courseIds.length,
        enrollments: await Enrollment.countDocuments(relatedFilter),
        payments: await Payment.countDocuments(relatedFilter),
    };

    if (!applyChanges) {
        console.log(`Dry run only. Matching demo records: ${JSON.stringify(counts)}. Rerun with --apply to delete these records.`);
        return;
    }

    await Enrollment.deleteMany(relatedFilter);
    await Payment.deleteMany(relatedFilter);
    await Course.deleteMany({ _id: { $in: courseIds } });
    await User.deleteMany({ email: { $in: demoEmails } });
    console.log(`Deleted matching demo records: ${JSON.stringify(counts)}`);
}

removeDemoRecords()
    .catch(() => {
        console.error('Could not clean demo records. Check the database connection.');
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());