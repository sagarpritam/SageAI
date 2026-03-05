import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword, resetPassword } from '../api';

export default function ForgotPassword() {
    const [step, setStep] = useState('email'); // email | token | done
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await forgotPassword(email);
            setStatus('✅ If an account exists with that email, a reset link has been sent.');
            setStep('token');
        } catch (err) {
            setStatus(err.response?.data?.detail || 'Something went wrong');
        } finally { setLoading(false); }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        if (password !== confirm) {
            setStatus('Passwords do not match');
            return;
        }
        if (password.length < 8) {
            setStatus('Password must be at least 8 characters');
            return;
        }
        setLoading(true);
        try {
            await resetPassword(token, password);
            setStatus('✅ Password reset successful!');
            setStep('done');
        } catch (err) {
            setStatus(err.response?.data?.detail || 'Invalid or expired token');
        } finally { setLoading(false); }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
            <div className="card animate-in" style={{ width: '100%', maxWidth: '420px', padding: '2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <span style={{ fontSize: '2rem' }}>🔑</span>
                    <h1 className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.5rem' }}>
                        {step === 'done' ? 'All Set!' : 'Reset Password'}
                    </h1>
                </div>

                {step === 'email' && (
                    <form onSubmit={handleSendReset}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Enter your email and we'll send a reset link.
                        </p>
                        <input className="input" type="email" placeholder="you@company.com" value={email}
                            onChange={e => setEmail(e.target.value)} required style={{ marginBottom: '1rem' }} />
                        <button className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>
                )}

                {step === 'token' && (
                    <form onSubmit={handleReset}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Paste the token from your email, then set a new password.
                        </p>
                        <input className="input" placeholder="Reset token" value={token}
                            onChange={e => setToken(e.target.value)} required style={{ marginBottom: '0.75rem' }} />
                        <input className="input" type="password" placeholder="New password (8+ chars)" value={password}
                            onChange={e => setPassword(e.target.value)} required style={{ marginBottom: '0.75rem' }} />
                        <input className="input" type="password" placeholder="Confirm password" value={confirm}
                            onChange={e => setConfirm(e.target.value)} required style={{ marginBottom: '1rem' }} />
                        <button className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                {step === 'done' && (
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '0.9rem', color: 'var(--brand-green)', marginBottom: '1.5rem' }}>
                            Your password has been reset. You can now log in.
                        </p>
                        <Link to="/login" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
                            Go to Login →
                        </Link>
                    </div>
                )}

                {status && <p style={{ fontSize: '0.8rem', marginTop: '1rem', color: status.includes('✅') ? 'var(--brand-green)' : 'var(--text-secondary)' }}>{status}</p>}

                {step !== 'done' && (
                    <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Remember now? <Link to="/login" style={{ color: 'var(--brand-blue-light)' }}>Back to login</Link>
                    </p>
                )}
            </div>
        </div>
    );
}
