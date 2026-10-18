import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import { FiStar, FiClock, FiAward, FiCheckCircle, FiPlay, FiBookOpen, FiArrowLeft } from 'react-icons/fi';
import { courseApi, enrollmentApi, instructorName, paymentApi } from '../../lib/api';
import { getCourseLessons } from '../../lib/courseLesson';

const levelColors = { Beginner: '#10b981', Intermediate: '#f59e0b', Advanced: '#ef4444' };

function loadRazorpay() {
    if (window.Razorpay) return Promise.resolve(true);
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

export default function CourseDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [enrolled, setEnrolled] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadedCourseKey, setLoadedCourseKey] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;
        courseApi.get(id)
            .then(({ course: result }) => {
                if (!active) return;
                setCourse(result);
                setEnrolled(Boolean(result.isEnrolled));
                setError('');
            })
            .catch((requestError) => {
                if (!active) return;
                setCourse(null);
                setError(requestError.message);
            })
            .finally(() => {
                if (!active) return;
                setLoadedCourseKey(`${id}:${user?.id || ''}`);
                setLoading(false);
            });
        return () => { active = false; };
    }, [id, user?.id]);

    if (loading || loadedCourseKey !== `${id}:${user?.id || ''}`) return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>Loading course…</div>;

    if (!course) return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>😕</div>
                <h2 style={{ marginBottom: '1rem' }}>{error || 'Course not found'}</h2>
                <Link to="/courses" className="btn-primary"><FiArrowLeft size={15} /> Back to courses</Link>
            </div>
        </div>
    );

    const handleEnroll = async () => {
        if (!user) { navigate('/login'); return; }
        if (user.role !== 'student') return;
        setPaymentLoading(true);
        setError('');
        try {
            if (Number(course.price) === 0) {
                await enrollmentApi.enroll(id);
                setEnrolled(true);
                navigate('/student/enrolled');
                return;
            }

            const order = await paymentApi.createOrder(id);
            if (!await loadRazorpay()) throw new Error('Payment checkout could not be loaded. Please try again.');

            const checkout = new window.Razorpay({
                key: order.keyId,
                amount: order.amount,
                currency: order.currency,
                name: 'LearnPro',
                description: order.courseName,
                order_id: order.orderId,
                prefill: { name: user.name, email: user.email },
                handler: async (response) => {
                    try {
                        await paymentApi.verify(response);
                        setEnrolled(true);
                        navigate('/student/enrolled');
                    } catch (requestError) {
                        setError(requestError.message);
                    } finally {
                        setPaymentLoading(false);
                    }
                },
                modal: { ondismiss: () => setPaymentLoading(false) },
            });
            checkout.on('payment.failed', (response) => {
                setError(response.error?.description || 'Payment was not completed. Please try again.');
                setPaymentLoading(false);
            });
            checkout.open();
        } catch (requestError) {
            setError(requestError.message);
            setPaymentLoading(false);
        }
    };

    const levelColor = levelColors[course.level];
    const lessons = getCourseLessons(course);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
            <Navbar />

            <section style={{ padding: '6.5rem 1.5rem 5rem', background: 'linear-gradient(to bottom, rgba(99,102,241,0.07) 0, transparent 420px)' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <Link to="/courses" className="btn-ghost" style={{ marginLeft: '-0.9rem', marginBottom: '1rem' }}>
                        <FiArrowLeft size={15} /> Back to courses
                    </Link>

                    <div className="detail-grid">
                        {/* Main column */}
                        <div>
                            <span className="badge badge-primary" style={{ marginBottom: '1rem' }}>{course.category}</span>
                            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.6rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem' }}>
                                {course.title}
                            </h1>
                            <p style={{ color: 'var(--text-2)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem', maxWidth: 680 }}>{course.description}</p>

                            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.25rem', marginBottom: '3rem', color: 'var(--text-2)', fontSize: '0.92rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: 'var(--text)' }}>
                                    <FiStar size={16} style={{ color: '#f59e0b', fill: '#f59e0b' }} /> {course.rating || 'New'}
                                    <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.85rem' }}>({(course.enrollmentCount || 0).toLocaleString()} students)</span>
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><FiClock size={15} /> {course.duration}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><FiAward size={15} /> {instructorName(course)}</span>
                                <span className="pill" style={{ position: 'static', boxShadow: 'none', border: '1px solid var(--border)' }}>
                                    <span className="dot" style={{ background: levelColor }} /> {course.level}
                                </span>
                            </div>

                            <h2 style={{ fontWeight: 700, fontSize: '1.4rem', marginBottom: '1.1rem' }}>What you'll learn</h2>
                            <div className="panel" style={{ padding: '1.4rem 1.5rem', marginBottom: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem 1.5rem' }}>
                                {lessons.map((lesson, index) => (
                                    <div key={lesson.id || index} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', color: 'var(--text-2)', fontSize: '0.92rem' }}>
                                        <FiCheckCircle size={16} style={{ color: '#059669', marginTop: 3, flexShrink: 0 }} /> {lesson.title}
                                    </div>
                                ))}
                            </div>

                            <h2 style={{ fontWeight: 700, fontSize: '1.4rem', marginBottom: '1.1rem' }}>Course syllabus</h2>
                            <div className="panel">
                                {lessons.map((lesson, i) => (
                                    <div key={lesson.id || i} style={{
                                        display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.95rem 1.25rem',
                                        borderBottom: i < lessons.length - 1 ? '1px solid var(--border)' : 'none',
                                    }}>
                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <FiPlay size={12} style={{ color: 'var(--primary-dark)' }} />
                                        </div>
                                        <span style={{ color: 'var(--text)', fontSize: '0.92rem', fontWeight: 500 }}>Lesson {i + 1}: {lesson.title}</span>
                                        <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{lesson.videoUrl ? 'Video lesson' : 'Lesson'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Enroll card */}
                        <aside className="detail-aside">
                            <div className="panel" style={{ boxShadow: 'var(--shadow-lg)' }}>
                                <div className="course-thumb" style={{ borderRadius: 0 }}>
                                    <img src={course.thumbnail} alt="" onError={e => { e.currentTarget.style.display = 'none'; }} />
                                </div>
                                <div style={{ padding: '1.5rem' }}>
                                    <div style={{ fontSize: '2.1rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '1.1rem' }}>
                                        {course.price === 0 ? 'Free' : `₹${course.price.toLocaleString()}`}
                                    </div>
                                    {enrolled ? (
                                        <div style={{ padding: '0.85rem', background: 'var(--success-soft)', borderRadius: '0.75rem', color: '#047857', fontWeight: 600, marginBottom: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                            <FiCheckCircle /> Enrolled successfully
                                        </div>
                                    ) : (
                                        <button onClick={handleEnroll} disabled={paymentLoading || (Boolean(user) && user.role !== 'student')} className="btn-primary" style={{ width: '100%', padding: '0.85rem', marginBottom: '0.7rem' }}>
                                        {paymentLoading ? 'Preparing checkout…' : user?.role === 'student' ? <><FiBookOpen /> {Number(course.price) === 0 ? 'Enroll for free' : `Pay ₹${Number(course.price).toLocaleString()} and enroll`}</> : user ? <>Only students can enroll</> : <><FiPlay /> Log in to enroll</>}
                                        </button>
                                    )}
                                    {error && <p role="alert" style={{ color: '#b91c1c', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}
                                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                                        {[
                                            ['Duration', course.duration],
                                            ['Level', course.level],
                                            ['Students', (course.enrollmentCount || 0).toLocaleString()],
                                            ['Instructor', instructorName(course)],
                                            ['Certificate', 'Yes, on completion'],
                                        ].map(([k, v]) => (
                                            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.65rem', fontSize: '0.875rem' }}>
                                                <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                                                <span style={{ fontWeight: 600, textAlign: 'right' }}>{v}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
