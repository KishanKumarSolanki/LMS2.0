import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft, FiArrowRight, FiCheck, FiCheckCircle, FiDownload, FiExternalLink, FiPlay } from 'react-icons/fi';
import { useStudent } from '../../context/StudentContext';
import { courseId, instructorName } from '../../lib/api';
import { getCourseLessons, getVideoEmbedUrl, isDirectVideoUrl } from '../../lib/courseLesson';

export default function CourseLearning() {
  const { id } = useParams();
  const { enrolledCourses, getCompleted, getProgress, toggleLesson, loading } = useStudent();
  const [active, setActive] = useState(null);
  const [error, setError] = useState('');
  const course = enrolledCourses.find((item) => courseId(item) === id);

  if (loading) return <div className="empty-state"><p>Loading course…</p></div>;
  if (!course) return <div className="empty-state"><h3 style={{ marginBottom: '0.5rem' }}>This course is not in your library</h3><p style={{ marginBottom: '1.5rem' }}>Enroll in a course to access its lessons.</p><Link to="/student/browse" className="btn-primary">Browse courses</Link></div>;

  const lessons = getCourseLessons(course);
  const done = getCompleted(id);
  const pct = getProgress(id);
  const firstOpen = lessons.findIndex((lesson) => !done.includes(lesson.id));
  const current = Math.min(active ?? (firstOpen === -1 ? 0 : firstOpen), Math.max(lessons.length - 1, 0));
  const lesson = lessons[current];
  const isDone = lesson ? done.includes(lesson.id) : false;
  const embedUrl = getVideoEmbedUrl(lesson?.videoUrl);
  const directVideo = isDirectVideoUrl(lesson?.videoUrl);

  const markComplete = async () => {
    try {
      await toggleLesson(id, lesson.id);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div>
      <Link to="/student/enrolled" className="btn-ghost" style={{ marginLeft: '-0.9rem', marginBottom: '0.5rem' }}><FiArrowLeft size={15} /> My courses</Link>
      <div style={{ marginBottom: '1.5rem' }}><h1 className="page-title">{course.title}</h1><p className="page-sub">by {instructorName(course)}</p></div>
      {!lessons.length ? <div className="empty-state"><h3 style={{ marginBottom: '0.5rem' }}>Lessons are coming soon</h3><p>Your enrollment is active; the instructor has not added lesson content yet.</p></div> : (
        <div className="learning-layout">
          <section>
            <div className="lesson-player">
              {embedUrl ? <iframe src={embedUrl} title={lesson.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
                : directVideo ? <video src={lesson.videoUrl} controls preload="metadata">Your browser does not support embedded video.</video>
                  : <div className="lesson-player-empty"><span className="lesson-play-icon"><FiPlay size={24} /></span><span>Lesson {current + 1} of {lessons.length}</span><strong>{lesson.title}</strong>{lesson.videoUrl && <a href={lesson.videoUrl} target="_blank" rel="noreferrer">Open lesson video <FiExternalLink size={14} /></a>}</div>}
            </div>
            <div className="panel" style={{ marginTop: '1.25rem', padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>{lesson.title}</h2>
              <p style={{ color: 'var(--text-2)', fontSize: '0.92rem', lineHeight: 1.7, marginBottom: '1.25rem', whiteSpace: 'pre-line' }}>{lesson.description || 'Work through this lesson, then mark it complete to update your course progress.'}</p>
              {lesson.resources.length > 0 && <div style={{ marginBottom: '1.25rem' }}><h3 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Lesson resources</h3><ul className="lesson-resources">{lesson.resources.map((resource, index) => <li key={resource._id || resource.url || index}><a href={resource.url} target="_blank" rel="noreferrer"><FiDownload size={15} /> {resource.title || `Resource ${index + 1}`} <FiExternalLink size={13} /></a></li>)}</ul></div>}
              {error && <p role="alert" style={{ color: '#b91c1c', marginBottom: '1rem' }}>{error}</p>}
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <button className="btn-outline" onClick={() => setActive(current - 1)} disabled={current === 0}><FiArrowLeft size={15} /> Previous</button>
                <button className={isDone ? 'btn-outline' : 'btn-primary'} onClick={markComplete} style={isDone ? { color: '#047857' } : undefined}><FiCheck size={15} /> {isDone ? 'Completed' : 'Mark as complete'}</button>
                <button className="btn-outline" onClick={() => setActive(current + 1)} disabled={current === lessons.length - 1}>Next <FiArrowRight size={15} /></button>
              </div>
            </div>
          </section>
          <aside className="panel lesson-aside">
            <div style={{ padding: '1.1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.6rem' }}><h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Course content</h3><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{done.length}/{lessons.length} done</span></div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.4rem' }}>{pct}% complete</div>
            </div>
            <ul style={{ listStyle: 'none', padding: '0.5rem' }}>{lessons.map((item, index) => {
              const finished = done.includes(item.id);
              const selected = index === current;
              return <li key={item.id}><button onClick={() => setActive(index)} aria-current={selected ? 'true' : undefined} className={`lesson-list-item${selected ? ' selected' : ''}`}>{finished ? <FiCheckCircle size={18} style={{ color: '#059669', flexShrink: 0 }} /> : <span className="lesson-status-dot" />}<span>{index + 1}. {item.title}</span></button></li>;
            })}</ul>
          </aside>
        </div>
      )}
    </div>
  );
}