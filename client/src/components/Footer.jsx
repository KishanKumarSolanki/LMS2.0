import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiTwitter, FiFacebook, FiInstagram, FiLinkedin, FiYoutube } from 'react-icons/fi';
import { Brand } from './Navbar';
import { contactApi } from '../lib/api';

const quickLinks = [['Home', '/'], ['Courses', '/courses'], ['Short Courses', '/short-courses'], ['About Us', '/about'], ['Contact', '/contact']];
const categories = ['Web Development', 'Data Science', 'UI/UX Design', 'Backend Dev', 'DevOps', 'Machine Learning'];
const contact = [
    [FiMapPin, '123 Education Street, Mumbai, India'],
    [FiPhone, '+91 98765 43210'],
    [FiMail, 'hello@learnpro.com'],
];
const socials = [
    [FiTwitter, 'Twitter'], [FiFacebook, 'Facebook'], [FiInstagram, 'Instagram'],
    [FiLinkedin, 'LinkedIn'], [FiYoutube, 'YouTube'],
];

export default function Footer() {
    const [email, setEmail] = useState('');
    const [newsletterMessage, setNewsletterMessage] = useState('');
    const [newsletterError, setNewsletterError] = useState('');

    const subscribe = async (event) => {
        event.preventDefault();
        setNewsletterMessage('');
        setNewsletterError('');
        try {
            const result = await contactApi.subscribe(email);
            setNewsletterMessage(result.message);
            setEmail('');
        } catch (requestError) {
            setNewsletterError(requestError.message);
        }
    };

    return (
        <footer className="site-footer">
            <div className="container-page">
                <div className="footer-grid">
                    <div>
                        <div style={{ marginBottom: '1rem' }}><Brand /></div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.25rem', maxWidth: 300 }}>
                            Empowering learners worldwide with world-class courses and expert instructors.
                        </p>
                        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                            {socials.map(([Icon, label]) => (
                                <a key={label} href="#" aria-label={label} className="social-btn"><Icon size={16} /></a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="footer-title">Quick links</h4>
                        {quickLinks.map(([label, path]) => (
                            <Link key={path} to={path} className="footer-link">{label}</Link>
                        ))}
                    </div>

                    <div>
                        <h4 className="footer-title">Categories</h4>
                        {categories.map(cat => (
                            <Link key={cat} to="/courses" className="footer-link">{cat}</Link>
                        ))}
                    </div>

                    <div>
                        <h4 className="footer-title">Contact us</h4>
                        {contact.map(([Icon, text]) => (
                            <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginBottom: '0.8rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                <Icon size={16} style={{ marginTop: 3, color: 'var(--primary-dark)', flexShrink: 0 }} />{text}
                            </div>
                        ))}
                        <p style={{ color: 'var(--text)', fontSize: '0.875rem', fontWeight: 600, margin: '1.25rem 0 0.6rem' }}>Get course updates</p>
                        <form onSubmit={subscribe} style={{ display: 'flex', gap: '0.5rem' }}>
                            <input aria-label="Email address" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Your email" className="form-input" style={{ flex: 1, fontSize: '0.875rem', padding: '0.6rem 0.875rem', minWidth: 0 }} />
                            <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>Subscribe</button>
                        </form>
                        {(newsletterMessage || newsletterError) && <p role={newsletterError ? 'alert' : 'status'} style={{ color: newsletterError ? '#b91c1c' : '#047857', fontSize: '0.8rem', marginTop: '0.5rem' }}>{newsletterError || newsletterMessage}</p>}
                    </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', padding: '1.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>© {new Date().getFullYear()} LearnPro. All rights reserved.</p>
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                        {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(t => (
                            <a key={t} href="#" className="footer-link" style={{ marginBottom: 0, fontSize: '0.85rem' }}>{t}</a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
