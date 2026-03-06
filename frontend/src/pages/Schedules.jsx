import { useState, useEffect } from 'react';
import { listSchedules, createSchedule, deleteSchedule } from '../api';

const FREQ_OPTIONS = [
    { value: 'daily', label: 'Daily', desc: 'Every 24 hours', icon: '☀️' },
    { value: 'weekly', label: 'Weekly', desc: 'Every 7 days', icon: '📅' },
    { value: 'monthly', label: 'Monthly', desc: 'Every 30 days', icon: '🗓️' },
];

const FREQ_BADGE = {
    daily: { label: 'Daily', cls: 'badge-critical' },
    weekly: { label: 'Weekly', cls: 'badge-medium' },
    monthly: { label: 'Monthly', cls: 'badge-low' },
};

function nextRunRelative(nextRun) {
    if (!nextRun) return '—';
    const diff = new Date(nextRun) - new Date();
    if (diff < 0) return 'Overdue';
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);
    if (days > 0) return `in ${days}d ${hours % 24}h`;
    return `in ${hours}h`;
}

export default function Schedules() {
    const [schedules, setSchedules] = useState([]);
    const [target, setTarget] = useState('');
    const [frequency, setFrequency] = useState('weekly');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const load = () => listSchedules().then(r => setSchedules(r.data)).catch(() => { }).finally(() => setLoading(false));
    useEffect(load, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!target) return;
        setSaving(true); setError(''); setSuccess('');
        try {
            await createSchedule(target, frequency);
            setTarget('');
            setSuccess(`✅ Schedule created for ${target}`);
            load();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to create schedule');
        } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        setDeletingId(id);
        await deleteSchedule(id).catch(() => { });
        load(); setDeletingId('');
    };

    // Group by frequency
    const grouped = FREQ_OPTIONS.reduce((acc, f) => {
        acc[f.value] = schedules.filter(s => s.frequency === f.value);
        return acc;
    }, {});

    return (
        <div className="animate-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Schedules</h1>
                    <p className="page-subtitle">Automate recurring scans for continuous attack surface monitoring</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className="badge badge-violet">◷ {schedules.length} active</span>
                </div>
            </div>

            <div className="page-body">
                <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: '1.5rem', alignItems: 'start' }}>

                    {/* ── Left: Create form + info ────────────────── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="card" style={{ borderColor: 'rgba(124,58,237,0.2)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, var(--brand-violet), var(--brand-cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>◷</div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>New Scheduled Scan</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Continuous security monitoring</div>
                                </div>
                            </div>

                            {error && <div className="alert alert-error" style={{ marginBottom: '0.875rem' }}>{error}</div>}
                            {success && <div className="alert alert-success" style={{ marginBottom: '0.875rem' }}>{success}</div>}

                            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                                <div className="form-group">
                                    <label>Target URL or Domain</label>
                                    <input className="input" placeholder="https://example.com"
                                        value={target} onChange={e => setTarget(e.target.value)}
                                        style={{ fontFamily: 'Fira Code, monospace', fontSize: '0.85rem' }} />
                                </div>

                                <div className="form-group">
                                    <label>Scan Frequency</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                                        {FREQ_OPTIONS.map(f => (
                                            <button key={f.value} type="button" onClick={() => setFrequency(f.value)}
                                                style={{
                                                    padding: '0.625rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', textAlign: 'center',
                                                    border: `1px solid ${frequency === f.value ? 'var(--brand-violet)' : 'var(--border-color)'}`,
                                                    background: frequency === f.value ? 'rgba(124,58,237,0.12)' : 'var(--bg-secondary)',
                                                    transition: 'all 0.15s',
                                                }}>
                                                <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{f.icon}</div>
                                                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: frequency === f.value ? 'var(--brand-violet-light)' : 'var(--text-primary)' }}>{f.label}</div>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{f.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button className="btn-primary" type="submit" disabled={saving || !target} style={{ justifyContent: 'center' }}>
                                    {saving ? <><span className="spinner spinner-sm" /> Creating...</> : '+ Create Schedule'}
                                </button>
                            </form>
                        </div>

                        {/* Info card */}
                        <div className="card" style={{ background: 'rgba(6,182,212,0.04)', borderColor: 'rgba(6,182,212,0.15)', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--brand-cyan)', marginBottom: '0.625rem' }}>✦ How it works</div>
                            <p>Scheduled scans run automatically and generate new reports. You'll receive Webhook notifications on each run.</p>
                            <p style={{ marginTop: '0.5rem' }}>Results are stored for 90 days on Pro plans and 1 year on Enterprise.</p>
                        </div>
                    </div>

                    {/* ── Right: Schedule List ───────────────────── */}
                    <div>
                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                                <div className="spinner spinner-lg" />
                            </div>
                        ) : schedules.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>◷</div>
                                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>No Schedules Yet</div>
                                <p style={{ fontSize: '0.85rem' }}>Create your first schedule to start continuous monitoring</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {FREQ_OPTIONS.map(freq => {
                                    const items = grouped[freq.value];
                                    if (items.length === 0) return null;
                                    return (
                                        <div key={freq.value}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
                                                <span style={{ fontSize: '1rem' }}>{freq.icon}</span>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                                    {freq.label} ({items.length})
                                                </span>
                                            </div>
                                            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                                {items.map((s, i) => (
                                                    <div key={s.id} style={{
                                                        display: 'flex', alignItems: 'center', gap: '1rem',
                                                        padding: '0.875rem 1.25rem',
                                                        borderBottom: i < items.length - 1 ? '1px solid var(--border-color)' : 'none',
                                                    }}>
                                                        {/* Pulsing dot */}
                                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-green)', boxShadow: '0 0 8px var(--brand-green)', animation: 'pulse-glow 2s ease-in-out infinite', flexShrink: 0 }} />

                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <div className="mono" style={{ fontSize: '0.8rem', color: 'var(--brand-cyan-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '0.25rem' }}>
                                                                {s.target}
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                                <span className={`badge ${FREQ_BADGE[s.frequency]?.cls || 'badge-none'}`} style={{ fontSize: '0.65rem' }}>
                                                                    {FREQ_BADGE[s.frequency]?.label || s.frequency}
                                                                </span>
                                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                                    Next: {nextRunRelative(s.next_run)}
                                                                </span>
                                                                {s.next_run && <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>({new Date(s.next_run).toLocaleDateString()})</span>}
                                                            </div>
                                                        </div>

                                                        {s.last_run_status && (
                                                            <span className={`badge ${s.last_run_status === 'completed' ? 'badge-success' : 'badge-none'}`} style={{ fontSize: '0.65rem' }}>
                                                                {s.last_run_status === 'completed' ? '✓ Last OK' : s.last_run_status}
                                                            </span>
                                                        )}

                                                        <button className="btn-danger" style={{ padding: '0.3rem 0.625rem', fontSize: '0.72rem', flexShrink: 0 }}
                                                            onClick={() => handleDelete(s.id)} disabled={deletingId === s.id}>
                                                            {deletingId === s.id ? <span className="spinner spinner-sm" /> : 'Delete'}
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
