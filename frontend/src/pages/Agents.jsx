import { useState, useEffect, useRef } from 'react';
import { runAgentAssessment, getAgentStatus, listPlugins, getAttackPaths } from '../api';

const AGENTS = [
    { id: 'recon', name: 'ReconAgent', role: 'Attack Surface Discovery', icon: '🌐', color: '#06b6d4', desc: 'Subdomains, DNS, Shodan, crt.sh' },
    { id: 'scanner', name: 'ScannerAgent', role: 'Vulnerability Scanning', icon: '🔍', color: '#7c3aed', desc: 'Ports, SSL, HTTP headers, OSINT' },
    { id: 'exploit', name: 'ExploitAgent', role: 'Exploit Verification', icon: '⚡', color: '#f97316', desc: 'Safe HTTP probes + AI confidence scoring' },
    { id: 'developer', name: 'DeveloperAgent', role: 'Code Remediation', icon: '🛠', color: '#10b981', desc: 'SAST patching + GitHub PRs' },
    { id: 'report', name: 'ReportAgent', role: 'Report Generation', icon: '📋', color: '#8b5cf6', desc: 'Executive summary + HackerOne format' },
];

const RISK_COLORS = { Critical: '#ef4444', High: '#f97316', Medium: '#f59e0b', Low: '#10b981' };

const CATEGORY_ICONS = { network: '🌐', osint: '👁', crypto: '🔐', cloud: '☁️', api: '⚡', web: '🕸' };

