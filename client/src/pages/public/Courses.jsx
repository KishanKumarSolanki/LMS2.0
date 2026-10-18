import { useEffect, useMemo, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import CourseCard from '../../components/CourseCard';
import { FiFilter, FiSearch } from 'react-icons/fi';
import { courseApi, courseId, instructorName } from '../../lib/api';

const levels = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];

export default function Courses() {
    const [courses, setCourses] = useState([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [level, setLevel] = useState('All Levels');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        courseApi.list().then(({ courses: result }) => setCourses(result)).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false));
    }, []);
    const categories = useMemo(() => ['All', ...new Set(courses.map((course) => course.category).filter(Boolean))], [courses]);
    const filtered = courses.filter((course) => {
        const query = search.trim().toLowerCase();
        return (!query || course.title.toLowerCase().includes(query) || instructorName(course).toLowerCase().includes(query))
            && (category === 'All' || course.category === category)
            && (level === 'All Levels' || course.level === level);
    });

    return <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <Navbar />
        <section style={{ padding: '7rem 1.5rem 3rem', textAlign: 'center', background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.1) 0%, transparent 50%)' }}><div style={{ maxWidth: 650, margin: '0 auto' }}><p style={{ color: 'var(--primary-dark)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '1rem' }}>Explore</p><h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '1rem' }}>All <span className="gradient-text">Courses</span></h1><p style={{ color: 'var(--text-2)', lineHeight: 1.7, marginBottom: '2rem' }}>Explore courses published by our instructors.</p><div style={{ position: 'relative', maxWidth: 500, margin: '0 auto' }}><FiSearch size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} /><input className="form-input" style={{ paddingLeft: '2.75rem', fontSize: '1rem' }} placeholder="Search courses or instructors..." value={search} onChange={(event) => setSearch(event.target.value)} /></div></div></section>
        <section style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}><div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}><div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}><FiFilter size={16} style={{ color: 'var(--text-muted)', margin: 'auto 0' }} />{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`chip${category === item ? ' active' : ''}`}>{item}</button>)}</div><select className="form-input" style={{ width: 'auto' }} value={level} onChange={(event) => setLevel(event.target.value)}>{levels.map((item) => <option key={item}>{item}</option>)}</select></div></section>
        <section style={{ padding: '3rem 1.5rem 5rem' }}><div style={{ maxWidth: 1280, margin: '0 auto' }}><p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>Showing <strong style={{ color: 'var(--primary-dark)' }}>{filtered.length}</strong> course{filtered.length !== 1 ? 's' : ''}</p>{loading ? <div className="empty-state"><p>Loading courses…</p></div> : error ? <div className="empty-state"><h3>Could not load courses</h3><p>{error}</p></div> : !filtered.length ? <div className="empty-state"><h3>No courses found</h3><p>Try adjusting your search or filters.</p></div> : <div className="course-grid">{filtered.map((course) => <CourseCard key={courseId(course)} course={course} />)}</div>}</div></section>
        <Footer />
    </div>;
}
