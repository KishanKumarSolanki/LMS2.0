import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getCompletedLessonIds, getCourseLessons, getVideoEmbedUrl, isDirectVideoUrl } from '../src/lib/courseLessons.js';

test('normalizes structured lessons and preserves stable IDs', () => {
  const lessons = getCourseLessons({ lessons: [{ _id: 'lesson-1', title: 'Intro', resources: [] }] });
  assert.equal(lessons[0].id, 'lesson-1');
  assert.equal(lessons[0].title, 'Intro');
});

test('keeps legacy syllabus progress readable', () => {
  const enrollment = { course: { syllabus: ['Intro', 'Practice'] }, completedLessons: ['1'] };
  assert.deepEqual(getCourseLessons(enrollment.course).map((lesson) => lesson.id), ['legacy-0', 'legacy-1']);
  assert.deepEqual(getCompletedLessonIds(enrollment), ['legacy-1']);
});

test('embeds supported video providers and rejects unsafe or unknown URLs', () => {
  assert.equal(getVideoEmbedUrl('https://youtu.be/abc123'), 'https://www.youtube-nocookie.com/embed/abc123');
  assert.equal(getVideoEmbedUrl('https://vimeo.com/12345'), 'https://player.vimeo.com/video/12345');
  assert.equal(getVideoEmbedUrl('javascript:alert(1)'), '');
  assert.equal(getVideoEmbedUrl('https://example.com/video'), '');
  assert.equal(isDirectVideoUrl('https://cdn.example.com/lesson.mp4'), true);
  assert.equal(isDirectVideoUrl('javascript:alert(1)'), false);
});