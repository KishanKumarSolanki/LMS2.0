import { useEffect, useState } from 'react';
import { enrollmentApi } from '../../lib/api';

export default function Enrollments() {
    const [enrollments, setEnrollments] = useState([]);
    const [error, setError] = useState('');
    useEffect(() => { enrollmentApi.all().then(setEnrollments).catch((requestError) => setError(requestError.message)); }, []);
    const completed = enrollments.filter((item) => item.progress === 100).length;
    return <div><div style={{ marginBottom: '2rem' }}><h1 className="page-title">Enrollments</h1><p className="page-sub">Purchases and course progress from your database.</p></div>{error && <p style={{ color: '#b91c1c' }}>{error}</p>}<div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}><div className="stat-card">Total: {enrollments.length}</div><div className="stat-card">Completed: {completed}</div></div><div className="table-wrap"><table className="data-table"><thead><tr><th>Student</th><th>Course</th><th>Progress</th><th>Purchased</th></tr></thead><tbody>{enrollments.map((item) => <tr key={item._id}><td>{item.student?.name || 'Deleted user'}</td><td>{item.course?.title || 'Deleted course'}</td><td>{item.progress}%</td><td>{new Date(item.createdAt).toLocaleDateString()}</td></tr>)}{!enrollments.length && <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No enrollments yet.</td></tr>}</tbody></table></div></div>;
}
