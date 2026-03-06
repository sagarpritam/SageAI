import { useState, useEffect } from 'react';
import { getOrgUsers, updateUserRole } from '../api';
import api from '../api';

const ROLES = ['admin', 'member', 'viewer'];
const ROLE_COLORS = { admin: 'badge-critical', member: 'badge-info', viewer: 'badge-none' };

export default function Team() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('member');
    const [inviting, setInviting] = useState(false);
    const [inviteStatus, setInviteStatus] = useState('');

    const load = () => {
        getOrgUsers()
            .then(r => setUsers(r.data))
            .catch(() => setError('Failed to load team members'))
            .finally(() => setLoading(false));
    };
    useEffect(load, []);

    const handleRoleChange = async (userId, newRole) => {
        try {
            await updateUserRole(userId, newRole);
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch {
            setError('Failed to update role');
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        if (!inviteEmail) return;
        setInviting(true); setInviteStatus('');
        try {
            await api.post('/org/invite', { email: inviteEmail, role: inviteRole });
            setInviteStatus(`✅ Invite sent to ${inviteEmail}`);
            setInviteEmail('');
            load();
        } catch (err) {
            setInviteStatus(err.response?.data?.detail || 'Invite failed');
        } finally { setInviting(false); }
    };

    return (
        <div className="animate-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Team</h1>
                    <p className="page-subtitle">Manage members, roles & access control</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className="badge badge-violet">◈ {users.length} member{users.length !== 1 ? 's' : ''}</span>
                </div>
            </div>
            <div className="page-body">
                {error && <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>{error}</div>}

                {/* Invite card */}
                <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'rgba(124,58,237,0.25)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, var(--brand-violet), var(--brand-cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>✉️</div>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Invite Team Member</span>
                    </div>
                    <form onSubmit={handleInvite} style={{ display: 'flex', gap: '0.625rem' }}>
                        <input className="input" type="email" placeholder="colleague@company.com"
                            value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} style={{ flex: 1 }} />
                        <select className="input" value={inviteRole} onChange={e => setInviteRole(e.target.value)} style={{ width: 130 }}>
                            {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                        </select>
                        <button className="btn-primary" type="submit" disabled={inviting || !inviteEmail}>
                            {inviting ? <><span className="spinner spinner-sm" /> Sending...</> : '+ Invite'}
                        </button>
                    </form>
                    {inviteStatus && (
                        <div className={`alert ${inviteStatus.includes('✅') ? 'alert-success' : 'alert-error'}`} style={{ marginTop: '0.75rem' }}>
                            {inviteStatus}
                        </div>
                    )}
                </div>

                {/* Members table */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Members</span>
                    </div>
                    {loading ? (
                        <div style={{ padding: '3rem', display: 'flex', justifyContent: 'center' }}>
                            <div className="spinner spinner-lg" />
                        </div>
                    ) : (
                        <div>
                            {users.length === 0 ? (
                                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    No team members yet. Invite someone above!
                                </div>
                            ) : users.map((u, i) => (
                                <div key={u.id} style={{
                                    display: 'flex', alignItems: 'center', gap: '1rem',
                                    padding: '0.875rem 1.25rem',
                                    borderBottom: i < users.length - 1 ? '1px solid var(--border-color)' : 'none',
                                    transition: 'background 0.15s',
                                }}>
                                    {/* Avatar */}
                                    <div className="member-avatar">
                                        {u.email.slice(0, 2).toUpperCase()}
                                    </div>
                                    {/* Info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {u.email}
                                        </div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                            Joined {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </div>
                                    {/* Role badge */}
                                    <span className={`badge ${ROLE_COLORS[u.role] || 'badge-none'}`} style={{ flexShrink: 0 }}>
                                        {u.role}
                                    </span>
                                    {/* Role selector */}
                                    <select value={u.role} onChange={e => handleRoleChange(u.id, e.target.value)}
                                        className="input" style={{ width: 120, padding: '0.35rem 0.625rem', fontSize: '0.78rem', flexShrink: 0 }}>
                                        {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                                    </select>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Role legend */}
                <div className="card" style={{ marginTop: '1.25rem', padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', gap: '2rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {[
                            { role: 'Admin', desc: 'Full access + billing + team management', badge: 'badge-critical' },
                            { role: 'Member', desc: 'Can run scans, view reports, manage assets', badge: 'badge-info' },
                            { role: 'Viewer', desc: 'Read-only access to reports and assets', badge: 'badge-none' },
                        ].map(r => (
                            <div key={r.role} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span className={`badge ${r.badge}`} style={{ fontSize: '0.65rem' }}>{r.role}</span>
                                <span>{r.desc}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
