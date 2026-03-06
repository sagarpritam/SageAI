import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api';

const FEATURES = [
    { icon: '◉', label: 'Attack Surface Management' },
    { icon: '✦', label: 'AI Security Copilot' },
    { icon: '⚡', label: 'Automated Auto-Fix' },
    { icon: '⊟', label: 'Bug Bounty Reports' },
];

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await login({ email, password });
            localStorage.setItem('sageai_token', res.data.access_token);
            localStorage.setItem('sageai_email', email);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed. Check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            {/* Animated background */}
            <div className="auth-grid" />
            <div className="auth-orb auth-orb-1" />
            <div className="auth-orb auth-orb-2" />

            {/* Split layout */}
            <div style={{
                display: 'flex', width: '100%', maxWidth: '900px',
                gap: '3rem', alignItems: 'center', padding: '2rem',
                position: 'relative', zIndex: 1,
            }}>
                {/* Left: Branding */}
                <div style={{ flex: 1, display: 'none' }} className="auth-branding">
                    {/* shown on wider screens via media query */}
                </div>

                {/* Right: Form Card */}
                <div className="auth-card animate-in" style={{ width: '100%', maxWidth: 420 }}>
                    {/* Logo */}
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{
                            width: 60, height: 60, margin: '0 auto 1rem',
                            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                            borderRadius: '16px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.75rem',
                            boxShadow: '0 8px 32px rgba(124, 58, 237, 0.4)',
                        }}>
                            🛡️
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <h1 className="gradient-text" style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
                                SageAI
                            </h1>
                            <span style={{
                                fontSize: '0.65rem', fontWeight: 700, background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                                padding: '2px 8px', borderRadius: '999px', color: 'white', letterSpacing: '0.05em',
                            }}>2.0</span>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            Attack Surface Management Platform
                        </p>
                    </div>

                    {error && (
                        <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label>Email address</label>
                            <input
                                id="email"
                                className="input"
                                type="email"
                                placeholder="you@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                            <label>Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    id="password"
                                    className="input"
                                    type={showPass ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    style={{ paddingRight: '2.5rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    style={{
                                        position: 'absolute', right: '0.75rem', top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: 'var(--text-muted)', fontSize: '1rem',
                                    }}
                                >
                                    {showPass ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <div style={{ textAlign: 'right', marginBottom: '1.25rem' }}>
                            <Link to="/forgot-password" className="link" style={{ fontSize: '0.8rem' }}>
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            id="login-btn"
                            className="btn-primary"
                            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
                            disabled={loading}
                        >
                            {loading ? (
                                <><span className="spinner spinner-sm" /> Signing in...</>
                            ) : 'Sign In →'}
                        </button>
                    </form>

                    <div style={{
                        margin: '1.5rem 0',
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                    }}>
                        <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>or</span>
                        <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
                    </div>

                    <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        No account?{' '}
                        <Link to="/register" className="link">Create one free →</Link>
                    </p>

                    {/* Feature pills */}
                    <div style={{ marginTop: '1.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center' }}>
                        {FEATURES.map(f => (
                            <span key={f.label} style={{
                                fontSize: '0.68rem', padding: '4px 10px', borderRadius: '999px',
                                background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)',
                                color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px',
                            }}>
                                <span>{f.icon}</span> {f.label}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
