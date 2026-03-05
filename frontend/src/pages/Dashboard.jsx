import { useState, useEffect } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { getOrgStats, getOrgPlan, listScans } from '../api';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [plan, setPlan] = useState(null);
    const [recentScans, setRecentScans] = useState([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div className="spinner" style={{ width: 40, height: 40 }} />
            </div>
        );
    }

    const riskDist = stats?.risk_distribution || {};
    const riskColors = { Critical: '#EF4444', High: '#F97316', Medium: '#EAB308', Low: '#22C55E' };

    const doughnutData = {
        labels: Object.keys(riskDist),
        datasets: [{
            data: Object.values(riskDist),
            backgroundColor: Object.keys(riskDist).map(k => riskColors[k] || '#64748B'),
            borderWidth: 0,
        }],
    };

    const barData = {
        labels: recentScans.map(s => s.target.replace(/https?:\/\//, '').slice(0, 20)),
        datasets: [{
            label: 'Risk Score',
            data: recentScans.map(s => s.risk_score),
            backgroundColor: recentScans.map(s => riskColors[s.risk_level] || '#3B82F6'),
            borderRadius: 6,
        }],
    };

    const chartOptions = {
        responsive: true,
        plugins: { legend: { labels: { color: '#94A3B8' } } },
        scales: {
            x: { ticks: { color: '#64748B' }, grid: { color: '#1E293B' } },
            y: { ticks: { color: '#64748B' }, grid: { color: '#1E293B' }, max: 100 },
        },
    };

    return (
        <div className="animate-in">
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Dashboard
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Overview of your security posture
            </p>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="stat-card">
                    <span className="stat-label">Total Scans</span>
                    <span className="stat-value" style={{ color: 'var(--brand-blue)' }}>{stats?.total_scans || 0}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Team Members</span>
                    <span className="stat-value" style={{ color: 'var(--brand-cyan)' }}>{stats?.total_users || 0}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Current Plan</span>
                    <span className="stat-value gradient-text" style={{ fontSize: '1.5rem' }}>{plan?.plan?.toUpperCase() || 'FREE'}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Scans Used</span>
                    <span className="stat-value" style={{ color: 'var(--brand-green)' }}>
                        {plan?.usage?.scans_used || 0}
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            /{plan?.plan_details?.max_scans_per_month === -1 ? '∞' : plan?.plan_details?.max_scans_per_month}
                        </span>
                    </span>
                </div>
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card">
                    <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Risk Distribution</h3>
                    <div style={{ maxWidth: 220, margin: '0 auto' }}>
                        {Object.keys(riskDist).length > 0 ? (
                            <Doughnut data={doughnutData} options={{ plugins: { legend: { labels: { color: '#94A3B8', padding: 12 } } } }} />
                        ) : (
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No data yet</p>
                        )}
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Recent Scan Scores</h3>
                    {recentScans.length > 0 ? (
                        <Bar data={barData} options={chartOptions} />
                    ) : (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No scans yet. Run your first scan!</p>
                    )}
                </div>
            </div>

            {/* Recent Scans Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Recent Activity</h3>
                </div>
                {recentScans.length > 0 ? (
                    <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Target</th>
                                    <th>Risk</th>
                                    <th>Score</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentScans.map((s) => (
                                    <tr key={s.id}>
                                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{s.target}</td>
                                        <td><span className={`badge badge-${s.risk_level.toLowerCase()}`}>{s.risk_level}</span></td>
                                        <td style={{ fontWeight: 600 }}>{s.risk_score}</td>
                                        <td><span className={`badge ${s.status === 'completed' ? 'badge-low' : 'badge-medium'}`}>{s.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p style={{ color: 'var(--text-muted)', padding: '2rem', textAlign: 'center' }}>No scans yet</p>
                )}
            </div>
        </div>
    );
}
