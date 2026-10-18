import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft, FiTrendingUp, FiUsers } from 'react-icons/fi';
import { courseApi, enrollmentApi } from '../../lib/api';

export default function CourseStudents() {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [enrollments, setEnrollments] = useState([]);
    const [error, setError] = useState('');
    useEffect(() => { Promise.all([courseApi.get(id), enrollmentApi.courseStudents(id)]).then(([courseResult, studentResult]) => { setCourse(courseResult.course); setEnrollments(studentResult); }).catch((requestError) => setError(requestError.message)); }, [id]);
    const average = enrollments.length ? Math.round(enrollments.reduce((sum, item) => sum + item.progress, 0) / enrollments.length) : 0;
    if (error) return <div className="empty-state"><h3>Could not load students</h3><p>{error}</p></div>;
    return <div><Link to="/teacher/my-courses" className="btn-ghost"><FiArrowLeft size={15} /> My courses</Link><div style={{ margin: '1.5rem 0' }}><h1 className="page-title">{course?.title || 'Loading course…'}</h1><p className="page-sub">Enrolled students and progress.</p></div><div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}><div className="stat-card"><FiUsers /> {enrollments.length} students</div><div className="stat-card"><FiTrendingUp /> {average}% average progress</div></div>{!enrollments.length ? <div className="empty-state"><h3>No students yet</h3><p>Students will appear here after they purchase this course.</p></div> : <div className="table-wrap"><table className="data-table"><thead><tr><th>Student</th><th>Email</th><th>Progress</th><th>Enrolled</th></tr></thead><tbody>{enrollments.map((item) => <tr key={item._id}><td>{item.student?.name}</td><td>{item.student?.email}</td><td>{item.progress}%</td><td>{new Date(item.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div>}</div>;
}
