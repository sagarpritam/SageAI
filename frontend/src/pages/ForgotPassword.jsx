import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try { await forgotPassword(email); setSent(true); }
        catch (err) { setError(err.response?.data?.detail || 'Failed to send reset email'); }
        finally { setLoading(false); }
    };

    return (
        <div className="auth-container">
            <div className="auth-grid" />
            <div className="auth-orb auth-orb-1" />
            <div className="auth-orb auth-orb-2" />
            <div className="auth-card animate-in">
                <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                    <div style={{ width: 50, height: 50, margin: '0 auto 1rem', background: 'linear-gradient(135deg, #7c3aed,#4f46e5)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', boxShadow: '0 8px 24px rgba(124,58,237,0.35)' }}>🔑</div>
                    <h1 className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Reset Password</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>We'll send you a reset link</p>
                </div>

                {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>⚠️ {error}</div>}
                {sent ? (
                    <div className="alert alert-success">
                        ✅ Check your email for the reset link. It may take a few minutes.
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>Email address</label>
                            <input className="input" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }} disabled={loading}>
                            {loading ? <><span className="spinner spinner-sm" /> Sending...</> : 'Send Reset Link →'}
                        </button>
                    </form>
                )}
                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <Link to="/login" className="link">← Back to Sign In</Link>
                </p>
            </div>
        </div>
    );
}
