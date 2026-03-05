import { useState, useEffect } from 'react';
import { getOrgUsers, updateUserRole } from '../api';

export default function Team() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        getOrgUsers()
            .then(r => setUsers(r.data))
            .catch(() => setError('Failed to load team members'))
            .finally(() => setLoading(false));
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        try {
            await updateUserRole(userId, newRole);
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch {
            setError('Failed to update role');
        }
    };

    return (
        <div className="animate-in">
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Team Management</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Manage your organization's team members</p>

            {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--brand-red)', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.8rem' }}>{error}</div>}

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Members ({users.length})</h3>
                </div>

                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
                ) : (
                    <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                        <table>
                            <thead>
                                <tr><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td style={{ fontWeight: 500 }}>{u.email}</td>
                                        <td>
                                            <span className={`badge ${u.role === 'admin' ? 'badge-critical' : 'badge-low'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <select
                                                value={u.role}
                                                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                className="input"
                                                style={{ width: 'auto', padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                                            >
                                                <option value="admin">Admin</option>
                                                <option value="member">Member</option>
                                            </select>
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
