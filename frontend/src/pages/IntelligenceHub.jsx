import { useState, useEffect, useRef } from 'react';
import { runIntelSweep, runIntelModule, getIntelModules } from '../api';

const MODULE_INFO = {
    shodan: { num: '01', name: 'SHODAN', subtitle: 'THE PANOPTICON', color: '#22d3ee', icon: '🔭' },
    maltego: { num: '02', name: 'MALTEGO', subtitle: 'LINK ANALYSIS', color: '#a78bfa', icon: '🕸️' },
    darkweb: { num: '03', name: 'BABEL X', subtitle: 'THE LINGUISTIC MESH', color: '#f87171', icon: '🌑' },
    spiderfoot: { num: '04', name: 'SPIDERFOOT', subtitle: 'RECON AUTOMATION', color: '#34d399', icon: '🕷️' },
    identity: { num: '05', name: 'SOCIAL LINKS', subtitle: 'NEURAL DE-MASKING', color: '#fbbf24', icon: '👤' },
    intelx: { num: '06', name: 'INTEL X', subtitle: 'ARCHIVE OF SECRETS', color: '#fb923c', icon: '🗄️' },
    recon_ng: { num: '07', name: 'RECON-NG', subtitle: 'THE FRAMEWORK', color: '#60a5fa', icon: '🎯' },
    censys: { num: '08', name: 'CENSYS', subtitle: 'THE GLOBAL RADAR', color: '#c084fc', icon: '📡' },
    osint_industries: { num: '09', name: 'OSINT IND.', subtitle: 'THE INTERCEPTOR', color: '#f472b6', icon: '📧' },
};

const SEVERITY_COLORS = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    info: '#3b82f6',
    low: '#6b7280',
};

const TARGET_TYPES = [
    { value: 'domain', label: '🌐 Domain', placeholder: 'example.com' },
    { value: 'ip', label: '📌 IP Address', placeholder: '8.8.8.8' },
    { value: 'email', label: '📧 Email', placeholder: 'user@example.com' },
    { value: 'username', label: '👤 Username', placeholder: 'johndoe' },
    { value: 'phone', label: '📱 Phone', placeholder: '+1234567890' },
];

