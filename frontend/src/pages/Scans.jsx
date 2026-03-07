import { useState, useEffect } from 'react';
import { createScan, listScans, explainFinding } from '../api';

const RISK_COLORS = { Critical: '#ef4444', High: '#f97316', Medium: '#f59e0b', Low: '#10b981', Info: '#3b82f6' };
const SOURCE_COLORS = {
    'Core Scanner': '#8b5cf6', 'Shodan InternetDB': '#ef4444',
    'crt.sh': '#f59e0b', 'Mozilla Observatory': '#10b981',
    'VirusTotal': '#3b82f6', 'NVD/NIST': '#ec4899',
};

const TERMINAL_LINES = [
    { type: 'prompt', text: 'sageai@scanner:~$' },
    { type: 'info', text: 'Initializing Engine v2.0...' },
    { type: 'success', text: '✓ SSL/TLS analyzer online' },
    { type: 'success', text: '✓ Port scanner loaded' },
    { type: 'success', text: '✓ OSINT framework active (Shodan, VT)' },
    { type: 'info', text: 'Engine ready. Awaiting target.' },
];

export default function Scans() {
    const [target, setTarget] = useState('');
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState('');
    const [selected, setSelected] = useState(null);
    const [explanation, setExplanation] = useState(null);
    const [explaining, setExplaining] = useState(null);
    const [termLines, setTermLines] = useState(TERMINAL_LINES);
    const [expandedSources, setExpandedSources] = useState({});

    const fetchScans = () => listScans().then(r => setScans(r.data)).catch(() => { }).finally(() => setLoading(false));
    useEffect(() => { fetchScans(); }, []);

    const handleScan = async (e) => {
        e.preventDefault();
        if (!target) return;
        setScanning(true); setError(''); setSelected(null); setExplanation(null);
        setTermLines(TERMINAL_LINES);

        // Animate terminal start
        const runLines = [
            { type: 'warn', text: `→ Target acquired: ${target}` },
            { type: 'info', text: `Initiating multi-vector scan...` }
        ];
        setTermLines(prev => [...prev, ...runLines]);

        try {
            const res = await createScan(target);
            setTermLines(prev => [...prev, { type: 'success', text: `✓ Complete. Found ${res.data.findings?.length || 0} vulnerabilities.` }]);
            setSelected(res.data);
            setTarget('');
            fetchScans();
        } catch (err) {
            const msg = err.response?.data?.detail || 'Scan failed';
            setError(msg);
            setTermLines(prev => [...prev, { type: 'error', text: `✗ Error: ${msg}` }]);
        } finally { setScanning(false); }
    };

    const handleExplain = async (type) => {
        setExplaining(type); setExplanation(null);
        try {
            const res = await explainFinding(type);
            setExplanation(res.data);
        } catch { setExplanation({ error: true }); }
        finally { setExplaining(null); }
    };

    const toggleSource = (src) => setExpandedSources(prev => ({ ...prev, [src]: !prev[src] }));

    return (
        <div className="animate-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Security Scans</h1>
                    <p className="page-subtitle">Real-time attack surface assessment & AI vulnerability analysis</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className="badge badge-violet">◎ {scans.length} total scans</span>
                </div>
            </div>

            <div className="page-body">
                {/* ── Terminal + Form ──────────────────────── */}
                <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(6,182,212,0.03), rgba(124,58,237,0.05))', position: 'relative', overflow: 'hidden' }}>
                    {/* decorative blur */}
                    <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, background: 'var(--brand-violet)', filter: 'blur(100px)', opacity: 0.1, pointerEvents: 'none' }} />

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '2rem', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Initiate Scan</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Enter a domain, IP address, or URL to begin a comprehensive security assessment using our multi-agent engine.</p>
                            </div>
                            <form onSubmit={handleScan} style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
                                <input
                                    className="input"
                                    placeholder="https://example.com"
                                    value={target}
                                    onChange={e => setTarget(e.target.value)}
                                    style={{ fontFamily: 'Fira Code, monospace', fontSize: '0.9rem', padding: '0.875rem' }}
                                    disabled={scanning}
                                />
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <button className="btn-primary" disabled={scanning || !target} style={{ padding: '0.75rem 1.5rem' }}>
                                        {scanning ? <><span className="spinner spinner-sm" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} /> Scanning...</> : '◎ Start Scan'}
                                    </button>
                                    {error && <span style={{ fontSize: '0.75rem', color: 'var(--brand-red)' }}>⚠️ {error}</span>}
                                </div>
                            </form>
                        </div>

                        {/* Terminal */}
                        <div className="card" style={{ background: '#0a0a0f', borderColor: 'rgba(124,58,237,0.2)', padding: '0', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                            <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
                                </div>
                                <span style={{ fontSize: '0.65rem', color: '#6b7280', fontFamily: 'Fira Code, monospace' }}>scanner_v2 — bash</span>
                            </div>
                            <div className="terminal" style={{ padding: '1rem', minHeight: 180, maxHeight: 180, overflowY: 'auto' }}>
                                {termLines.map((line, i) => (
                                    <div key={i} style={{ marginBottom: '0.2rem' }}>
                                        {line.type === 'prompt' ? (
                                            <span className="terminal-prompt">{line.text} <span className="terminal-cursor" /></span>
                                        ) : (
                                            <span className={`terminal-${line.type}`}>
                                                {line.text}
                                            </span>
                                        )}
                                    </div>
                                ))}
                                {scanning && (
                                    <div style={{ marginTop: '0.5rem', color: 'var(--brand-cyan)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div className="spinner spinner-sm" style={{ width: 12, height: 12, borderWidth: 2 }} /> Processing vectors...
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Main Grid ───────────────────────────── */}
                <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1.2fr' : '1fr', gap: '1.25rem', alignItems: 'start' }}>

                    {/* Left: Scan History */}
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                Scan History
                            </span>
                        </div>
                        {loading ? (
                            <div style={{ padding: '3rem', display: 'flex', justifyContent: 'center' }}><div className="spinner spinner-lg" /></div>
                        ) : scans.length === 0 ? (
                            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>◎</div>
                                <p>No scans found. Run your first scan above.</p>
                            </div>
                        ) : (
                            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                                <table>
                                    <thead><tr><th>Target</th><th>Risk Level</th><th>Score</th><th>Date</th></tr></thead>
                                    <tbody>
                                        {scans.map(s => {
                                            const isActive = selected?.id === s.id;
                                            return (
                                                <tr key={s.id} onClick={() => { setSelected(null); setExplanation(null); setTimeout(() => setSelected(s), 0); }}
                                                    style={{ cursor: 'pointer', background: isActive ? 'var(--bg-hover)' : 'transparent', transition: 'all 0.15s' }}>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            {isActive && <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--brand-violet)', boxShadow: '0 0 8px var(--brand-violet)' }} />}
                                                            <span className="mono" style={{ fontSize: '0.8rem', color: isActive ? 'var(--brand-violet-light)' : 'var(--brand-cyan-light)', fontWeight: isActive ? 600 : 400 }}>
                                                                {s.target.replace(/https?:\/\//, '').slice(0, 30)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={`badge badge-${s.risk_level?.toLowerCase() || 'info'}`}>
                                                            <span className={`risk-dot risk-dot-${s.risk_level?.toLowerCase() || 'info'}`} />
                                                            {s.risk_level || 'Info'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span style={{ fontWeight: 700, color: RISK_COLORS[s.risk_level] || 'var(--text-primary)' }}>{s.risk_score}</span>
                                                    </td>
                                                    <td><span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.created_at ? new Date(s.created_at).toLocaleDateString() : '—'}</span></td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Right: Scan Detail UI */}
                    {selected && (
                        <div className="animate-slide" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="card" style={{ borderColor: RISK_COLORS[selected.risk_level] + '30' || 'var(--border-color)', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: RISK_COLORS[selected.risk_level] || 'var(--border-color)' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.375rem' }}>Scan Target</div>
                                        <div className="mono" style={{ fontSize: '0.9rem', color: 'var(--brand-cyan-light)', wordBreak: 'break-all', fontWeight: 600 }}>{selected.target}</div>
                                    </div>
                                    <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.25rem', lineHeight: 1 }}>×</button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                                    {[
                                        { label: 'Risk Score', value: selected.risk_summary?.risk_score ?? selected.risk_score, color: RISK_COLORS[selected.risk_level] || 'var(--text-primary)' },
                                        { label: 'Risk Level', badge: selected.risk_summary?.risk_level || selected.risk_level },
                                    ].map(({ label, value, color, badge }) => (
                                        <div className="stat-card" key={label} style={{ padding: '1rem', textAlign: 'center' }}>
                                            <span className="stat-label">{label}</span>
                                            {badge ? (
                                                <span className={`badge badge-${badge.toLowerCase()}`} style={{ marginTop: '0.5rem' }}>
                                                    <span className={`risk-dot risk-dot-${badge.toLowerCase()}`} /> {badge}
                                                </span>
                                            ) : (
                                                <span className="stat-value" style={{ color, fontSize: '1.8rem' }}>{value}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Findings Accordion */}
                            <div className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                        Findings ({(selected.findings || []).length})
                                    </span>
                                </div>

                                {(selected.findings || []).length === 0 ? (
                                    <div className="alert alert-success">✅ Engine detected no vulnerabilities for this target.</div>
                                ) : (() => {
                                    const groups = {};
                                    selected.findings.forEach(f => {
                                        const src = f.source || 'Core Scanner';
                                        if (!groups[src]) groups[src] = [];
                                        groups[src].push(f);
                                    });
                                    return Object.entries(groups).map(([src, items]) => {
                                        const isExpanded = expandedSources[src] !== false;
                                        return (
                                            <div key={src} style={{ marginBottom: '0.875rem' }}>
                                                <button onClick={() => toggleSource(src)}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
                                                        background: (SOURCE_COLORS[src] || '#6b7280') + '15',
                                                        border: `1px solid ${SOURCE_COLORS[src] || '#6b7280'}30`,
                                                        color: SOURCE_COLORS[src] || '#6b7280',
                                                        padding: '0.4rem 1rem', borderRadius: 'var(--radius-md)',
                                                        fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                                                        transition: 'all 0.15s', marginBottom: '0.5rem',
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.background = (SOURCE_COLORS[src] || '#6b7280') + '25'}
                                                    onMouseLeave={e => e.currentTarget.style.background = (SOURCE_COLORS[src] || '#6b7280') + '15'}>
                                                    <span>{src} <span style={{ opacity: 0.7, fontWeight: 400, marginLeft: '0.25rem' }}>({items.length})</span></span>
                                                    <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>{isExpanded ? '▲' : '▼'}</span>
                                                </button>

                                                {isExpanded && items.map((f, i) => (
                                                    <div key={i} className="card" style={{ padding: '0.75rem 1rem', cursor: 'pointer', marginBottom: '0.375rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', transition: 'all 0.15s' }}
                                                        onClick={() => handleExplain(f.type)}
                                                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)'; e.currentTarget.style.background = 'var(--bg-hover)'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                                            <span style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)' }}>{f.type}</span>
                                                            <span className={`badge badge-${(f.severity || 'info').toLowerCase()}`} style={{ fontSize: '0.65rem' }}>{f.severity}</span>
                                                        </div>
                                                        {(f.detail || f.description) && (
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5, wordBreak: 'break-word', marginBottom: '0.375rem' }}>
                                                                {(f.detail || f.description || '').slice(0, 120)}...
                                                            </div>
                                                        )}
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.65rem', color: 'var(--brand-violet-light)', fontWeight: 500 }}>
                                                            ✦ Ask Copilot to analyze
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    });
                                })()}
                            </div>

                            {/* AI Explanation Slide-in */}
                            {(explaining || explanation) && (
                                <div className="card animate-in" style={{ borderColor: 'rgba(124,58,237,0.4)', background: 'rgba(124,58,237,0.06)', position: 'relative' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand-violet), var(--brand-cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}>✦</div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Copilot Analysis</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--brand-violet-light)' }}>{explaining || explanation?.finding_type}</div>
                                        </div>
                                    </div>

                                    {explaining ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '1rem 0' }}>
                                            <div className="spinner spinner-sm" /> Synthesizing threat intelligence...
                                        </div>
                                    ) : explanation?.error ? (
                                        <div className="alert alert-error">Failed to generate explanation.</div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{explanation.detail}</p>
                                            <div style={{ background: 'var(--bg-void)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <strong style={{ color: 'var(--text-primary)', fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Business Impact</strong>
                                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', lineHeight: 1.5 }}>{explanation.impact}</span>
                                            </div>
                                            {explanation.owasp && (
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>OWASP: {explanation.owasp.owasp_id}</span>
                                                    <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>CWE: {explanation.owasp.cwe}</span>
                                                </div>
                                            )}
                                            {explanation.remediation?.steps && (
                                                <div>
                                                    <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Remediation Guide:</div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                                                        {explanation.remediation.steps.map((s, i) => (
                                                            <div key={i} style={{ display: 'flex', gap: '0.625rem', fontSize: '0.78rem', color: 'var(--text-secondary)', background: 'var(--bg-hover)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                                                                <span style={{ color: 'var(--brand-green)', fontWeight: 700 }}>{i + 1}.</span>
                                                                <span style={{ lineHeight: 1.5 }}>{s}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
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
