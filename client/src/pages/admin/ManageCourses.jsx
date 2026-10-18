import { useEffect, useState } from 'react';
import { FiEye, FiEyeOff, FiSearch, FiTrash2 } from 'react-icons/fi';
import { courseApi, courseId, instructorName } from '../../lib/api';

export default function ManageCourses() {
    const [courses, setCourses] = useState([]);
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');
    const load = () => courseApi.list(true).then(({ courses: result }) => setCourses(result)).catch((requestError) => setError(requestError.message));
    useEffect(() => { load(); }, []);
    const update = async (course, payload) => { try { await courseApi.update(courseId(course), payload); await load(); } catch (requestError) { setError(requestError.message); } };
    const remove = async (course) => { if (!window.confirm('Delete this course?')) return; try { await courseApi.remove(courseId(course)); await load(); } catch (requestError) { setError(requestError.message); } };
    const filtered = courses.filter((course) => `${course.title} ${instructorName(course)}`.toLowerCase().includes(search.toLowerCase()));
    return <div><div style={{ marginBottom: '2rem' }}><h1 className="page-title">Manage Courses</h1><p className="page-sub">Publish, unpublish, and manage courses.</p></div>{error && <p style={{ color: '#b91c1c' }}>{error}</p>}<div style={{ position: 'relative', maxWidth: 320, marginBottom: '1.25rem' }}><FiSearch size={15} style={{ position: 'absolute', top: '50%', left: 12, transform: 'translateY(-50%)' }} /><input className="form-input" style={{ paddingLeft: 36 }} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search courses" /></div><div className="table-wrap"><table className="data-table"><thead><tr><th>Course</th><th>Instructor</th><th>Students</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead><tbody>{filtered.map((course) => <tr key={courseId(course)}><td>{course.title}</td><td>{instructorName(course)}</td><td>{course.enrollmentCount || 0}</td><td>₹{(course.price || 0).toLocaleString()}</td><td><span className={`badge ${course.isPublished ? 'badge-success' : 'badge-warning'}`}>{course.isPublished ? 'Published' : 'Draft'}</span></td><td><button className="btn-outline" onClick={() => update(course, { isPublished: !course.isPublished })}>{course.isPublished ? <FiEyeOff size={15} /> : <FiEye size={15} />}</button><button className="btn-outline" style={{ color: '#b91c1c', marginLeft: 8 }} onClick={() => remove(course)}><FiTrash2 size={15} /></button></td></tr>)}{!filtered.length && <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No courses found.</td></tr>}</tbody></table></div></div>;
}
