import { useState, useEffect } from 'react';
import { listApiKeys, createApiKey, revokeApiKey, listWebhooks, createWebhook, deleteWebhook, getGitHubStatus, setGitHubToken, deleteGitHubToken } from '../api';
import api from '../api';

const TABS = [
    { id: 'mfa', label: 'MFA', icon: '🔐' },
    { id: 'apikeys', label: 'API Keys', icon: '🔑' },
    { id: 'webhooks', label: 'Webhooks', icon: '🔗' },
    { id: 'github', label: 'GitHub', icon: '🐙' },
    { id: 'danger', label: 'Danger Zone', icon: '⚠️' },
];

export default function Settings() {
    const [tab, setTab] = useState('mfa');
    return (
        <div className="animate-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Settings</h1>
                    <p className="page-subtitle">Security, integrations & account management</p>
                </div>
            </div>
            <div className="page-body">
                <div style={{ display: 'flex', gap: '1.75rem' }}>
                    {/* Sidebar tabs */}
                    <div style={{ width: 200, flexShrink: 0 }}>
                        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {TABS.map(t => (
                                <button key={t.id} onClick={() => setTab(t.id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.625rem',
                                        padding: '0.65rem 0.875rem', borderRadius: 'var(--radius-md)',
                                        color: tab === t.id ? 'var(--brand-violet-light)' : 'var(--text-secondary)',
                                        background: tab === t.id ? 'rgba(124,58,237,0.12)' : 'transparent',
                                        border: `1px solid ${tab === t.id ? 'rgba(124,58,237,0.25)' : 'transparent'}`,
                                        cursor: 'pointer', textAlign: 'left', fontSize: '0.85rem',
                                        fontWeight: tab === t.id ? 600 : 400,
                                        transition: 'all 0.15s',
                                    }}>
                                    <span>{t.icon}</span>
                                    <span>{t.label}</span>
                                    {t.id === 'danger' && <span className="badge badge-critical" style={{ fontSize: '0.6rem', marginLeft: 'auto' }}>!</span>}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }} className="animate-in">
                        {tab === 'mfa' && <MFASection />}
                        {tab === 'apikeys' && <ApiKeysSection />}
                        {tab === 'webhooks' && <WebhooksSection />}
                        {tab === 'github' && <GitHubSection />}
                        {tab === 'danger' && <DangerSection />}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── MFA Section ───────────────────────────────────
function MFASection() {
    const [setup, setSetup] = useState(null);
    const [code, setCode] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [mfaEnabled, setMfaEnabled] = useState(false);

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
            setMfaEnabled(true);
            setSetup(null);
            setCode('');
        } catch (err) {
            setStatus(err.response?.data?.detail || 'Invalid code');
        }
    };

    return (
        <div>
            <div className="settings-section">
                <div className="settings-section-header">
                    <span>🔐</span>
                    <span className="settings-section-title">Multi-Factor Authentication</span>
                    <span className={`badge ${mfaEnabled ? 'badge-success' : 'badge-none'}`} style={{ marginLeft: 'auto', fontSize: '0.65rem' }}>
                        {mfaEnabled ? '✓ Enabled' : 'Disabled'}
                    </span>
                </div>
                <div className="settings-section-body">
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                        Add TOTP-based two-factor authentication using Google Authenticator, Authy, or any compatible app.
                        Even if your password is compromised, your account stays protected.
                    </p>

                    {!setup ? (
                        <button className="btn-primary" onClick={handleSetup} disabled={loading || mfaEnabled}>
                            {loading ? <><span className="spinner spinner-sm" /> Setting up...</> : '🔐 Enable MFA'}
                        </button>
                    ) : (
                        <div className="animate-in">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div>
                                    <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                                        Step 1 — Scan QR Code
                                    </p>
                                    {setup.qr_code && (
                                        <img src={`data:image/png;base64,${setup.qr_code}`} alt="QR Code"
                                            style={{ width: 180, borderRadius: 12, border: '1px solid var(--border-bright)', padding: 8, background: 'white' }} />
                                    )}
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                                        Step 2 — Verify Code
                                    </p>
                                    <input className="input" placeholder="6-digit code"
                                        value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        style={{ letterSpacing: '0.3em', fontFamily: 'Fira Code, monospace', textAlign: 'center', marginBottom: '0.75rem' }} />
                                    <button className="btn-primary" onClick={handleVerify} disabled={code.length !== 6}>
                                        Verify & Activate
                                    </button>

                                    {(setup.backup_codes || []).length > 0 && (
                                        <div style={{ marginTop: '1.25rem' }}>
                                            <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--brand-yellow)', marginBottom: '0.5rem' }}>
                                                ⚠️ Save backup codes (shown only once!)
                                            </p>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}>
                                                {setup.backup_codes.map((c, i) => (
                                                    <code key={i} style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem', background: 'var(--bg-primary)', borderRadius: 4, fontFamily: 'Fira Code, monospace' }}>{c}</code>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    {status && (
                        <div className={`alert ${status.includes('✅') ? 'alert-success' : 'alert-info'}`} style={{ marginTop: '1rem' }}>
                            {status}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── API Keys Section ──────────────────────────────
function ApiKeysSection() {
    const [keys, setKeys] = useState([]);
    const [name, setName] = useState('');
    const [newKey, setNewKey] = useState('');
    const [copied, setCopied] = useState(false);

    const load = () => listApiKeys().then(r => setKeys(r.data)).catch(() => { });
    useEffect(() => { load(); }, []);

    const handleCreate = async () => {
        if (!name) return;
        try {
            const res = await createApiKey(name);
            setNewKey(res.data.key);
            setName('');
            load();
        } catch { }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(newKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div>
            <div className="settings-section">
                <div className="settings-section-header">
                    <span>🔑</span>
                    <span className="settings-section-title">API Keys</span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{keys.length} key{keys.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="settings-section-body">
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                        Create API keys for programmatic access to SageAI. Keys are scoped to your organization and can be revoked at any time.
                    </p>

                    {/* Create row */}
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        <input className="input" placeholder="Key name — e.g. CI Pipeline, Staging Monitor"
                            value={name} onChange={e => setName(e.target.value)} style={{ flex: 1 }} />
                        <button className="btn-primary" onClick={handleCreate} disabled={!name}>+ Create Key</button>
                    </div>

                    {/* New key reveal */}
                    {newKey && (
                        <div className="animate-in" style={{ padding: '1rem', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--brand-green)' }}>✅ Key created — copy it now, it won't be shown again</span>
                                <button className="btn-secondary" onClick={handleCopy} style={{ fontSize: '0.72rem', padding: '0.25rem 0.625rem' }}>
                                    {copied ? '✓ Copied!' : 'Copy'}
                                </button>
                            </div>
                            <code style={{ fontSize: '0.75rem', wordBreak: 'break-all', display: 'block', padding: '0.5rem 0.75rem', background: 'var(--bg-void)', borderRadius: 6, fontFamily: 'Fira Code, monospace', color: 'var(--brand-cyan-light)' }}>
                                {newKey}
                            </code>
                        </div>
                    )}

                    {/* Table */}
                    <div className="table-container">
                        <table>
                            <thead><tr><th>Name</th><th>Created</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
                            <tbody>
                                {keys.length === 0 ? (
                                    <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No API keys yet</td></tr>
                                ) : keys.map(k => (
                                    <tr key={k.id}>
                                        <td style={{ fontWeight: 600 }}>{k.name}</td>
                                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(k.created_at).toLocaleDateString()}</td>
                                        <td><span className={`badge ${k.is_active ? 'badge-success' : 'badge-none'}`}>{k.is_active ? '● Active' : 'Revoked'}</span></td>
                                        <td style={{ textAlign: 'right' }}>
                                            {k.is_active && (
                                                <button className="btn-danger" style={{ fontSize: '0.72rem', padding: '0.25rem 0.625rem' }}
                                                    onClick={() => revokeApiKey(k.id).then(load)}>Revoke</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Webhooks Section ──────────────────────────────
const WEBHOOK_EVENTS = [
    'scan.completed', 'scan.failed', 'scan.critical_finding',
    'user.invited', 'asset.discovered', 'report.generated',
];

function WebhooksSection() {
    const [hooks, setHooks] = useState([]);
    const [url, setUrl] = useState('');
    const [event, setEvent] = useState('scan.completed');

    const load = () => listWebhooks().then(r => setHooks(r.data)).catch(() => { });
    useEffect(() => { load(); }, []);

    const handleCreate = async () => {
        if (!url) return;
        await createWebhook(url, event);
        setUrl('');
        load();
    };

    return (
        <div>
            <div className="settings-section">
                <div className="settings-section-header">
                    <span>🔗</span>
                    <span className="settings-section-title">Webhooks</span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{hooks.length} endpoint{hooks.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="settings-section-body">
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                        Push real-time events to your systems — Slack, PagerDuty, Jira, or any HTTP endpoint.
                    </p>

                    <div style={{ display: 'flex', gap: '0.625rem', marginBottom: '1.25rem' }}>
                        <input className="input" placeholder="https://your-service.com/webhook"
                            value={url} onChange={e => setUrl(e.target.value)} style={{ flex: 1 }} />
                        <select className="input" value={event} onChange={e => setEvent(e.target.value)} style={{ width: 200 }}>
                            {WEBHOOK_EVENTS.map(ev => (
                                <option key={ev} value={ev}>{ev}</option>
                            ))}
                        </select>
                        <button className="btn-primary" onClick={handleCreate} disabled={!url}>Add</button>
                    </div>

                    <div className="table-container">
                        <table>
                            <thead><tr><th>Endpoint</th><th>Event</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
                            <tbody>
                                {hooks.length === 0 ? (
                                    <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No webhooks configured</td></tr>
                                ) : hooks.map(h => (
                                    <tr key={h.id}>
                                        <td style={{ fontFamily: 'Fira Code, monospace', fontSize: '0.75rem' }}>{h.url}</td>
                                        <td><span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{h.event}</span></td>
                                        <td><span className={`badge ${h.is_active ? 'badge-success' : 'badge-none'}`}>{h.is_active ? '● Active' : 'Disabled'}</span></td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button className="btn-danger" style={{ fontSize: '0.72rem', padding: '0.25rem 0.625rem' }}
                                                onClick={() => deleteWebhook(h.id).then(load)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── GitHub Section ────────────────────────────────
function GitHubSection() {
    const [connected, setConnected] = useState(false);
    const [token, setToken] = useState('');
    const [showToken, setShowToken] = useState(false);
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getGitHubStatus().then(r => {
            setConnected(r.data.has_github_token);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const handleConnect = async () => {
        if (!token) return;
        setLoading(true);
        try {
            await setGitHubToken(token);
            setConnected(true); setToken('');
            setStatus('✅ GitHub token securely stored!');
        } catch (err) {
            setStatus(err.response?.data?.detail || 'Failed to save token');
        } finally { setLoading(false); }
    };

    const handleDisconnect = async () => {
        setLoading(true);
        try {
            await deleteGitHubToken();
            setConnected(false);
            setStatus('GitHub disconnected.');
        } catch (err) {
            setStatus(err.response?.data?.detail || 'Failed to remove token');
        } finally { setLoading(false); }
    };

    return (
        <div>
            <div className="settings-section">
                <div className="settings-section-header">
                    <span>🐙</span>
                    <span className="settings-section-title">GitHub Integration</span>
                    <span className={`badge ${connected ? 'badge-success' : 'badge-none'}`} style={{ marginLeft: 'auto', fontSize: '0.65rem' }}>
                        {loading ? '...' : connected ? '✓ Connected' : 'Not Connected'}
                    </span>
                </div>
                <div className="settings-section-body">
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                        Connect GitHub to enable Self-Healing Code: SageAI automatically opens PRs with secure patches for detected vulnerabilities.
                        Requires a Personal Access Token with <code style={{ background: 'var(--bg-hover)', padding: '1px 6px', borderRadius: 4, fontSize: '0.75rem' }}>repo</code> scope.
                    </p>

                    {loading ? (
                        <div className="spinner" />
                    ) : connected ? (
                        <div className="animate-in">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                                <span style={{ fontSize: '1.5rem' }}>✅</span>
                                <div>
                                    <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.2rem' }}>GitHub Connected</p>
                                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Your token is encrypted and stored securely. Auto-Fix PRs are enabled.</p>
                                </div>
                            </div>
                            <button className="btn-danger" onClick={handleDisconnect} disabled={loading}>Disconnect GitHub</button>
                        </div>
                    ) : (
                        <div className="animate-in">
                            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                                <label>Personal Access Token</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <input className="input" type={showToken ? 'text' : 'password'}
                                            placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                            value={token} onChange={e => setToken(e.target.value)}
                                            style={{ paddingRight: '2.5rem', fontFamily: 'Fira Code, monospace', fontSize: '0.8rem' }} />
                                        <button onClick={() => setShowToken(!showToken)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                            {showToken ? '🙈' : '👁'}
                                        </button>
                                    </div>
                                    <button className="btn-primary" onClick={handleConnect} disabled={!token || loading}>Connect</button>
                                </div>
                            </div>
                            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                💡 Generate at{' '}
                                <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="link">
                                    github.com/settings/tokens
                                </a>
                                {' '}→ New token (classic) → check <code style={{ background: 'var(--bg-hover)', padding: '1px 5px', borderRadius: 4, fontSize: '0.68rem' }}>repo</code> scope
                            </p>
                        </div>
                    )}

                    {status && (
                        <div className={`alert ${status.includes('✅') ? 'alert-success' : 'alert-info'}`} style={{ marginTop: '1rem' }}>
                            {status}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Danger Zone ────────────────────────────────────
function DangerSection() {
    const [confirm, setConfirm] = useState('');
    return (
        <div>
            <div className="settings-section" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
                <div className="settings-section-header" style={{ background: 'rgba(239,68,68,0.06)', borderBottomColor: 'rgba(239,68,68,0.2)' }}>
                    <span>⚠️</span>
                    <span className="settings-section-title" style={{ color: '#fca5a5' }}>Danger Zone</span>
                </div>
                <div className="settings-section-body">
                    <div className="settings-row">
                        <div>
                            <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.2rem' }}>Delete All Scan History</p>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Permanently removes all scan results and reports. Cannot be undone.</p>
                        </div>
                        <button className="btn-danger" style={{ flexShrink: 0 }}>Delete History</button>
                    </div>
                    <div className="settings-row">
                        <div>
                            <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.2rem' }}>Delete Organization</p>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Permanently deletes your org, all users, scans, and data. Irreversible.</p>
                        </div>
                        <button className="btn-danger" style={{ flexShrink: 0 }}>Delete Org</button>
                    </div>
                    <div style={{ marginTop: '1rem', padding: '0.875rem', background: 'rgba(239,68,68,0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239,68,68,0.15)' }}>
                        <p style={{ fontSize: '0.78rem', color: '#fca5a5', lineHeight: 1.5 }}>
                            🔒 Destructive actions require contacting{' '}
                            <a href="mailto:support@sageai.io" className="link">support@sageai.io</a>{' '}
                            with your organization ID. This prevents accidental data loss.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
