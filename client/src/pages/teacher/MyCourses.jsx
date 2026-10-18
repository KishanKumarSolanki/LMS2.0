import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEdit2, FiEye, FiImage, FiPlusCircle, FiTrash2 } from 'react-icons/fi';
import { courseApi, courseId } from '../../lib/api';

export default function MyCourses() {
    const [courses, setCourses] = useState([]);
    const [error, setError] = useState('');
    const load = () => courseApi.mine().then(({ courses: result }) => setCourses(result)).catch((requestError) => setError(requestError.message));
    useEffect(() => { load(); }, []);
    const remove = async (id) => { if (!window.confirm('Delete this course?')) return; try { await courseApi.remove(id); await load(); } catch (requestError) { setError(requestError.message); } };
    return <div className="teacher-my-courses">
        <div className="teacher-my-courses-heading">
            <div><h1 className="page-title">My Courses</h1><p className="page-sub">Courses you have created.</p></div>
            <Link to="/teacher/create-course" className="btn-primary"><FiPlusCircle size={16} /> Create New Course</Link>
        </div>
        {error && <p role="alert" className="teacher-my-courses-error">{error}</p>}
        {!courses.length ? (
            <div className="empty-state"><h3>No courses yet</h3><p style={{ marginBottom: '1rem' }}>Create your first course to start teaching.</p><Link to="/teacher/create-course" className="btn-primary">Create course</Link></div>
        ) : (
            <div className="course-grid teacher-my-courses-grid">
                {courses.map((course) => <article key={courseId(course)} className="course-card">
                    <div className="course-thumb teacher-my-course-thumb">
                        {course.thumbnail && <img src={course.thumbnail} alt={course.title} onError={(event) => { event.currentTarget.style.display = 'none'; event.currentTarget.nextElementSibling.style.display = 'grid'; }} />}
                        <div className="course-thumb-empty" style={{ display: course.thumbnail ? 'none' : 'grid' }}><FiImage size={26} /><span>Thumbnail unavailable</span></div>
                        <span className={`badge ${course.isPublished ? 'badge-success' : 'badge-warning'}`} style={{ position: 'absolute', right: 12, top: 12 }}>{course.isPublished ? 'Published' : 'Draft'}</span>
                    </div>
                    <div className="teacher-my-course-content">
                        <h3>{course.title}</h3>
                        <p>{course.enrollmentCount || 0} enrolled students <span aria-hidden="true">·</span> ₹{(course.price || 0).toLocaleString()}</p>
                        <div className="teacher-my-course-actions">
                            <Link to={`/teacher/course-students/${courseId(course)}`} className="btn-outline" aria-label={`View students for ${course.title}`} title="View students"><FiEye size={15} /></Link>
                            <Link to={`/teacher/create-course/${courseId(course)}`} className="btn-outline" aria-label={`Edit ${course.title}`} title="Edit course"><FiEdit2 size={15} /></Link>
                            <button onClick={() => remove(courseId(course))} className="btn-outline teacher-my-course-delete" aria-label={`Delete ${course.title}`} title="Delete course"><FiTrash2 size={15} /></button>
                        </div>
                    </div>
                </article>)}
            </div>
        )}
    </div>;
}
