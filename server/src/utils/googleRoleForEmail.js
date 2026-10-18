function googleRoleForEmail(email, adminEmails = [], teacherEmails = []) {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (adminEmails.includes(normalizedEmail)) return 'admin';
    if (teacherEmails.includes(normalizedEmail)) return 'teacher';
    return null;
}

module.exports = googleRoleForEmail;