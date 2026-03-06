import { useState, useEffect } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { getOrgStats, getOrgPlan, listScans } from '../api';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function AnimatedCounter({ target, duration = 1200 }) {
    const [value, setValue] = useState(0);
    useEffect(() => {
        if (!target) return;
        let start = 0;
        const step = Math.max(1, Math.floor(target / 40));
        const timer = setInterval(() => {
            start = Math.min(start + step, target);
            setValue(start);
            if (start >= target) clearInterval(timer);
        }, duration / 40);
        return () => clearInterval(timer);
    }, [target]);
    return <>{value}</>;
}

const RISK_COLORS = {
    Critical: '#ef4444', High: '#f97316', Medium: '#f59e0b', Low: '#10b981'
};

const QUICK_ACTIONS = [
    { label: 'New Scan', desc: 'Security assessment', icon: '◎', color: 'var(--brand-violet)', href: '/scans' },
    { label: 'Assets', desc: 'Attack surface', icon: '◈', color: 'var(--brand-cyan)', href: '/assets' },
    { label: 'AI Agents', desc: 'Multi-agent team', icon: '✦', color: 'var(--brand-blue)', href: '/agents' },
    { label: 'Copilot', desc: 'Security chat', icon: '💬', color: 'var(--brand-green)', href: '/copilot' },
    { label: 'Self-Healing', desc: 'Auto-fix PRs', icon: '🛡️', color: 'var(--brand-orange)', href: '/autofix' },
];

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [plan, setPlan] = useState(null);
    const [recentScans, setRecentScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const tick = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(tick);
    }, []);

    useEffect(() => {
        Promise.all([getOrgStats(), getOrgPlan(), listScans()])
            .then(([s, p, sc]) => {
                setStats(s.data);
                setPlan(p.data);
                setRecentScans(sc.data.slice(0, 5));
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const hour = now.getHours();
    const greeting = hour < 12 ? '🌅 Good morning' : hour < 17 ? '☀️ Good afternoon' : '🌙 Good evening';

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <div style={{ textAlign: 'center' }}>
                <div className="spinner spinner-lg" style={{ margin: '0 auto 1rem' }} />
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading your security dashboard...</div>
            </div>
        </div>
    );

    const riskDist = stats?.risk_distribution || {};
    const doughnutData = {
        labels: Object.keys(riskDist),
        datasets: [{
            data: Object.values(riskDist),
            backgroundColor: Object.keys(riskDist).map(k => (RISK_COLORS[k] || '#64748b') + '99'),
            borderColor: Object.keys(riskDist).map(k => RISK_COLORS[k] || '#64748b'),
            borderWidth: 2,
        }],
    };

    const barData = {
        labels: recentScans.map(s => s.target.replace(/https?:\/\//, '').slice(0, 18)),
        datasets: [{
            label: 'Risk Score',
            data: recentScans.map(s => s.risk_score),
            backgroundColor: recentScans.map(s => (RISK_COLORS[s.risk_level] || '#7c3aed') + '88'),
            borderColor: recentScans.map(s => RISK_COLORS[s.risk_level] || '#7c3aed'),
            borderWidth: 1, borderRadius: 8,
        }],
    };

    const chartOpts = {
        responsive: true,
        plugins: { legend: { labels: { color: '#8b9ab5', font: { size: 11 } } } },
        scales: {
            x: { ticks: { color: '#4a5568', font: { size: 10 } }, grid: { color: '#1e2d45' } },
            y: { ticks: { color: '#4a5568', font: { size: 10 } }, grid: { color: '#1e2d45' }, max: 100 },
        },
    };

    return (
        <div className="animate-in">
            {/* ── Header ──────────────────────────────── */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">{greeting}</h1>
                    <p className="page-subtitle">
                        {now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        {' · '}Security posture overview
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="badge badge-violet">
                        <span className="risk-dot risk-dot-low" style={{ background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
                        System Online
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </div>

            <div className="page-body">
                {/* ── Stat Cards ──────────────────────────── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                    {[
                        { label: 'Total Scans', value: stats?.total_scans || 0, color: 'var(--brand-violet-light)', icon: '◎', sub: 'All time' },
                        { label: 'Team Members', value: stats?.total_users || 0, color: 'var(--brand-cyan)', icon: '◈', sub: 'Active' },
                        { label: 'Critical Findings', value: riskDist.Critical || 0, color: 'var(--brand-red)', icon: '⚠', sub: 'Needs attention' },
                        { label: 'High Findings', value: riskDist.High || 0, color: 'var(--brand-orange)', icon: '△', sub: 'Investigate' },
                        { label: 'Scans Used', value: plan?.usage?.scans_used || 0, color: 'var(--brand-green)', icon: '✓', sub: `/ ${plan?.plan_details?.max_scans_per_month === -1 ? '∞' : plan?.plan_details?.max_scans_per_month || '—'}` },
                    ].map(({ label, value, color, icon, sub }) => (
                        <div className="stat-card" key={label}>
                            <div className="stat-icon">{icon}</div>
                            <span className="stat-label">{label}</span>
                            <span className="stat-value" style={{ color }}>
                                <AnimatedCounter target={value} />
                            </span>
                            {sub && <span className="stat-sub">{sub}</span>}
                        </div>
                    ))}
                </div>

                {/* ── Charts Row ──────────────────────────── */}
                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                    <div className="card">
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            Risk Distribution
                        </div>
                        {Object.keys(riskDist).length > 0 ? (
                            <Doughnut data={doughnutData} options={{
                                plugins: { legend: { position: 'bottom', labels: { color: '#8b9ab5', padding: 10, font: { size: 11 } } } },
                                cutout: '70%',
                            }} />
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                                Run a scan to see risk distribution
                            </div>
                        )}
                    </div>

                    <div className="card">
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            Recent Scan Risk Scores
                        </div>
                        {recentScans.length > 0 ? (
                            <Bar data={barData} options={chartOpts} />
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, flexDirection: 'column', gap: '0.5rem', color: 'var(--text-muted)' }}>
                                <span style={{ fontSize: '2rem' }}>◎</span>
                                <span style={{ fontSize: '0.85rem' }}>No scans yet — run your first scan</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Quick Actions ────────────────────────── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.875rem', marginBottom: '1.5rem' }}>
                    {QUICK_ACTIONS.map(({ label, desc, icon, color, href }) => (
                        <a key={label} href={href} style={{ textDecoration: 'none' }}>
                            <div className="card" style={{ cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '1rem 1.25rem' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = color + '80'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${color}15`; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                                <div style={{ width: 38, height: 38, borderRadius: 10, background: color + '1a', border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                                    {icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.12rem' }}>{label}</div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{desc}</div>
                                </div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>→</span>
                            </div>
                        </a>
                    ))}
                </div>

                {/* ── Recent Scans Table ──────────────────────── */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            Recent Activity
                        </span>
                        <a href="/scans" style={{ fontSize: '0.75rem', color: 'var(--brand-violet-light)', textDecoration: 'none' }}>View all →</a>
                    </div>
                    {recentScans.length > 0 ? (
                        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Target</th>
                                        <th>Risk Level</th>
                                        <th>Score</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentScans.map((s) => (
                                        <tr key={s.id}>
                                            <td>
                                                <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--brand-cyan-light)' }}>
                                                    {s.target}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge badge-${s.risk_level?.toLowerCase()}`}>
                                                    <span className={`risk-dot risk-dot-${s.risk_level?.toLowerCase()}`} />
                                                    {s.risk_level}
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{ fontWeight: 700, color: RISK_COLORS[s.risk_level] || 'var(--text-primary)' }}>
                                                    {s.risk_score}
                                                </span>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>/100</span>
                                            </td>
                                            <td>
                                                <span className={`badge ${s.status === 'completed' ? 'badge-success' : 'badge-medium'}`}>
                                                    {s.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>◎</div>
                            <p>No scans yet. Head to <a href="/scans" style={{ color: 'var(--brand-violet-light)' }}>Scans</a> to get started.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