export default function Agents() {
    const [target, setTarget] = useState('');
    const [mode, setMode] = useState('full');
    const [running, setRunning] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [plugins, setPlugins] = useState([]);
    const [attackPaths, setAttackPaths] = useState([]);
    const [activeAgent, setActiveAgent] = useState(null);
    const [phase, setPhase] = useState(null);
    const logRef = useRef(null);
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        listPlugins().then(r => setPlugins(r.data?.plugins || [])).catch(() => { });
        getAttackPaths().then(r => setAttackPaths(r.data?.attack_paths || [])).catch(() => { });
    }, []);

    const addLog = (msg, type = 'info') => {
        setLogs(prev => [...prev, { msg, type, ts: new Date().toLocaleTimeString() }]);
        setTimeout(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, 50);
    };

    const handleRun = async (e) => {
        e.preventDefault();
        if (!target) return;
        setRunning(true); setError(''); setResult(null); setLogs([]);

        const phases = [
            { id: 'recon', label: '→ ReconAgent: discovering attack surface...' },
            { id: 'scanner', label: '→ ScannerAgent: running vulnerability tools...' },
            { id: 'exploit', label: '→ ExploitAgent: verifying exploitability...' },
            { id: 'developer', label: '→ DeveloperAgent: on standby...' },
            { id: 'report', label: '→ ReportAgent: generating final report...' },
        ];

        addLog('🚀 Multi-Agent Assessment starting...', 'prompt');
        addLog(`Target: ${target} | Mode: ${mode}`, 'info');

        // Animate agent phases
        let phaseIdx = 0;
        const animInterval = setInterval(() => {
            if (phaseIdx < phases.length) {
                const p = phases[phaseIdx];
                setActiveAgent(p.id);
                setPhase(p.id);
                addLog(p.label, 'success');
                phaseIdx++;
            } else {
                clearInterval(animInterval);
            }
        }, mode === 'quick' ? 800 : 1800);

        try {
            const res = await runAgentAssessment(target, mode);
            clearInterval(animInterval);
            setActiveAgent(null);
            setResult(res.data);
            addLog(`✓ Assessment complete in ${res.data.total_duration_s?.toFixed(1) || '?'}s`, 'success');
            addLog(`Risk: ${res.data.risk_level} (${res.data.risk_score}/100) · ${res.data.finding_count} findings`, 'warn');
        } catch (err) {
            clearInterval(animInterval);
            const msg = err.response?.data?.detail || 'Assessment failed';
            setError(msg);
            addLog(`✗ ${msg}`, 'error');
        } finally {
            setRunning(false);
            setActiveAgent(null);
            setPhase(null);
        }
    };

    return (
        <div className="animate-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">AI Security Team</h1>
                    <p className="page-subtitle">Multi-agent autonomous security assessment pipeline</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span className="badge badge-violet">✦ 5 Agents</span>
                    <span className="badge badge-info">⚙ {plugins.length} Plugins</span>
                </div>
            </div>

            <div className="page-body">
                {/* Agent Pipeline Visualization */}
                <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(124,58,237,0.06), rgba(6,182,212,0.03))' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
                        Agent Pipeline
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', paddingBottom: '0.5rem' }}>
                        {AGENTS.map((agent, i) => (
                            <div key={agent.id} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                                <div style={{
                                    padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                                    border: `1px solid ${activeAgent === agent.id ? agent.color : 'var(--border-color)'}`,
                                    background: activeAgent === agent.id ? `${agent.color}18` : 'var(--bg-card)',
                                    transition: 'all 0.3s ease',
                                    minWidth: 140, cursor: 'default',
                                    boxShadow: activeAgent === agent.id ? `0 0 16px ${agent.color}40` : 'none',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                        <span style={{ fontSize: '1.1rem' }}>{agent.icon}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            {activeAgent === agent.id && <span className="spinner spinner-sm" style={{ borderTopColor: agent.color }} />}
                                            <span style={{ fontWeight: 700, fontSize: '0.78rem', color: activeAgent === agent.id ? agent.color : 'var(--text-primary)' }}>
                                                {agent.name}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{agent.desc}</div>
                                </div>
                                {i < AGENTS.length - 1 && (
                                    <div style={{
                                        width: 28, height: 2, flexShrink: 0,
                                        background: activeAgent && AGENTS.findIndex(a => a.id === activeAgent) > i
                                            ? 'linear-gradient(90deg, var(--brand-violet), var(--brand-cyan))'
                                            : 'var(--border-color)',
                                        transition: 'background 0.5s ease',
                                        position: 'relative',
                                    }}>
                                        <div style={{ position: 'absolute', right: -4, top: -4, color: 'var(--text-muted)', fontSize: '0.7rem' }}>▶</div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1.2fr' : '1fr', gap: '1.25rem' }}>
                    {/* Left: Run Assessment + Logs */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {/* Run form */}
                        <div className="card">
                            <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.875rem' }}>Run Full Assessment</div>
                            {error && <div className="alert alert-error" style={{ marginBottom: '0.875rem' }}>⚠️ {error}</div>}
                            <form onSubmit={handleRun} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <input className="input" placeholder="example.com"
                                    value={target} onChange={e => setTarget(e.target.value)}
                                    style={{ fontFamily: 'Fira Code, monospace' }} />
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {['quick', 'full'].map(m => (
                                        <button key={m} type="button"
                                            onClick={() => setMode(m)}
                                            className={mode === m ? 'btn-primary' : 'btn-secondary'}
                                            style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem' }}>
                                            {m === 'quick' ? '⚡ Quick (2 agents)' : '🔥 Full (5 agents)'}
                                        </button>
                                    ))}
                                </div>
                                <button className="btn-primary" style={{ justifyContent: 'center' }} disabled={running || !target}>
                                    {running
                                        ? <><span className="spinner spinner-sm" /> Running agents...</>
                                        : '✦ Launch AI Security Team'}
                                </button>
                            </form>
                        </div>

                        {/* Terminal log */}
                        {logs.length > 0 && (
                            <div className="card animate-in" style={{ padding: 0, overflow: 'hidden' }}>
                                <div style={{ display: 'flex', gap: 6, padding: '0.625rem 0.875rem', borderBottom: '1px solid var(--border-color)', alignItems: 'center' }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginLeft: '0.25rem', fontFamily: 'Fira Code, monospace' }}>
                                        multi-agent-orchestrator
                                    </span>
                                </div>
                                <div ref={logRef} className="terminal" style={{ maxHeight: 240, overflowY: 'auto', borderRadius: 0 }}>
                                    {logs.map((l, i) => (
                                        <span key={i} className={`terminal-line terminal-${l.type}`}>
                                            <span style={{ color: 'var(--text-muted)', marginRight: '0.5rem', fontSize: '0.68rem' }}>{l.ts}</span>
                                            {l.msg}
                                        </span>
                                    ))}
                                    {running && <span className="terminal-cursor" />}
                                </div>
                            </div>
                        )}

                        {/* Plugin Marketplace */}
                        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    ⚙ Plugin Marketplace
                                </span>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{plugins.length} plugins</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                {plugins.length === 0 ? (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                                        Run the backend to load plugins
                                    </div>
                                ) : plugins.map(p => (
                                    <div key={p.name} style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                                            {CATEGORY_ICONS[p.category] || '🔌'}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                                                <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{p.name}</span>
                                                <div style={{ display: 'flex', gap: '0.3rem' }}>
                                                    <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{p.category}</span>
                                                    {p.min_plan !== 'free' && (
                                                        <span className="badge badge-violet" style={{ fontSize: '0.65rem' }}>{p.min_plan}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{p.description.slice(0, 80)}...</div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.3rem' }}>
                                                {(p.tags || []).slice(0, 4).map(t => (
                                                    <span key={t} style={{ fontSize: '0.62rem', padding: '1px 6px', background: 'var(--bg-hover)', borderRadius: 999, color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>{t}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Results */}
                    {result && (
                        <div className="animate-slide" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Risk overview */}
                            <div className="card" style={{
                                borderColor: RISK_COLORS[result.risk_level] + '50',
                                background: RISK_COLORS[result.risk_level] + '08',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Assessment Complete</span>
                                    <button onClick={() => setResult(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.1rem' }}>×</button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.625rem' }}>
                                    {[
                                        { label: 'Risk Score', value: `${result.risk_score}/100`, color: RISK_COLORS[result.risk_level] },
                                        { label: 'Risk Level', value: result.risk_level, color: RISK_COLORS[result.risk_level] },
                                        { label: 'Findings', value: result.finding_count },
                                        { label: 'Hosts Found', value: result.subdomains_found },
                                    ].map(({ label, value, color }) => (
                                        <div key={label} className="stat-card" style={{ padding: '0.625rem' }}>
                                            <span className="stat-label">{label}</span>
                                            <span className="stat-value" style={{ fontSize: '1.15rem', color: color || 'var(--text-primary)' }}>{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Attack Paths */}
                            {result.attack_paths?.length > 0 && (
                                <div className="card">
                                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                                        🔗 Attack Paths (Knowledge Graph)
                                    </div>
                                    {result.attack_paths.map((path, i) => (
                                        <div key={i} style={{
                                            padding: '0.75rem', borderRadius: 'var(--radius-md)',
                                            border: `1px solid ${RISK_COLORS[path.risk_level] || 'var(--border-color)'}40`,
                                            background: (RISK_COLORS[path.risk_level] || '#6b7280') + '08',
                                            marginBottom: '0.5rem',
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                                <span className={`badge badge-${path.risk_level?.toLowerCase()}`}>{path.risk_level}</span>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>CVSS ~{path.cvss_estimate}</span>
                                            </div>
                                            <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--brand-cyan-light)', marginBottom: '0.4rem', lineHeight: 1.5 }}>
                                                {path.path}
                                            </div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                                Impact: {path.final_impact} · Likelihood: {path.likelihood}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Critical Findings */}
                            {result.verified_findings?.length > 0 && (
                                <div className="card">
                                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                                        Verified Findings ({result.verified_findings.length})
                                    </div>
                                    {result.verified_findings.slice(0, 8).map((f, i) => (
                                        <div key={i} style={{ padding: '0.5rem 0.75rem', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)', marginBottom: '0.4rem', border: '1px solid var(--border-color)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                                                <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{f.type}</span>
                                                <div style={{ display: 'flex', gap: '0.3rem' }}>
                                                    <span className={`badge badge-${f.severity?.toLowerCase()}`}>{f.severity}</span>
                                                    {f.confirmed && <span className="badge badge-critical" style={{ fontSize: '0.65rem' }}>✓ Confirmed</span>}
                                                </div>
                                            </div>
                                            {f.confidence && (
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                    Confidence: {f.confidence} · {f.attack_vector}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Executive Summary */}
                            {result.executive_summary && (
                                <div className="card" style={{ borderColor: 'rgba(124,58,237,0.3)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>📋</div>
                                        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Executive Summary</span>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap', maxHeight: 300, overflowY: 'auto' }}>
                                        {result.executive_summary.slice(0, 800)}
                                        {result.executive_summary.length > 800 && '...'}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
