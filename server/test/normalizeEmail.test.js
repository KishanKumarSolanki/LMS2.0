const assert = require('node:assert/strict');
const { test } = require('node:test');
const normalizeEmail = require('../src/utils/normalizeEmail');

test('normalizes email addresses for case-insensitive authentication', () => {
    assert.equal(normalizeEmail('  Student@Example.com  '), 'student@example.com');
});

test('returns an empty value for non-string email input', () => {
    assert.equal(normalizeEmail(undefined), '');
    assert.equal(normalizeEmail(null), '');
});
