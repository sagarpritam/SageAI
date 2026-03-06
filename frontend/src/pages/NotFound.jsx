import { useNavigate } from 'react-router-dom';

export default function NotFound() {
    const navigate = useNavigate();
    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-void)', fontFamily: 'Inter, sans-serif',
        }}>
            <div style={{ textAlign: 'center', maxWidth: 520 }}>
                {/* Glowing 404 */}
                <div style={{
                    fontSize: '8rem', fontWeight: 900, lineHeight: 1,
                    background: 'linear-gradient(135deg, var(--brand-violet), var(--brand-cyan))',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 0 30px rgba(124,58,237,0.5))',
                    marginBottom: '1rem',
                }}>
                    404
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                    Page Not Found
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
                    This route doesn't exist in the SageAI 2.0 platform. Maybe it moved, or you followed a broken link.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                    <button className="btn-primary" onClick={() => navigate('/')}>← Back to Dashboard</button>
                    <button className="btn-secondary" onClick={() => navigate(-1)}>Go Back</button>
                </div>
                <div style={{ marginTop: '3rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    SageAI 2.0 · AI Cybersecurity Platform
                </div>
            </div>
        </div>
    );
}
