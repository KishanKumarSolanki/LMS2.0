export function getCourseLessons(course) {
  if (course?.lessons?.length) {
    return course.lessons.map((lesson, index) => ({
      ...lesson,
      id: String(lesson._id || lesson.id || `lesson-${index}`),
      resources: lesson.resources || [],
    }));
  }

  return (course?.syllabus || []).map((title, index) => ({
    id: `legacy-${index}`,
    title,
    description: '',
    videoUrl: '',
    resources: [],
  }));
}

export function getCompletedLessonIds(enrollment) {
  const completed = new Set((enrollment?.completedLessons || []).map(String));
  return getCourseLessons(enrollment?.course)
    .filter((lesson, index) => completed.has(lesson.id) || completed.has(String(index)))
    .map((lesson) => lesson.id);
}

export function getVideoEmbedUrl(value) {
  if (!value) return '';

  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return '';

    if (['youtu.be', 'www.youtu.be'].includes(url.hostname)) {
      const videoId = url.pathname.split('/').filter(Boolean)[0];
      return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : '';
    }

    if (['youtube.com', 'www.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'].includes(url.hostname)) {
      const videoId = url.searchParams.get('v') || url.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/)?.[1];
      return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : '';
    }

    if (['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'].includes(url.hostname)) {
      const videoId = url.pathname.match(/\/(?:video\/)?(\d+)/)?.[1];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : '';
    }
  } catch {
    return '';
  }

  return '';
}

export function isDirectVideoUrl(value) {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) && /\.(mp4|webm|ogg)$/i.test(url.pathname);
  } catch {
    return false;
  }
}