export default function IntelligenceHub() {
    const [target, setTarget] = useState('');
    const [targetType, setTargetType] = useState('domain');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [activeModule, setActiveModule] = useState(null);
    const [modules, setModules] = useState([]);
    const [selectedFinding, setSelectedFinding] = useState(null);
    const [phase, setPhase] = useState('');
    const canvasRef = useRef(null);

    useEffect(() => {
        getIntelModules()
            .then(r => setModules(r.data.modules || []))
            .catch(() => { });
    }, []);

    // Draw network graph when results change
    useEffect(() => {
        if (results?.graph) drawGraph(results.graph);
    }, [results, activeModule]);

    const runSweep = async () => {
        if (!target.trim()) return;
        setLoading(true);
        setResults(null);
        setActiveModule(null);
        setPhase('Initializing intelligence sweep...');
        try {
            const { data } = await runIntelSweep(target.trim(), targetType);
            setResults(data.results || {});
            setPhase('');
        } catch (err) {
            setPhase(`Error: ${err.response?.data?.detail || err.message}`);
        }
        setLoading(false);
    };

    const runSingleModule = async (moduleId) => {
        if (!target.trim()) return;
        setLoading(true);
        setActiveModule(moduleId);
        setPhase(`Running ${MODULE_INFO[moduleId]?.name || moduleId}...`);
        try {
            const { data } = await runIntelModule(moduleId, target.trim(), targetType);
            setResults(prev => ({ ...prev, [moduleId]: data.findings || [] }));
            setPhase('');
        } catch (err) {
            setPhase(`Error: ${err.response?.data?.detail || err.message}`);
        }
        setLoading(false);
    };

    const drawGraph = (graph) => {
        const canvas = canvasRef.current;
        if (!canvas || !graph?.nodes?.length) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width = canvas.parentElement.offsetWidth;
        const H = canvas.height = 400;

        ctx.fillStyle = '#0d1117';
        ctx.fillRect(0, 0, W, H);

        // Grid lines
        ctx.strokeStyle = 'rgba(48,54,61,0.5)';
        ctx.lineWidth = 0.5;
        for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
        for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

        const nodes = graph.nodes;
        const edges = graph.edges;
        const nodePositions = {};

        // Position nodes in a radial layout
        const cx = W / 2, cy = H / 2;
        nodes.forEach((node, i) => {
            if (i === 0) {
                nodePositions[node.id] = { x: cx, y: cy };
            } else {
                const angle = (2 * Math.PI * (i - 1)) / (nodes.length - 1);
                const radius = Math.min(W, H) * 0.35;
                nodePositions[node.id] = {
                    x: cx + radius * Math.cos(angle) + (Math.random() - 0.5) * 20,
                    y: cy + radius * Math.sin(angle) + (Math.random() - 0.5) * 20,
                };
            }
        });

        // Draw edges
        edges.forEach(edge => {
            const from = nodePositions[edge.source];
            const to = nodePositions[edge.target];
            if (!from || !to) return;
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.strokeStyle = edge.weight >= 3 ? 'rgba(239,68,68,0.4)' : edge.weight >= 2 ? 'rgba(251,191,36,0.3)' : 'rgba(59,130,246,0.2)';
            ctx.lineWidth = edge.weight;
            ctx.stroke();
        });

        // Draw nodes
        const typeColors = {
            domain: '#22d3ee', ip: '#60a5fa', port: '#f59e0b', vulnerability: '#ef4444',
            email: '#f472b6', person: '#fbbf24', breach: '#dc2626', technology: '#34d399',
            social_account: '#a78bfa', location: '#6ee7b7', darkweb: '#991b1b',
            sensitive_path: '#f97316', unknown: '#6b7280',
        };

        nodes.forEach((node, i) => {
            const pos = nodePositions[node.id];
            if (!pos) return;
            const color = typeColors[node.type] || '#6b7280';
            const size = i === 0 ? 18 : 8;

            // Glow
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, size + 4, 0, Math.PI * 2);
            ctx.fillStyle = color.replace(')', ',0.15)').replace('rgb', 'rgba');
            ctx.fill();

            // Node
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Label
            ctx.fillStyle = '#e6edf3';
            ctx.font = i === 0 ? 'bold 11px monospace' : '9px monospace';
            ctx.textAlign = 'center';
            const label = node.label.length > 25 ? node.label.slice(0, 22) + '...' : node.label;
            ctx.fillText(label, pos.x, pos.y + size + 14);
        });

        // Legend
        ctx.fillStyle = '#8b949e';
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`NODES: ${nodes.length} | EDGES: ${edges.length}`, 10, H - 10);
    };

    const getAllFindings = () => {
        if (!results) return [];
        const all = [];
        Object.entries(results).forEach(([key, val]) => {
            if (Array.isArray(val)) val.forEach(f => all.push({ ...f, _module: key }));
        });
        return all;
    };

    const findings = getAllFindings();
    const stats = {
        total: findings.length,
        critical: findings.filter(f => f.severity === 'critical').length,
        high: findings.filter(f => f.severity === 'high').length,
        medium: findings.filter(f => f.severity === 'medium').length,
    };

    return (
        <div style={{ padding: '1.5rem', maxWidth: 1400, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 className="gradient-text" style={{ fontSize: '1.6rem', margin: 0, fontWeight: 800, letterSpacing: '-0.02em' }}>
                    ⚡ Intelligence Hub
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>
                    9 OSINT Modules • The Blacklight • Secure Your Shadow
                </p>
            </div>

            {/* Target Input */}
            <div className="card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div style={{ flex: '0 0 140px' }}>
                        <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4, display: 'block' }}>TARGET TYPE</label>
                        <select
                            value={targetType}
                            onChange={e => setTargetType(e.target.value)}
                            className="input"
                            style={{ width: '100%', height: 40, background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0 0.5rem', fontSize: '0.8rem' }}
                        >
                            {TARGET_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                    </div>
                    <div style={{ flex: 1, minWidth: 200 }}>
                        <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4, display: 'block' }}>TARGET</label>
                        <input
                            value={target}
                            onChange={e => setTarget(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && runSweep()}
                            placeholder={TARGET_TYPES.find(t => t.value === targetType)?.placeholder}
                            className="input"
                            style={{ width: '100%', height: 40, background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0 0.75rem', fontSize: '0.85rem', fontFamily: 'monospace' }}
                        />
                    </div>
                    <button
                        onClick={runSweep}
                        disabled={loading || !target.trim()}
                        className="btn-primary"
                        style={{ height: 40, padding: '0 1.5rem', fontWeight: 700, fontSize: '0.8rem', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', color: 'white', opacity: loading ? 0.6 : 1 }}
                    >
                        {loading ? '⏳ Scanning...' : '🚀 FULL SWEEP'}
                    </button>
                </div>
                {phase && (
                    <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: phase.startsWith('Error') ? '#ef4444' : '#22d3ee', fontFamily: 'monospace' }}>
                        ▸ {phase}
                    </div>
                )}
            </div>

            {/* Module Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.6rem', marginBottom: '1rem' }}>
                {Object.entries(MODULE_INFO).map(([id, info]) => {
                    const modFindings = results?.[id];
                    const count = Array.isArray(modFindings) ? modFindings.length : 0;
                    const hasCrit = Array.isArray(modFindings) && modFindings.some(f => f.severity === 'critical' || f.severity === 'high');

                    return (
                        <div
                            key={id}
                            onClick={() => target.trim() && runSingleModule(id)}
                            className="card"
                            style={{
                                padding: '0.75rem',
                                cursor: target.trim() ? 'pointer' : 'default',
                                borderLeft: `3px solid ${info.color}`,
                                transition: 'all 0.2s',
                                opacity: loading && activeModule === id ? 0.6 : 1,
                                position: 'relative',
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontSize: '0.6rem', color: info.color, fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.1em' }}>
                                        {info.num} // {info.icon}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                                        {info.name}
                                    </div>
                                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>
                                        {info.subtitle}
                                    </div>
                                </div>
                                {count > 0 && (
                                    <span style={{
                                        fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px',
                                        borderRadius: '999px',
                                        background: hasCrit ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)',
                                        color: hasCrit ? '#f87171' : '#60a5fa',
                                        border: `1px solid ${hasCrit ? 'rgba(239,68,68,0.25)' : 'rgba(59,130,246,0.25)'}`,
                                    }}>
                                        {count}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Stats Row */}
            {results && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem', marginBottom: '1rem' }}>
                    {[
                        { label: 'Total Findings', val: stats.total, color: '#22d3ee' },
                        { label: 'Critical', val: stats.critical, color: '#ef4444' },
                        { label: 'High', val: stats.high, color: '#f97316' },
                        { label: 'Medium', val: stats.medium, color: '#eab308' },
                    ].map(s => (
                        <div key={s.label} className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, fontFamily: 'monospace' }}>{s.val}</div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>{s.label.toUpperCase()}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Network Graph (Maltego-style) */}
            {results?.graph?.nodes?.length > 0 && (
                <div className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <div>
                            <span style={{ fontSize: '0.7rem', color: '#a78bfa', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.1em' }}>02 // 🕸️ MALTEGO: LINK ANALYSIS</span>
                            <h3 style={{ margin: '0.25rem 0 0', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                Entity Relationship Graph
                            </h3>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                            {results.graph.stats?.total_nodes || 0} nodes • {results.graph.stats?.total_edges || 0} edges
                        </span>
                    </div>
                    <canvas ref={canvasRef} style={{ width: '100%', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} />
                </div>
            )}

            {/* Findings Table */}
            {findings.length > 0 && (
                <div className="card" style={{ padding: '1rem' }}>
                    <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        📋 All Intelligence Findings ({findings.length})
                    </h3>
                    <div style={{ maxHeight: 500, overflowY: 'auto' }}>
                        {findings.map((f, i) => {
                            const modInfo = MODULE_INFO[f._module || f.module] || {};
                            return (
                                <div
                                    key={i}
                                    onClick={() => setSelectedFinding(selectedFinding === i ? null : i)}
                                    style={{
                                        padding: '0.6rem 0.75rem',
                                        borderBottom: '1px solid var(--border-color)',
                                        cursor: 'pointer',
                                        background: selectedFinding === i ? 'var(--bg-hover)' : 'transparent',
                                        transition: 'background 0.15s',
                                    }}
                                    onMouseEnter={e => { if (selectedFinding !== i) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                                    onMouseLeave={e => { if (selectedFinding !== i) e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <span style={{
                                            fontSize: '0.6rem', fontWeight: 700, padding: '2px 6px',
                                            borderRadius: '3px', fontFamily: 'monospace',
                                            background: (SEVERITY_COLORS[f.severity] || '#6b7280') + '22',
                                            color: SEVERITY_COLORS[f.severity] || '#6b7280',
                                            border: `1px solid ${(SEVERITY_COLORS[f.severity] || '#6b7280')}33`,
                                            minWidth: 52, textAlign: 'center', textTransform: 'uppercase',
                                        }}>
                                            {f.severity}
                                        </span>
                                        <span style={{ fontSize: '0.6rem', color: modInfo.color || '#6b7280', fontWeight: 700, fontFamily: 'monospace', minWidth: 60 }}>
                                            {modInfo.num || '??'} {modInfo.icon || ''}
                                        </span>
                                        <span style={{ flex: 1, fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                            {f.title || f.type}
                                        </span>
                                        <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                            {f.source?.split('(')[0]?.trim() || ''}
                                        </span>
                                    </div>
                                    {selectedFinding === i && (
                                        <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace', lineHeight: 1.6, wordBreak: 'break-all' }}>
                                            <div>{f.detail}</div>
                                            {f.data && Object.keys(f.data).length > 0 && (
                                                <details style={{ marginTop: '0.5rem' }}>
                                                    <summary style={{ cursor: 'pointer', color: '#60a5fa', fontSize: '0.7rem' }}>Raw Data</summary>
                                                    <pre style={{ marginTop: '0.25rem', fontSize: '0.65rem', whiteSpace: 'pre-wrap', color: '#8b949e' }}>
                                                        {JSON.stringify(f.data, null, 2)}
                                                    </pre>
                                                </details>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!results && !loading && (
                <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔒</div>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        THE BLACKLIGHT
                    </h2>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>
                        These tools aren't just for "research." They are for power.<br />
                        In 2026, you are either the Hunter or the Data Point.<br />
                        The tools are ready. Are you? <strong style={{ color: '#22d3ee' }}>SECURE YOUR SHADOW.</strong>
                    </p>
                    <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {Object.entries(MODULE_INFO).map(([id, info]) => (
                            <span key={id} style={{
                                fontSize: '0.6rem', fontWeight: 700, padding: '3px 8px', borderRadius: '3px',
                                background: `${info.color}15`, color: info.color, border: `1px solid ${info.color}30`,
                                fontFamily: 'monospace',
                            }}>
                                {info.num} {info.name}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
