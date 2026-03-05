import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api';

export default function RegisterPage() {
    const [form, setForm] = useState({ email: '', password: '', organization_name: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await register(form);
            localStorage.setItem('sageai_token', res.data.access_token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card animate-in">
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🛡️</div>
                    <h1 className="gradient-text">Create Account</h1>
                    <p>Start securing your applications today</p>
                </div>

                {error && <div className="error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Organization Name</label>
                        <input className="input" placeholder="Your Company" value={form.organization_name} onChange={update('organization_name')} required />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input className="input" type="email" placeholder="you@company.com" value={form.email} onChange={update('email')} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input className="input" type="password" placeholder="Min 8 characters" value={form.password} onChange={update('password')} required minLength={8} />
                    </div>
                    <button className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
                        {loading ? <span className="spinner" style={{ display: 'inline-block' }} /> : 'Create Account'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Already have an account? <Link to="/login" className="link">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
