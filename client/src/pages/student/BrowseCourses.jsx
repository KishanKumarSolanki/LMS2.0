import { useEffect, useMemo, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import CourseCard from '../../components/CourseCard';
import { useStudent } from '../../context/StudentContext';
import { courseApi, courseId, instructorName } from '../../lib/api';

export default function BrowseCourses() {
    const { isEnrolled, enroll } = useStudent();
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('All');
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [purchaseError, setPurchaseError] = useState('');

    useEffect(() => {
        courseApi.list()
            .then(({ courses: result }) => setCourses(result))
            .catch((requestError) => setError(requestError.message))
            .finally(() => setLoading(false));
    }, []);

    const categories = useMemo(() => ['All', ...new Set(courses.map((course) => course.category).filter(Boolean))], [courses]);
    const filtered = courses.filter((course) => {
        const normalized = query.trim().toLowerCase();
        return (!normalized || course.title.toLowerCase().includes(normalized) || instructorName(course).toLowerCase().includes(normalized))
            && (category === 'All' || course.category === category);
    });
    const handlePurchase = async (id) => {
        try { await enroll(id); setPurchaseError(''); } catch (requestError) { setPurchaseError(requestError.message); }
    };

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}><h1 className="page-title">Browse Courses</h1><p className="page-sub">Purchase a course to add it to your dashboard.</p></div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.75rem' }}>
                <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: 420 }}><FiSearch size={17} style={{ position: 'absolute', left: '0.95rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} /><input className="form-input" style={{ paddingLeft: '2.6rem' }} placeholder="Search by course or instructor" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`chip${category === item ? ' active' : ''}`}>{item}</button>)}</div>
            </div>
            {purchaseError && <p style={{ color: '#b91c1c', marginBottom: '1rem' }}>{purchaseError}</p>}
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>{filtered.length} course{filtered.length !== 1 ? 's' : ''} found</p>
            {loading ? <div className="empty-state"><p>Loading courses…</p></div>
                : error ? <div className="empty-state"><h3 style={{ marginBottom: '0.5rem' }}>Could not load courses</h3><p>{error}</p></div>
                    : !filtered.length ? <div className="empty-state"><h3 style={{ marginBottom: '0.5rem' }}>No courses match your search</h3><p>Try a different keyword or clear the category filter.</p></div>
                        : <div className="course-grid">{filtered.map((course) => <CourseCard key={courseId(course)} course={course} enrolled={isEnrolled(courseId(course))} onEnroll={handlePurchase} />)}</div>}
        </div>
    );
}
