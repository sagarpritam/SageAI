import { useState, useEffect, useRef } from 'react';
import { getAutoFixStatus, runAutoFix } from '../api';

const PIPELINE_STEPS = [
    { id: 'fetch', label: 'Fetch Repository', icon: '📥', desc: 'Cloning & reading source files' },
    { id: 'sast', label: 'SAST Analysis', icon: '🔍', desc: 'Bandit/Semgrep static analysis' },
    { id: 'ai', label: 'AI Patch Generation', icon: '✦', desc: 'GPT-4 generating secure fixes' },
    { id: 'validate', label: 'Validation', icon: '✓', desc: 'Re-scanning patched code' },
    { id: 'pr', label: 'Open PRs', icon: '🔀', desc: 'Creating GitHub pull requests' },
];

export default function AutoFix() {
    const [ready, setReady] = useState(false);
    const [readyMsg, setReadyMsg] = useState('');
    const [repo, setRepo] = useState('');
    const [branch, setBranch] = useState('main');
    const [maxFixes, setMaxFixes] = useState(5);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');
    const [activeStep, setActiveStep] = useState(null);
    const logRef = useRef(null);
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        getAutoFixStatus().then(r => {
            setReady(r.data.ready);
            setReadyMsg(r.data.message);
        }).catch(() => setReadyMsg('Failed to check status.'));
    }, []);

    const addLog = (msg, type = 'info') => {
        setLogs(prev => [...prev, { msg, type, ts: new Date().toLocaleTimeString() }]);
        setTimeout(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, 50);
    };

    const handleRun = async () => {
        if (!repo) return;
        setLoading(true); setError(''); setResults(null); setLogs([]);

        addLog(`🚀 Starting Self-Healing pipeline for ${repo}@${branch}`, 'prompt');

        // Animate pipeline steps
        const delays = [0, 1500, 3500, 6000, 8500];
        PIPELINE_STEPS.forEach((step, i) => {
            setTimeout(() => {
                setActiveStep(step.id);
                addLog(`→ ${step.label}: ${step.desc}...`, 'info');
            }, delays[i]);
        });

        try {
            const res = await runAutoFix(repo, branch, maxFixes);
            setActiveStep(null);
            setResults(res.data);
            const fixed = res.data.fix_results?.fixed?.length || 0;
            addLog(`✓ Pipeline complete — ${fixed} PR${fixed !== 1 ? 's' : ''} created`, 'success');
        } catch (err) {
            setActiveStep(null);
            const msg = err.response?.data?.detail || 'Auto-fix failed.';
            setError(msg);
            addLog(`✗ ${msg}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Self-Healing Code</h1>
                    <p className="page-subtitle">AI-powered vulnerability patching — scan repos & open GitHub PRs automatically</p>
                </div>
                <span className={`badge ${ready ? 'badge-success' : 'badge-warning'}`}>
                    {ready ? '● Ready' : '⚠ Setup Required'}
                </span>
            </div>
            <div className="page-body">
                {/* Status banner */}
                {!ready && (
                    <div className="alert alert-warning" style={{ marginBottom: '1.5rem' }}>
                        ⚠️ {readyMsg || 'Connect GitHub in Settings → GitHub to enable Auto-Fix.'}
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: results ? '1fr 1.3fr' : '1fr', gap: '1.25rem' }}>
                    {/* Left: pipeline + form */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {/* Pipeline visualization */}
                        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.05), rgba(6,182,212,0.03))' }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
                                Self-Healing Pipeline
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {PIPELINE_STEPS.map((step, i) => {
                                    const done = activeStep && PIPELINE_STEPS.findIndex(s => s.id === activeStep) > i;
                                    const active = activeStep === step.id;
                                    return (
                                        <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)', border: `1px solid ${active ? 'var(--brand-violet)' : 'var(--border-color)'}`, background: active ? 'rgba(124,58,237,0.1)' : done ? 'rgba(16,185,129,0.06)' : 'transparent', transition: 'all 0.3s ease' }}>
                                            <div style={{ width: 28, height: 28, borderRadius: '50%', border: `2px solid ${active ? 'var(--brand-violet)' : done ? 'var(--brand-green)' : 'var(--border-bright)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0, transition: 'all 0.3s', color: done ? 'var(--brand-green)' : 'inherit' }}>
                                                {done ? '✓' : active ? <span className="spinner spinner-sm" style={{ borderTopColor: 'var(--brand-violet)' }} /> : step.icon}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: active ? 'var(--brand-violet-light)' : done ? 'var(--brand-green)' : 'var(--text-secondary)' }}>{step.label}</div>
                                                {active && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{step.desc}</div>}
                                            </div>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{i + 1}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Run form */}
                        <div className="card">
                            <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '1rem' }}>Configure Run</div>
                            {error && <div className="alert alert-error" style={{ marginBottom: '0.875rem' }}>❌ {error}</div>}
                            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                                <label>Repository (owner/repo)</label>
                                <input className="input" placeholder="sagarpritam/my-app"
                                    value={repo} onChange={e => setRepo(e.target.value)} style={{ fontFamily: 'Fira Code, monospace', fontSize: '0.85rem' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                                <div className="form-group">
                                    <label>Branch</label>
                                    <input className="input" placeholder="main" value={branch} onChange={e => setBranch(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Max Fixes</label>
                                    <input className="input" type="number" min={1} max={20} value={maxFixes} onChange={e => setMaxFixes(parseInt(e.target.value))} />
                                </div>
                            </div>
                            <button className="btn-primary" onClick={handleRun} disabled={!ready || !repo || loading} style={{ width: '100%', justifyContent: 'center', padding: '0.7rem' }}>
                                {loading
                                    ? <><span className="spinner spinner-sm" /> Running pipeline...</>
                                    : '⚡ Scan & Auto-Fix Repository'}
                            </button>
                        </div>

                        {/* Terminal */}
                        {logs.length > 0 && (
                            <div className="card animate-in" style={{ padding: 0, overflow: 'hidden' }}>
                                <div style={{ display: 'flex', gap: 6, padding: '0.5rem 0.875rem', borderBottom: '1px solid var(--border-color)', alignItems: 'center' }}>
                                    {['#ef4444', '#f59e0b', '#10b981'].map(c => <div key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />)}
                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: '0.25rem', fontFamily: 'Fira Code, monospace' }}>self-healing-pipeline</span>
                                </div>
                                <div ref={logRef} className="terminal" style={{ maxHeight: 220, overflowY: 'auto', borderRadius: 0 }}>
                                    {logs.map((l, i) => (
                                        <span key={i} className={`terminal-line terminal-${l.type}`}>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem', marginRight: '0.5rem' }}>{l.ts}</span>{l.msg}
                                        </span>
                                    ))}
                                    {loading && <span className="terminal-cursor" />}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Results */}
                    {results && <ResultsView results={results} />}
                </div>
            </div>
        </div>
    );
}

function ResultsView({ results }) {
    const scan = results.scan_results || {};
    const fix = results.fix_results || {};
    const fixed = fix.fixed || [];
    const failed = fix.failed || [];
    const blocked = fix.blocked || [];

    if (results.status === 'clean') {
        return (
            <div className="card animate-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '3rem', minHeight: 300 }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Repo is Clean!</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{results.message}</p>
            </div>
        );
    }

    return (
        <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Summary stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.625rem' }}>
                {[
                    { label: 'Vulns Found', value: scan.total_findings || 0, color: 'var(--brand-yellow)' },
                    { label: 'PRs Created', value: fixed.length, color: 'var(--brand-green)' },
                    { label: 'Failed', value: failed.length, color: 'var(--brand-red)' },
                    { label: 'Blocked', value: blocked.length, color: 'var(--text-muted)' },
                ].map(({ label, value, color }) => (
                    <div key={label} className="stat-card" style={{ padding: '0.875rem' }}>
                        <span className="stat-label">{label}</span>
                        <span className="stat-value" style={{ fontSize: '1.5rem', color }}>{value}</span>
                    </div>
                ))}
            </div>

            {/* PRs opened */}
            {fixed.length > 0 && (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: 'var(--brand-green)' }}>🔀</span>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Pull Requests Created ({fixed.length})</span>
                    </div>
                    {fixed.map((f, i) => (
                        <div key={i} style={{ padding: '0.75rem 1.25rem', borderBottom: i < fixed.length - 1 ? '1px solid var(--border-color)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontFamily: 'Fira Code, monospace', fontSize: '0.75rem', color: 'var(--brand-cyan-light)', marginBottom: '0.2rem' }}>{f.file}</div>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <span className="badge badge-medium" style={{ fontSize: '0.65rem' }}>{f.vulnerability}</span>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{f.lines_changed} lines changed</span>
                                </div>
                            </div>
                            <a href={f.pr_url} target="_blank" rel="noopener noreferrer"
                                className="btn-secondary" style={{ fontSize: '0.72rem', padding: '0.3rem 0.625rem', textDecoration: 'none', flexShrink: 0 }}>
                                View PR ↗
                            </a>
                        </div>
                    ))}
                </div>
            )}

            {/* SAST Findings */}
            {(scan.findings || []).length > 0 && (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-color)' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>🔍 SAST Findings ({scan.findings.length})</span>
                    </div>
                    <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                        <table>
                            <thead><tr><th>File</th><th>Line</th><th>Severity</th><th>Issue</th></tr></thead>
                            <tbody>
                                {scan.findings.slice(0, 10).map((f, i) => (
                                    <tr key={i}>
                                        <td style={{ fontFamily: 'Fira Code, monospace', fontSize: '0.72rem', color: 'var(--brand-cyan-light)' }}>{f.file}</td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{f.line}</td>
                                        <td><span className={`badge badge-${f.severity === 'HIGH' ? 'high' : f.severity === 'MEDIUM' ? 'medium' : 'low'}`} style={{ fontSize: '0.65rem' }}>{f.severity}</span></td>
                                        <td style={{ fontSize: '0.78rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.issue_text}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Failed */}
            {failed.length > 0 && (
                <div className="card" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#fca5a5', marginBottom: '0.75rem' }}>❌ Failed Fixes ({failed.length})</div>
                    {failed.map((f, i) => (
                        <div key={i} style={{ fontSize: '0.78rem', padding: '0.5rem 0.75rem', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)', marginBottom: '0.4rem', borderLeft: '2px solid var(--brand-red)' }}>
                            <strong style={{ fontFamily: 'Fira Code, monospace', fontSize: '0.72rem' }}>{f.file}</strong>
                            <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>— {f.reason}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
