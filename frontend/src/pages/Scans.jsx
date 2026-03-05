import { useState, useEffect } from 'react';
import { createScan, listScans, explainFinding } from '../api';

export default function Scans() {
    const [target, setTarget] = useState('');
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState('');
    const [selected, setSelected] = useState(null);
    const [explanation, setExplanation] = useState(null);

    const fetchScans = () => {
        listScans().then(r => setScans(r.data)).catch(() => { }).finally(() => setLoading(false));
    };

    useEffect(() => { fetchScans(); }, []);

    const handleScan = async (e) => {
        e.preventDefault();
        if (!target) return;
        setScanning(true);
        setError('');
        try {
            const res = await createScan(target);
            setSelected(res.data);
            setTarget('');
            fetchScans();
        } catch (err) {
            setError(err.response?.data?.detail || 'Scan failed');
        } finally {
            setScanning(false);
        }
    };

    const handleExplain = async (type) => {
        try {
            const res = await explainFinding(type);
            setExplanation(res.data);
        } catch { setExplanation(null); }
    };

    return (
        <div className="animate-in">
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Security Scans</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Run scans and view results</p>

            {/* New Scan Form */}
            <div className="card glow" style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>🚀 New Scan</h3>
                <form onSubmit={handleScan} style={{ display: 'flex', gap: '0.75rem' }}>
                    <input
                        className="input"
                        placeholder="https://example.com"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        style={{ flex: 1 }}
                    />
                    <button className="btn-primary" disabled={scanning || !target}>
                        {scanning ? <span className="spinner" style={{ display: 'inline-block' }} /> : '🔍 Scan'}
                    </button>
                </form>
                {error && <p style={{ color: 'var(--brand-red)', fontSize: '0.8rem', marginTop: '0.5rem' }}>{error}</p>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
                {/* Scan History */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Scan History</h3>
                    </div>
                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
                    ) : scans.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', padding: '2rem', textAlign: 'center' }}>No scans yet. Run your first scan above!</p>
                    ) : (
                        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                            <table>
                                <thead><tr><th>Target</th><th>Risk</th><th>Score</th></tr></thead>
                                <tbody>
                                    {scans.map(s => (
                                        <tr key={s.id} onClick={() => { setSelected(null); setTimeout(() => setSelected(s), 0); setExplanation(null); }} style={{ cursor: 'pointer' }}>
                                            <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{s.target}</td>
                                            <td><span className={`badge badge-${s.risk_level.toLowerCase()}`}>{s.risk_level}</span></td>
                                            <td style={{ fontWeight: 600 }}>{s.risk_score}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Scan Detail */}
                {selected && (
                    <div className="card animate-in">
                        <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Scan Result</h3>
                        <p style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--brand-blue-light)', marginBottom: '1rem' }}>{selected.target}</p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                            <div className="stat-card">
                                <span className="stat-label">Risk Score</span>
                                <span className="stat-value" style={{ color: selected.risk_score >= 40 ? 'var(--brand-red)' : 'var(--brand-green)' }}>
                                    {selected.risk_summary?.risk_score ?? selected.risk_score}
                                </span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">Risk Level</span>
                                <span className={`badge badge-${(selected.risk_summary?.risk_level || selected.risk_level || 'low').toLowerCase()}`}>
                                    {selected.risk_summary?.risk_level || selected.risk_level}
                                </span>
                            </div>
                        </div>

                        {/* Findings */}
                        <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                            Findings ({(selected.findings || []).length})
                        </h4>
                        {(selected.findings || []).length === 0 ? (
                            <p style={{ color: 'var(--brand-green)', fontSize: '0.85rem' }}>✅ No vulnerabilities detected!</p>
                        ) : (() => {
                            // Group findings by source
                            const groups = {};
                            (selected.findings || []).forEach(f => {
                                const src = f.source || 'Core Scanner';
                                if (!groups[src]) groups[src] = [];
                                groups[src].push(f);
                            });
                            const sourceColors = {
                                'Core Scanner': '#6366f1',
                                'Shodan InternetDB': '#ef4444',
                                'crt.sh': '#f59e0b',
                                'Mozilla Observatory': '#22c55e',
                                'VirusTotal': '#3b82f6',
                                'NVD/NIST': '#ec4899',
                            };
                            return (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {Object.entries(groups).map(([src, items]) => (
                                        <div key={src}>
                                            <div style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                                padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600,
                                                background: (sourceColors[src] || '#6b7280') + '22',
                                                color: sourceColors[src] || '#6b7280', marginBottom: '0.5rem',
                                            }}>
                                                {src} ({items.length})
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                                {items.map((f, i) => (
                                                    <div key={i} className="card" style={{ padding: '0.6rem 0.85rem', cursor: 'pointer' }}
                                                        onClick={() => handleExplain(f.type)}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{f.type}</span>
                                                            <span className={`badge badge-${(f.severity || 'info').toLowerCase()}`}>{f.severity}</span>
                                                        </div>
                                                        {(f.detail || f.description) && (
                                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                                                                {(f.detail || f.description || '').slice(0, 100)}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}

                        {/* AI Explanation */}
                        {explanation && (
                            <div className="card animate-in" style={{ marginTop: '1rem', background: 'var(--bg-primary)', borderColor: 'var(--brand-blue)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                    <span>🤖</span>
                                    <h4 style={{ fontSize: '0.85rem' }}>AI Analysis: {explanation.finding_type}</h4>
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>{explanation.detail}</p>
                                <p style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}><strong>Impact:</strong> <span style={{ color: 'var(--text-secondary)' }}>{explanation.impact}</span></p>
                                {explanation.owasp && (
                                    <p style={{ fontSize: '0.75rem', color: 'var(--brand-cyan)' }}>
                                        OWASP: {explanation.owasp.owasp_id} — {explanation.owasp.owasp_category} | CWE: {explanation.owasp.cwe}
                                    </p>
                                )}
                                {explanation.remediation?.steps && (
                                    <div style={{ marginTop: '0.75rem' }}>
                                        <h5 style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>Remediation:</h5>
                                        <ul style={{ paddingLeft: '1.25rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            {explanation.remediation.steps.map((s, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{s}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
