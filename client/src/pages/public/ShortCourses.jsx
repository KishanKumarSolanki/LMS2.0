import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import CourseCard from '../../components/CourseCard';
import { FiSearch, FiZap } from 'react-icons/fi';
import { courseApi, courseId } from '../../lib/api';

export default function ShortCourses() {
    const [courses, setCourses] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    useEffect(() => { courseApi.list().then(({ courses: result }) => setCourses(result.filter((course) => course.isShort))).finally(() => setLoading(false)); }, []);
    const filtered = courses.filter((course) => course.title.toLowerCase().includes(search.toLowerCase()) || course.category.toLowerCase().includes(search.toLowerCase()));
    return <div style={{ minHeight: '100vh', background: 'var(--bg)' }}><Navbar /><section style={{ padding: '7rem 1.5rem 4rem', textAlign: 'center' }}><div style={{ maxWidth: 650, margin: '0 auto' }}><div className="badge badge-primary" style={{ marginBottom: '1.5rem' }}><FiZap size={14} /> Quick & Focused Learning</div><h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '1rem' }}>Short Courses</h1><p style={{ color: 'var(--text-2)', lineHeight: 1.7, marginBottom: '2rem' }}>Build focused skills in less time.</p><div style={{ position: 'relative', maxWidth: 460, margin: '0 auto' }}><FiSearch size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} /><input className="form-input" style={{ paddingLeft: '2.75rem' }} placeholder="Search short courses..." value={search} onChange={(event) => setSearch(event.target.value)} /></div></div></section><section style={{ padding: '3rem 1.5rem 6rem' }}><div style={{ maxWidth: 1280, margin: '0 auto' }}>{loading ? <div className="empty-state"><p>Loading courses…</p></div> : !filtered.length ? <div className="empty-state"><h3>No short courses found</h3><p>New short courses will appear here when instructors publish them.</p></div> : <div className="course-grid">{filtered.map((course) => <CourseCard key={courseId(course)} course={course} />)}</div>}</div></section><Footer /></div>;
}
