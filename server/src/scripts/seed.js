const connectDB = require('../config/database');
const User = require('../models/User');
const ENV = require('../config/env');
const mongoose = require('mongoose');

async function syncGoogleRoles() {
    await connectDB();
    const adminEmails = ENV.ADMIN_EMAILS;
    const teacherEmails = ENV.TEACHER_EMAILS.filter((email) => !adminEmails.includes(email));
    const admins = adminEmails.length
        ? await User.updateMany({ email: { $in: adminEmails } }, { $set: { role: 'admin' } })
        : { modifiedCount: 0 };
    const teachers = teacherEmails.length
        ? await User.updateMany({ email: { $in: teacherEmails } }, { $set: { role: 'teacher' } })
        : { modifiedCount: 0 };

    console.log(`Google roles synchronized: ${admins.modifiedCount} admins, ${teachers.modifiedCount} teachers`);
}

syncGoogleRoles()
    .catch(() => {
        console.error('Could not synchronize Google roles. Check the database connection and role email lists.');
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
