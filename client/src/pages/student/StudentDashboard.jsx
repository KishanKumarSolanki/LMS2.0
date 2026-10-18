import { Link } from 'react-router-dom';
import { FiBookOpen, FiTrendingUp, FiCheckCircle, FiTarget, FiArrowRight, FiPlay } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useStudent } from '../../context/StudentContext';
import { courseId } from '../../lib/api';

export default function StudentDashboard() {
    const { user } = useAuth();
    const { enrolledCourses, getProgress, loading, error } = useStudent();
    const withProgress = enrolledCourses.map((course) => ({ ...course, pct: getProgress(courseId(course)) }));
    const inProgress = withProgress.filter((course) => course.pct < 100).sort((a, b) => b.pct - a.pct);
    const completed = withProgress.filter((course) => course.pct === 100);
    const average = withProgress.length ? Math.round(withProgress.reduce((sum, course) => sum + course.pct, 0) / withProgress.length) : 0;
    const firstName = user?.name?.split(' ')[0] || 'there';
    const stats = [
        { label: 'Enrolled courses', value: withProgress.length, icon: FiBookOpen, color: '#4f46e5', bg: 'rgba(99,102,241,0.12)' },
        { label: 'In progress', value: inProgress.length, icon: FiTrendingUp, color: '#0e7490', bg: 'rgba(6,182,212,0.14)' },
        { label: 'Completed', value: completed.length, icon: FiCheckCircle, color: '#047857', bg: 'rgba(16,185,129,0.14)' },
        { label: 'Average progress', value: `${average}%`, icon: FiTarget, color: '#7c3aed', bg: 'rgba(139,92,246,0.14)' },
    ];

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="page-title">Welcome back, {firstName}</h1>
                <p className="page-sub">{inProgress.length ? `You have ${inProgress.length} course${inProgress.length > 1 ? 's' : ''} in progress.` : 'Your purchased courses will appear here.'}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                {stats.map((stat) => (
                    <div key={stat.label} className="stat-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div><p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.4rem' }}>{stat.label}</p><p style={{ fontWeight: 800, fontSize: '2rem', fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>{stat.value}</p></div>
                            <div style={{ width: 46, height: 46, borderRadius: 12, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><stat.icon size={21} style={{ color: stat.color }} /></div>
                        </div>
                    </div>
                ))}
            </div>
            <section className="panel">
                <div className="panel-header"><h3>Continue learning</h3><Link to="/student/enrolled" className="btn-ghost">View all <FiArrowRight size={14} /></Link></div>
                {loading ? <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading your courses…</div>
                    : error ? <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', color: '#b91c1c' }}>{error}</div>
                        : !inProgress.length ? <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}><p style={{ marginBottom: '1rem' }}>No purchased courses yet.</p><Link to="/student/browse" className="btn-primary">Browse courses</Link></div>
                            : inProgress.slice(0, 4).map((course) => (
                                <div key={courseId(course)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                                    <img src={course.thumbnail} alt="" style={{ width: 84, height: 54, objectFit: 'cover', borderRadius: 8, background: 'var(--bg-secondary)', flexShrink: 0 }} onError={(event) => { event.currentTarget.style.visibility = 'hidden'; }} />
                                    <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{course.title}</div><div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><div className="progress-bar" style={{ flex: 1 }}><div className="progress-fill" style={{ width: `${course.pct}%` }} /></div><span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600, minWidth: 34, textAlign: 'right' }}>{course.pct}%</span></div></div>
                                    <Link to={`/student/learn/${courseId(course)}`} className="btn-primary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}><FiPlay size={13} /> Resume</Link>
                                </div>
                            ))}
            </section>
        </div>
    );
}
