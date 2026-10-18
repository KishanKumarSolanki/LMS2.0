import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import { FaGraduationCap } from 'react-icons/fa';

export default function Login() {
    const [searchParams] = useSearchParams();
    const [isRegister, setIsRegister] = useState(searchParams.get('tab') === 'register');
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const { login, register, googleLogin, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) navigate(`/${user.role}/dashboard`, { replace: true });
    }, [navigate, user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        if (isRegister) {
            const result = await register({ ...form, role: 'student' });
            if (result.success) navigate(`/${result.role}/dashboard`);
            else setError(result.error);
        } else {
            const result = await login(form.email, form.password);
            if (result.success) navigate(`/${result.role}/dashboard`);
            else setError(result.error);
        }
        setLoading(false);
    };

    const switchTab = (reg) => { setIsRegister(reg); setError(''); setForm({ name: '', email: '', password: '' }); };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Animated blobs */}
            <div style={{
                position: 'absolute', top: '-20%', left: '-10%', width: 600, height: 600,
                borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
                animation: 'float 8s ease-in-out infinite',
            }} />
            <div style={{
                position: 'absolute', bottom: '-15%', right: '-5%', width: 500, height: 500,
                borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)',
                animation: 'float 10s ease-in-out infinite reverse',
            }} />

            {/* Left Panel */}
            <div style={{
                flex: '0 0 45%', display: 'none', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                padding: '3rem', position: 'relative',
                '@media (min-width: 900px)': { display: 'flex' },
            }} className="auth-left-panel">
                <div style={{ textAlign: 'center', maxWidth: 400, position: 'relative', zIndex: 1 }}>
                    <div style={{
                        width: 80, height: 80, borderRadius: 20,
                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 2rem', boxShadow: '0 20px 40px rgba(99,102,241,0.3)',
                    }}>
                        <FaGraduationCap size={38} color="white" />
                    </div>
                    <h1 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.2 }}>
                        Learn Without<br />
                        <span style={{ background: 'linear-gradient(90deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Limits
                        </span>
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
                        Join 50,000+ learners mastering new skills every day with top industry experts.
                    </p>
                    {[
                        { icon: '🎯', text: '200+ expert-led courses' },
                        { icon: '📈', text: 'Track your progress live' },
                        { icon: '🏆', text: 'Earn shareable certificates' },
                    ].map(item => (
                        <div key={item.text} style={{
                            display: 'flex', alignItems: 'center', gap: '0.9rem',
                            marginBottom: '1rem', padding: '0.9rem 1.2rem',
                            background: 'rgba(255,255,255,0.06)', borderRadius: 12,
                            border: '1px solid rgba(255,255,255,0.08)',
                        }}>
                            <span style={{ fontSize: '1.4rem' }}>{item.icon}</span>
                            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem' }}>{item.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Panel — Form */}
            <div style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '2rem 1.5rem',
            }}>
                <div style={{
                    width: '100%', maxWidth: 460,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 24,
                    padding: '2.5rem 2.5rem',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
                }}>
                    {/* Back */}
                    <Link to="/" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                        color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem',
                        textDecoration: 'none', marginBottom: '1.75rem',
                        transition: 'color 0.2s',
                    }}
                        onMouseOver={e => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
                        onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                    >
                        <FiArrowLeft size={14} /> Back to home
                    </Link>

                    {/* Logo (mobile) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.75rem' }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <FaGraduationCap size={18} color="white" />
                        </div>
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>LMS Pro</span>
                    </div>

                    {/* Tab switcher */}
                    <div style={{
                        display: 'flex', background: 'rgba(255,255,255,0.06)',
                        borderRadius: 12, padding: 4, marginBottom: '2rem',
                        border: '1px solid rgba(255,255,255,0.08)',
                    }}>
                        {[['Sign In', false], ['Register', true]].map(([label, isReg]) => (
                            <button key={label} onClick={() => switchTab(isReg)} style={{
                                flex: 1, padding: '0.65rem', border: 'none', cursor: 'pointer',
                                borderRadius: 9, fontSize: '0.9rem', fontWeight: 600,
                                transition: 'all 0.2s',
                                background: isRegister === isReg
                                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                    : 'transparent',
                                color: isRegister === isReg ? '#fff' : 'rgba(255,255,255,0.5)',
                                boxShadow: isRegister === isReg ? '0 4px 12px rgba(99,102,241,0.3)' : 'none',
                            }}>
                                {label}
                            </button>
                        ))}
                    </div>

                    <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                        {isRegister ? 'Create your account' : 'Welcome back!'}
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
                        {isRegister ? 'Join thousands of learners today.' : 'Sign in to continue your journey.'}
                    </p>

                    {/* Error */}
                    {error && (
                        <div style={{
                            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                            borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1.25rem',
                            color: '#fca5a5', fontSize: '0.855rem',
                        }}>{error}</div>
                    )}

                    {/* Google Sign-In */}
                    <div style={{ marginBottom: '1.25rem' }}>
                        {googleLoading ? (
                            <div style={{
                                width: '100%', padding: '0.8rem', borderRadius: 10,
                                background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)',
                                textAlign: 'center', fontSize: '0.875rem',
                            }}>Signing in with Google...</div>
                        ) : (
                            <div style={{ borderRadius: 10, overflow: 'hidden' }}>
                                <GoogleLogin
                                    onSuccess={async (credentialResponse) => {
                                        setError('');
                                        setGoogleLoading(true);
                                        const result = await googleLogin(credentialResponse.credential);
                                        if (result.success) navigate(`/${result.role}/dashboard`);
                                        else setError(result.error || 'Google login failed. Try again.');
                                        setGoogleLoading(false);
                                    }}
                                    onError={() => setError('Google Sign-In was cancelled or failed.')}
                                    width="412"
                                    theme="filled_black"
                                    shape="rectangular"
                                    text={isRegister ? 'signup_with' : 'signin_with'}
                                    logo_alignment="center"
                                />
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem' }}>or with email</span>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        {isRegister && (
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.45rem' }}>
                                    Full Name
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <FiUser size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                    <input
                                        type="text" placeholder="Your full name" required={isRegister}
                                        value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                        style={inputStyle}
                                    />
                                </div>
                            </div>
                        )}

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.45rem' }}>
                                Email Address
                            </label>
                            <div style={{ position: 'relative' }}>
                                <FiMail size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                <input
                                    type="email" placeholder="you@example.com" required
                                    value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.45rem' }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <FiLock size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••" required
                                    value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                    style={{ ...inputStyle, paddingRight: '3rem' }}
                                />
                                <button type="button" onClick={() => setShowPassword(p => !p)} style={{
                                    position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer',
                                }}>
                                    {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} style={{
                            width: '100%', padding: '0.9rem', border: 'none', borderRadius: 12,
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                            transition: 'all 0.2s',
                            boxShadow: '0 8px 20px rgba(99,102,241,0.35)',
                        }}>
                            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
                        </button>
                    </form>

                </div>
            </div>

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) scale(1); }
                    50% { transform: translateY(-30px) scale(1.05); }
                }
                .auth-left-panel { display: none; }
                @media (min-width: 900px) { .auth-left-panel { display: flex !important; } }
                input:-webkit-autofill {
                    -webkit-box-shadow: 0 0 0 1000px rgba(30,27,75,0.9) inset !important;
                    -webkit-text-fill-color: rgba(255,255,255,0.9) !important;
                }
            `}</style>
        </div>
    );
}

const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    padding: '0.8rem 1rem 0.8rem 2.75rem',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem',
    outline: 'none', transition: 'border-color 0.2s, background 0.2s',
};
