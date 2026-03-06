import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [orgName, setOrgName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register({ email, password, org_name: orgName || email.split('@')[1] || 'My Org' });
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed');
        } finally { setLoading(false); }
    };

    return (
        <div className="auth-container">
            <div className="auth-grid" />
            <div className="auth-orb auth-orb-1" />
            <div className="auth-orb auth-orb-2" />

            <div className="auth-card animate-in">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: 56, height: 56, margin: '0 auto 1rem',
                        background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                        borderRadius: '14px', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '1.5rem',
                        boxShadow: '0 8px 24px rgba(124,58,237,0.35)',
                    }}>🛡️</div>
                    <h1 className="gradient-text" style={{ fontSize: '1.625rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
                        Create Account
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Join the SageAI 2.0 platform</p>
                </div>

                {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>⚠️ {error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label>Organization name</label>
                        <input className="input" type="text" placeholder="Acme Corp" value={orgName} onChange={e => setOrgName(e.target.value)} />
                    </div>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label>Email address</label>
                        <input className="input" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                        <label>Password</label>
                        <input className="input" type="password" placeholder="Min 8 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
                    </div>
                    <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }} disabled={loading}>
                        {loading ? <><span className="spinner spinner-sm" /> Creating account...</> : 'Create Free Account →'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Already have an account? <Link to="/login" className="link">Sign in →</Link>
                </p>
            </div>
        </div>
    );
}
