import { useState, useEffect } from 'react';
import { listApiKeys, createApiKey, revokeApiKey, listWebhooks, createWebhook, deleteWebhook } from '../api';
import api from '../api';

export default function Settings() {
    const [tab, setTab] = useState('mfa');

    return (
        <div className="animate-in">
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Settings</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Manage security, API access, and integrations</p>

            {/* Tab Bar */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                {[['mfa', '🔐 MFA'], ['apikeys', '🔑 API Keys'], ['webhooks', '🔗 Webhooks']].map(([key, label]) => (
                    <button key={key} className={tab === key ? 'btn-primary' : 'btn-secondary'}
                        onClick={() => setTab(key)} style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
                        {label}
                    </button>
                ))}
            </div>

            {tab === 'mfa' && <MFASection />}
            {tab === 'apikeys' && <ApiKeysSection />}
            {tab === 'webhooks' && <WebhooksSection />}
        </div>
    );
}

// ── MFA Section ───────────────────────────────────
function MFASection() {
    const [setup, setSetup] = useState(null);
    const [code, setCode] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSetup = async () => {
        setLoading(true);
        try {
            const res = await api.post('/auth/mfa/setup');
            setSetup(res.data);
            setStatus('Scan the QR code with your authenticator app');
        } catch (err) {
            setStatus(err.response?.data?.detail || 'Setup failed');
        } finally { setLoading(false); }
    };

    const handleVerify = async () => {
        try {
            await api.post(`/auth/mfa/verify?code=${code}`);
            setStatus('✅ MFA activated successfully!');
            setSetup(null);
            setCode('');
        } catch (err) {
            setStatus(err.response?.data?.detail || 'Verification failed');
        }
    };

    return (
        <div className="card">
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>🔐 Multi-Factor Authentication</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Add an extra layer of security with TOTP (Google Authenticator, Authy)
            </p>

            {!setup ? (
                <button className="btn-primary" onClick={handleSetup} disabled={loading}>
                    {loading ? 'Setting up...' : '🔐 Enable MFA'}
                </button>
            ) : (
                <div className="animate-in">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>1. Scan QR Code</p>
                            {setup.qr_code && (
                                <img src={`data:image/png;base64,${setup.qr_code}`} alt="QR Code"
                                    style={{ width: '200px', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                            )}
                        </div>
                        <div>
                            <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>2. Enter Code</p>
                            <input className="input" placeholder="6-digit code" value={code}
                                onChange={e => setCode(e.target.value)} style={{ marginBottom: '0.75rem' }} />
                            <button className="btn-primary" onClick={handleVerify} disabled={code.length !== 6}>Verify</button>

                            <div style={{ marginTop: '1.5rem' }}>
                                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Backup Codes (save these!)</p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem', marginTop: '0.5rem' }}>
                                    {(setup.backup_codes || []).map((c, i) => (
                                        <code key={i} style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', background: 'var(--bg-primary)', borderRadius: '4px' }}>{c}</code>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {status && <p style={{ fontSize: '0.8rem', marginTop: '1rem', color: status.includes('✅') ? 'var(--brand-green)' : 'var(--text-secondary)' }}>{status}</p>}
        </div>
    );
}

// ── API Keys Section ──────────────────────────────
function ApiKeysSection() {
    const [keys, setKeys] = useState([]);
    const [name, setName] = useState('');
    const [newKey, setNewKey] = useState('');

    const fetch = () => listApiKeys().then(r => setKeys(r.data)).catch(() => { });
    useEffect(() => { fetch(); }, []);

    const handleCreate = async () => {
        if (!name) return;
        try {
            const res = await createApiKey(name);
            setNewKey(res.data.key);
            setName('');
            fetch();
        } catch { }
    };

    const handleRevoke = async (id) => {
        await revokeApiKey(id);
        fetch();
    };

    return (
        <div className="card">
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>🔑 API Keys</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Create keys for programmatic access to the SageAI API
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <input className="input" placeholder="Key name (e.g. CI Pipeline)" value={name}
                    onChange={e => setName(e.target.value)} style={{ flex: 1 }} />
                <button className="btn-primary" onClick={handleCreate} disabled={!name}>Create Key</button>
            </div>

            {newKey && (
                <div className="card animate-in" style={{ background: 'var(--bg-primary)', marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--brand-green)' }}>✅ Key created — copy it now (shown only once)</p>
                    <code style={{ fontSize: '0.75rem', wordBreak: 'break-all', display: 'block', marginTop: '0.5rem', padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: '4px' }}>{newKey}</code>
                </div>
            )}

            <div className="table-container">
                <table>
                    <thead><tr><th>Name</th><th>Created</th><th>Status</th><th></th></tr></thead>
                    <tbody>
                        {keys.map(k => (
                            <tr key={k.id}>
                                <td style={{ fontWeight: 600 }}>{k.name}</td>
                                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(k.created_at).toLocaleDateString()}</td>
                                <td><span className={`badge badge-${k.is_active ? 'low' : 'critical'}`}>{k.is_active ? 'Active' : 'Revoked'}</span></td>
                                <td>{k.is_active && <button className="btn-secondary" style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }} onClick={() => handleRevoke(k.id)}>Revoke</button>}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ── Webhooks Section ──────────────────────────────
function WebhooksSection() {
    const [hooks, setHooks] = useState([]);
    const [url, setUrl] = useState('');
    const [event, setEvent] = useState('scan.completed');

    const fetch = () => listWebhooks().then(r => setHooks(r.data)).catch(() => { });
    useEffect(() => { fetch(); }, []);

    const handleCreate = async () => {
        if (!url) return;
        await createWebhook(url, event);
        setUrl('');
        fetch();
    };

    return (
        <div className="card">
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>🔗 Webhooks</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Receive real-time notifications when events occur
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <input className="input" placeholder="https://your-service.com/webhook" value={url}
                    onChange={e => setUrl(e.target.value)} style={{ flex: 1 }} />
                <select className="input" value={event} onChange={e => setEvent(e.target.value)} style={{ width: '180px' }}>
                    <option value="scan.completed">Scan Completed</option>
                    <option value="scan.failed">Scan Failed</option>
                    <option value="user.invited">User Invited</option>
                </select>
                <button className="btn-primary" onClick={handleCreate} disabled={!url}>Add</button>
            </div>

            <div className="table-container">
                <table>
                    <thead><tr><th>URL</th><th>Event</th><th>Status</th><th></th></tr></thead>
                    <tbody>
                        {hooks.map(h => (
                            <tr key={h.id}>
                                <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{h.url}</td>
                                <td><span className="badge badge-info">{h.event}</span></td>
                                <td><span className={`badge badge-${h.is_active ? 'low' : 'critical'}`}>{h.is_active ? 'Active' : 'Disabled'}</span></td>
                                <td><button className="btn-secondary" style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }} onClick={() => { deleteWebhook(h.id); fetch(); }}>Delete</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
