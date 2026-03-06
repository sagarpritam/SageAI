import { useState, useEffect } from 'react';
import { createScan, listScans, explainFinding } from '../api';

const RISK_COLORS = {
    Critical: '#ef4444', High: '#f97316', Medium: '#f59e0b', Low: '#10b981'
};
const SOURCE_COLORS = {
    'Core Scanner': '#8b5cf6', 'Shodan InternetDB': '#ef4444',
    'crt.sh': '#f59e0b', 'Mozilla Observatory': '#10b981',
    'VirusTotal': '#3b82f6', 'NVD/NIST': '#ec4899',
};

const TERMINAL_LINES = [
    { type: 'prompt', text: 'sageai@scanner:~$' },
    { type: 'info', text: 'Initializing scan engine v2.0...' },
    { type: 'success', text: '✓ SSL/TLS scanner loaded' },
    { type: 'success', text: '✓ Port scanner ready' },
    { type: 'success', text: '✓ DNS resolver initialized' },
    { type: 'success', text: '✓ Shodan client online' },
    { type: 'success', text: '✓ VirusTotal integration active' },
    { type: 'info', text: 'Ready to scan. Enter target above.' },
];

export default function Scans() {
    const [target, setTarget] = useState('');
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState('');
    const [selected, setSelected] = useState(null);
    const [explanation, setExplanation] = useState(null);
    const [termLines, setTermLines] = useState([]);
    const [expandedSources, setExpandedSources] = useState({});

    const fetchScans = () => listScans().then(r => setScans(r.data)).catch(() => { }).finally(() => setLoading(false));
    useEffect(() => { fetchScans(); }, []);

    const handleScan = async (e) => {
        e.preventDefault();
        if (!target) return;
        setScanning(true);
        setError('');
        setTermLines([]);

        // Animate terminal lines
        TERMINAL_LINES.push({ type: 'warn', text: `→ Scanning: ${target}` });
        for (let i = 0; i < TERMINAL_LINES.length; i++) {
            await new Promise(r => setTimeout(r, 200));
            setTermLines(prev => [...prev, TERMINAL_LINES[i]]);
        }

        try {
            const res = await createScan(target);
            setSelected(res.data);
            setTermLines(prev => [...prev, { type: 'success', text: `✓ Scan complete. ${res.data.findings?.length || 0} findings detected.` }]);
            setTarget('');
            fetchScans();
        } catch (err) {
            const msg = err.response?.data?.detail || 'Scan failed';
            setError(msg);
            setTermLines(prev => [...prev, { type: 'error', text: `✗ Error: ${msg}` }]);
        } finally { setScanning(false); }
    };

    const handleExplain = async (type) => {
        try {
            const res = await explainFinding(type);
            setExplanation(res.data);
        } catch { setExplanation(null); }
    };

    const toggleSource = (src) => setExpandedSources(prev => ({ ...prev, [src]: !prev[src] }));

    return (
        <div className="animate-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Security Scans</h1>
                    <p className="page-subtitle">Scan targets and analyze vulnerabilities with AI</p>
                </div>
                <span className="badge badge-violet">◎ {scans.length} scans</span>
            </div>

            <div className="page-body">
                {/* Terminal + Scan Form */}
                <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(124,58,237,0.05), rgba(6,182,212,0.03))' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'Fira Code, monospace' }}>
                            sageai-scanner — bash
                        </span>
                    </div>

                    {/* Terminal preview / output */}
                    {(termLines.length > 0 || scanning) && (
                        <div className="terminal" style={{ marginBottom: '0.75rem' }}>
                            {termLines.map((line, i) => (
                                <span key={i} className={`terminal-line terminal-${line.type}`}>
                                    {line.type === 'prompt' ? (
                                        <><span className="terminal-prompt">{line.text}</span> </>
                                    ) : line.text}
                                </span>
                            ))}
                            {scanning && <span className="terminal-cursor" />}
                        </div>
                    )}

                    <form onSubmit={handleScan} style={{ display: 'flex', gap: '0.75rem' }}>
                        <input
                            className="input"
                            placeholder="https://example.com"
                            value={target}
                            onChange={e => setTarget(e.target.value)}
                            style={{ flex: 1, fontFamily: 'Fira Code, monospace', fontSize: '0.875rem' }}
                        />
                        <button className="btn-primary" disabled={scanning || !target}>
                            {scanning ? <><span className="spinner spinner-sm" /> Scanning...</> : '◎ Start Scan'}
                        </button>
                    </form>
                    {error && <div className="alert alert-error" style={{ marginTop: '0.75rem' }}>⚠️ {error}</div>}
                </div>

                {/* Main grid */}
                <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1.1fr' : '1fr', gap: '1.25rem' }}>
                    {/* Scan History */}
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                Scan History
                            </span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{scans.length} total</span>
                        </div>
                        {loading ? (
                            <div style={{ padding: '3rem', textAlign: 'center' }}>
                                <div className="spinner" style={{ margin: '0 auto' }} />
                            </div>
                        ) : scans.length === 0 ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>◎</div>
                                <p>No scans yet. Enter a target above!</p>
                            </div>
                        ) : (
                            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                                <table>
                                    <thead><tr><th>Target</th><th>Risk</th><th>Score</th><th>Date</th></tr></thead>
                                    <tbody>
                                        {scans.map(s => (
                                            <tr key={s.id}
                                                onClick={() => { setSelected(null); setTimeout(() => setSelected(s), 0); setExplanation(null); }}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <td>
                                                    <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--brand-cyan-light)' }}>
                                                        {s.target.replace(/https?:\/\//, '').slice(0, 30)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge badge-${s.risk_level?.toLowerCase()}`}>
                                                        <span className={`risk-dot risk-dot-${s.risk_level?.toLowerCase()}`} />
                                                        {s.risk_level}
                                                    </span>
                                                </td>
                                                <td style={{ fontWeight: 700, color: RISK_COLORS[s.risk_level] || 'white' }}>
                                                    {s.risk_score}
                                                </td>
                                                <td style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                                    {s.created_at ? new Date(s.created_at).toLocaleDateString() : '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Scan Detail Panel */}
                    {selected && (
                        <div className="animate-slide" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>Scan Result</div>
                                        <div className="mono" style={{ fontSize: '0.85rem', color: 'var(--brand-cyan-light)', wordBreak: 'break-all' }}>{selected.target}</div>
                                    </div>
                                    <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.1rem' }}>×</button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    {[
                                        { label: 'Risk Score', value: selected.risk_summary?.risk_score ?? selected.risk_score, color: RISK_COLORS[selected.risk_level] || 'white' },
                                        { label: 'Risk Level', value: selected.risk_summary?.risk_level || selected.risk_level, isRisk: true },
                                    ].map(({ label, value, color, isRisk }) => (
                                        <div className="stat-card" key={label} style={{ padding: '0.875rem' }}>
                                            <span className="stat-label">{label}</span>
                                            {isRisk ? (
                                                <span className={`badge badge-${value?.toLowerCase()}`} style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                                    <span className={`risk-dot risk-dot-${value?.toLowerCase()}`} /> {value}
                                                </span>
                                            ) : (
                                                <span className="stat-value" style={{ color, fontSize: '1.75rem' }}>{value}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Findings */}
                            <div className="card">
                                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.875rem' }}>
                                    Findings ({(selected.findings || []).length})
                                </div>
                                {(selected.findings || []).length === 0 ? (
                                    <div className="alert alert-success">✅ No vulnerabilities detected for this target.</div>
                                ) : (() => {
                                    const groups = {};
                                    selected.findings.forEach(f => {
                                        const src = f.source || 'Core Scanner';
                                        if (!groups[src]) groups[src] = [];
                                        groups[src].push(f);
                                    });
                                    return Object.entries(groups).map(([src, items]) => (
                                        <div key={src} style={{ marginBottom: '0.875rem' }}>
                                            <button
                                                onClick={() => toggleSource(src)}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                                    background: (SOURCE_COLORS[src] || '#6b7280') + '18',
                                                    border: `1px solid ${SOURCE_COLORS[src] || '#6b7280'}30`,
                                                    color: SOURCE_COLORS[src] || '#6b7280',
                                                    padding: '0.3rem 0.75rem', borderRadius: '999px',
                                                    fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', width: '100%',
                                                    justifyContent: 'space-between', marginBottom: '0.4rem',
                                                }}
                                            >
                                                <span>{src} · {items.length} findings</span>
                                                <span>{expandedSources[src] === false ? '▶' : '▼'}</span>
                                            </button>
                                            {expandedSources[src] !== false && items.map((f, i) => (
                                                <div key={i} className="card" style={{ padding: '0.6rem 0.875rem', cursor: 'pointer', marginBottom: '0.3rem' }}
                                                    onClick={() => handleExplain(f.type)}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-primary)' }}>{f.type}</span>
                                                        <span className={`badge badge-${(f.severity || 'info').toLowerCase()}`}>{f.severity}</span>
                                                    </div>
                                                    {(f.detail || f.description) && (
                                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                                            {(f.detail || f.description || '').slice(0, 100)}
                                                        </div>
                                                    )}
                                                    <div style={{ fontSize: '0.65rem', color: 'var(--brand-violet-light)', marginTop: '0.25rem' }}>Click for AI explanation →</div>
                                                </div>
                                            ))}
                                        </div>
                                    ));
                                })()}
                            </div>

                            {/* AI Explanation */}
                            {explanation && (
                                <div className="card animate-in" style={{ borderColor: 'rgba(124,58,237,0.4)', background: 'rgba(124,58,237,0.05)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>✦</div>
                                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>AI Analysis: {explanation.finding_type}</span>
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>{explanation.detail}</p>
                                    <p style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                                        <strong style={{ color: 'var(--text-primary)' }}>Impact: </strong>
                                        <span style={{ color: 'var(--text-secondary)' }}>{explanation.impact}</span>
                                    </p>
                                    {explanation.owasp && (
                                        <div className="badge badge-info" style={{ marginBottom: '0.75rem', fontSize: '0.72rem' }}>
                                            OWASP: {explanation.owasp.owasp_id} · CWE-{explanation.owasp.cwe}
                                        </div>
                                    )}
                                    {explanation.remediation?.steps && (
                                        <div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>Remediation Steps:</div>
                                            {explanation.remediation.steps.map((s, i) => (
                                                <div key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                                    <span style={{ color: 'var(--brand-green)', flexShrink: 0 }}>{i + 1}.</span>
                                                    <span>{s}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
