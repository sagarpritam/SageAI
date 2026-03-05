import { useState, useEffect } from 'react';
import { listSchedules, createSchedule, deleteSchedule } from '../api';

export default function Schedules() {
    const [schedules, setSchedules] = useState([]);
    const [target, setTarget] = useState('');
    const [frequency, setFrequency] = useState('daily');
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    const fetch = () => {
        listSchedules().then(r => setSchedules(r.data)).catch(() => { }).finally(() => setLoading(false));
    };

    useEffect(() => { fetch(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!target) return;
        setCreating(true);
        try {
            await createSchedule(target, frequency);
            setTarget('');
            fetch();
        } catch { }
        finally { setCreating(false); }
    };

    const handleDelete = async (id) => {
        await deleteSchedule(id);
        fetch();
    };

    const freqIcon = { daily: '📅', weekly: '📆', monthly: '🗓️' };

    return (
        <div className="animate-in">
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Scheduled Scans</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Automate recurring security scans on your targets</p>

            {/* Create Schedule */}
            <div className="card glow" style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>➕ New Schedule</h3>
                <form onSubmit={handleCreate} style={{ display: 'flex', gap: '0.75rem' }}>
                    <input className="input" placeholder="https://example.com" value={target}
                        onChange={e => setTarget(e.target.value)} style={{ flex: 1 }} />
                    <select className="input" value={frequency} onChange={e => setFrequency(e.target.value)} style={{ width: '140px' }}>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                    <button className="btn-primary" disabled={creating || !target}>
                        {creating ? 'Creating...' : '⏰ Schedule'}
                    </button>
                </form>
            </div>

            {/* Schedule List */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Active Schedules</h3>
                </div>

                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
                ) : schedules.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', padding: '2rem', textAlign: 'center' }}>No scheduled scans yet</p>
                ) : (
                    <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                        <table>
                            <thead><tr><th>Target</th><th>Frequency</th><th>Runs</th><th>Last Run</th><th>Status</th><th></th></tr></thead>
                            <tbody>
                                {schedules.map(s => (
                                    <tr key={s.id}>
                                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{s.target}</td>
                                        <td>
                                            <span style={{ fontSize: '0.85rem' }}>
                                                {freqIcon[s.frequency] || '📅'} {s.frequency}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 600 }}>{s.run_count || 0}</td>
                                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            {s.last_run_at ? new Date(s.last_run_at).toLocaleDateString() : 'Never'}
                                        </td>
                                        <td>
                                            <span className={`badge badge-${s.is_active ? 'low' : 'critical'}`}>
                                                {s.is_active ? 'Active' : 'Paused'}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn-secondary" style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
                                                onClick={() => handleDelete(s.id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
