import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowUpRight, FiBook, FiEdit2, FiImage, FiPlus, FiTrendingUp, FiUsers } from 'react-icons/fi';
import { courseApi, courseId } from '../../lib/api';

export default function TeacherDashboard() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        courseApi.mine()
            .then(({ courses: result }) => setCourses(result))
            .catch((requestError) => setError(requestError.message))
            .finally(() => setLoading(false));
    }, []);

    const students = courses.reduce((total, course) => total + (course.enrollmentCount || 0), 0);
    const stats = [
        { label: 'My Courses', value: courses.length, icon: FiBook, tone: 'violet' },
        { label: 'Students', value: students, icon: FiUsers, tone: 'cyan' },
        { label: 'Published', value: courses.filter((course) => course.isPublished).length, icon: FiTrendingUp, tone: 'green' },
    ];

    return (
        <div className="teacher-dashboard">
            <header className="teacher-dashboard-heading">
                <div>
                    <span className="teacher-dashboard-kicker">TEACHING OVERVIEW</span>
                    <h1 className="page-title">Teacher Dashboard</h1>
                    <p className="page-sub">Your courses and student activity, all in one place.</p>
                </div>
                <Link to="/teacher/create-course" className="btn-primary"><FiPlus size={16} /> Create course</Link>
            </header>

            <section className="teacher-stats-grid" aria-label="Teaching statistics">
                {stats.map(({ label, value, icon: Icon, tone }) => (
                    <article key={label} className="teacher-stat-card">
                        <div className="teacher-stat-copy"><span>{label}</span><strong>{loading ? '—' : value.toLocaleString()}</strong></div>
                        <span className={`teacher-stat-icon ${tone}`}><Icon size={20} /></span>
                    </article>
                ))}
            </section>

            <section className="teacher-courses-panel">
                <header className="teacher-courses-header">
                    <div><h2>My courses</h2><p>Recently updated courses and enrollment status.</p></div>
                    <Link to="/teacher/my-courses" className="btn-ghost">View all <FiArrowUpRight size={15} /></Link>
                </header>

                {loading ? (
                    <div className="teacher-courses-state" role="status">Loading your courses…</div>
                ) : error ? (
                    <div className="teacher-courses-state teacher-courses-error" role="alert">{error}</div>
                ) : !courses.length ? (
                    <div className="teacher-courses-state teacher-courses-empty">
                        <span className="teacher-empty-icon"><FiBook size={21} /></span>
                        <h3>Start with your first course</h3>
                        <p>Create a course to begin sharing your expertise with students.</p>
                        <Link to="/teacher/create-course" className="btn-primary"><FiPlus size={15} /> Create your first course</Link>
                    </div>
                ) : (
                    <div className="teacher-course-list">
                        {courses.slice(0, 5).map((course) => (
                            <article className="teacher-course-row" key={courseId(course)}>
                                <div className="teacher-course-cover">
                                    {course.thumbnail && <img src={course.thumbnail} alt="" onError={(event) => { event.currentTarget.style.display = 'none'; event.currentTarget.nextElementSibling.style.display = 'grid'; }} />}
                                    <span className="teacher-course-cover-fallback" style={{ display: course.thumbnail ? 'none' : 'grid' }}><FiImage size={20} /></span>
                                </div>
                                <div className="teacher-course-info">
                                    <h3>{course.title}</h3>
                                    <p>{course.category || 'Course'} <span aria-hidden="true">·</span> {course.enrollmentCount || 0} {(course.enrollmentCount || 0) === 1 ? 'student' : 'students'}</p>
                                </div>
                                <span className={`badge ${course.isPublished ? 'badge-success' : 'badge-warning'}`}>{course.isPublished ? 'Published' : 'Draft'}</span>
                                <div className="teacher-course-actions">
                                    <Link to={`/teacher/create-course/${courseId(course)}`} className="icon-btn" title="Edit course" aria-label={`Edit ${course.title}`}><FiEdit2 size={15} /></Link>
                                    <Link to={`/teacher/course-students/${courseId(course)}`} className="icon-btn" title="View students" aria-label={`View students for ${course.title}`}><FiUsers size={15} /></Link>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
