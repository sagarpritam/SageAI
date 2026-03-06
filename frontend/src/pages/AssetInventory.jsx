import { useState, useEffect, useRef } from 'react';
import api from '../api';

const ASSET_TYPE_COLORS = {
    domain: 'var(--brand-violet-light)',
    subdomain: 'var(--brand-cyan)',
    ip: 'var(--brand-blue-light)',
    server: 'var(--brand-orange)',
    api: 'var(--brand-green)',
    cloud_resource: 'var(--brand-yellow)',
};

const ASSET_TYPE_ICONS = {
    domain: '◉', subdomain: '◎', ip: '◈', server: '▣', api: '⊞', cloud_resource: '☁',
};

function AssetCard({ asset }) {
    const typeColor = ASSET_TYPE_COLORS[asset.asset_type] || 'var(--text-secondary)';
    const riskClass = `badge-${asset.risk_level?.toLowerCase()}`;
    return (
        <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem',
            transition: 'all 0.2s', cursor: 'default',
            display: 'flex', flexDirection: 'column', gap: '0.5rem',
        }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = typeColor; e.currentTarget.style.boxShadow = `0 0 20px ${typeColor}22`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                        <span style={{ color: typeColor, fontSize: '0.9rem' }}>{ASSET_TYPE_ICONS[asset.asset_type] || '◎'}</span>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: typeColor }}>
                            {asset.asset_type}
                        </span>
                    </div>
                    <div className="mono" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                        {asset.value}
                    </div>
                </div>
                <span className={`badge ${riskClass}`}>{asset.risk_level}</span>
            </div>

            {asset.ip_address && (
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    IP: <span className="mono" style={{ color: 'var(--text-secondary)' }}>{asset.ip_address}</span>
                </div>
            )}

            {asset.technologies?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {asset.technologies.slice(0, 4).map((tech, i) => (
                        <span key={i} style={{
                            fontSize: '0.62rem', padding: '2px 7px', borderRadius: '999px',
                            background: 'var(--bg-hover)', border: '1px solid var(--border-bright)',
                            color: 'var(--text-secondary)',
                        }}>{tech}</span>
                    ))}
                </div>
            )}

            {asset.open_ports?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {asset.open_ports.slice(0, 6).map(p => (
                        <span key={p} style={{
                            fontSize: '0.62rem', padding: '2px 7px', borderRadius: '999px',
                            background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
                            color: 'var(--brand-violet-light)',
                        }}>:{p}</span>
                    ))}
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                <span>First seen: {asset.first_seen ? new Date(asset.first_seen).toLocaleDateString() : '—'}</span>
                <span style={{
                    padding: '2px 8px', borderRadius: '999px',
                    background: asset.status === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.15)',
                    color: asset.status === 'active' ? '#6ee7b7' : 'var(--text-muted)',
                    border: `1px solid ${asset.status === 'active' ? 'rgba(16,185,129,0.2)' : 'var(--border-color)'}`,
                }}>
                    {asset.status}
                </span>
            </div>
        </div>
    );
}

export default function AssetInventory() {
    const [summary, setSummary] = useState(null);
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [discovering, setDiscovering] = useState(false);
    const [target, setTarget] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [filterRisk, setFilterRisk] = useState('');
    const [filterType, setFilterType] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchAll = async () => {
        try {
            const [sumRes, assetsRes] = await Promise.all([
                api.get('/assets/summary'),
                api.get('/assets'),
            ]);
            setSummary(sumRes.data);
            setAssets(assetsRes.data);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { fetchAll(); }, []);

    const handleDiscover = async (e) => {
        e.preventDefault();
        if (!target) return;
        setDiscovering(true);
        setError('');
        setSuccess('');
        try {
            await api.post('/assets/discover/sync', { target: target.replace(/https?:\/\//, '').split('/')[0] });
            setSuccess(`✅ Discovery complete for ${target}. Assets updated!`);
            setTarget('');
            await fetchAll();
        } catch (err) {
            setError(err.response?.data?.detail || 'Discovery failed');
        } finally { setDiscovering(false); }
    };

    const filteredAssets = assets.filter(a => {
        if (activeTab === 'high-risk') return ['Critical', 'High'].includes(a.risk_level);
        if (activeTab === 'new') {
            const h48 = new Date(Date.now() - 48 * 3600 * 1000);
            return a.first_seen && new Date(a.first_seen) > h48;
        }
        if (activeTab === 'stale') return a.status === 'stale';
        if (filterRisk && a.risk_level !== filterRisk) return false;
        if (filterType && a.asset_type !== filterType) return false;
        return true;
    });

    const STATS = summary ? [
        { label: 'Total Assets', value: summary.total, color: 'var(--brand-violet-light)', icon: '◉' },
        { label: 'Domains', value: summary.domains + summary.subdomains, color: 'var(--brand-cyan)', icon: '◎' },
        { label: 'Servers / IPs', value: summary.ips + summary.servers, color: 'var(--brand-blue-light)', icon: '▣' },
        { label: 'High Risk', value: summary.high_risk, color: 'var(--brand-red)', icon: '⚠' },
        { label: 'New (24h)', value: summary.new_last_24h, color: 'var(--brand-green)', icon: '✦' },
        { label: 'Stale', value: summary.stale, color: 'var(--text-muted)', icon: '◷' },
    ] : [];

    return (
        <div className="animate-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Asset Inventory</h1>
                    <p className="page-subtitle">Discover and monitor your external attack surface</p>
                </div>
                <span className="badge badge-violet">◉ ASM Engine</span>
            </div>

            <div className="page-body">
                {/* Discovery Form */}
                <div className="card glow" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(124,58,237,0.06), rgba(6,182,212,0.04))' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '1rem' }}>◉</span>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Discover Attack Surface</span>
                        <span className="badge badge-violet" style={{ marginLeft: 'auto', fontSize: '0.62rem' }}>
                            crt.sh · DNS · Shodan · Port scan
                        </span>
                    </div>
                    <form onSubmit={handleDiscover} style={{ display: 'flex', gap: '0.75rem' }}>
                        <input
                            className="input"
                            placeholder="example.com"
                            value={target}
                            onChange={e => setTarget(e.target.value)}
                            style={{ flex: 1, fontFamily: 'Fira Code, monospace', fontSize: '0.85rem' }}
                        />
                        <button className="btn-primary" disabled={discovering || !target}>
                            {discovering
                                ? <><span className="spinner spinner-sm" /> Scanning...</>
                                : '◉ Discover Assets'}
                        </button>
                    </form>
                    {error && <div className="alert alert-error" style={{ marginTop: '0.75rem' }}>⚠️ {error}</div>}
                    {success && <div className="alert alert-success" style={{ marginTop: '0.75rem' }}>{success}</div>}
                    <div style={{ marginTop: '0.75rem', fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                        Pipeline: Domain → Subdomain enumeration → IP resolution → Port scan → HTTP probing → Risk scoring → AI insights
                    </div>
                </div>

                {/* Summary Stats */}
                {summary && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.875rem', marginBottom: '1.5rem' }}>
                        {STATS.map(({ label, value, color, icon }) => (
                            <div className="stat-card" key={label} style={{ padding: '1rem 1.25rem' }}>
                                <div className="stat-icon">{icon}</div>
                                <span className="stat-label">{label}</span>
                                <span className="stat-value" style={{ color, fontSize: '1.75rem' }}>{value}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Tabs */}
                <div className="tabs">
                    {[
                        { id: 'all', label: `All Assets (${assets.length})` },
                        { id: 'high-risk', label: `⚠ High Risk (${summary?.high_risk || 0})` },
                        { id: 'new', label: `✦ New (${summary?.new_last_24h || 0})` },
                        { id: 'stale', label: `◷ Stale (${summary?.stale || 0})` },
                    ].map(t => (
                        <button key={t.id} className={`tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
                            {t.label}
                        </button>
                    ))}
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center', paddingBottom: '0.5rem' }}>
                        <select className="input" style={{ width: 'auto', fontSize: '0.78rem', padding: '0.3rem 2rem 0.3rem 0.65rem', height: 32 }} value={filterRisk} onChange={e => setFilterRisk(e.target.value)}>
                            <option value="">All Risks</option>
                            {['Critical', 'High', 'Medium', 'Low'].map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <select className="input" style={{ width: 'auto', fontSize: '0.78rem', padding: '0.3rem 2rem 0.3rem 0.65rem', height: 32 }} value={filterType} onChange={e => setFilterType(e.target.value)}>
                            <option value="">All Types</option>
                            {['domain', 'subdomain', 'ip', 'server', 'api', 'cloud_resource'].map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>

                {/* Asset Grid */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                        <div className="spinner spinner-lg" style={{ margin: '0 auto 1rem' }} />
                        <div>Loading asset inventory...</div>
                    </div>
                ) : filteredAssets.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>◉</div>
                        <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                            No assets discovered yet
                        </p>
                        <p>Enter a domain above and click <strong>Discover Assets</strong> to map your attack surface.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.875rem' }}>
                        {filteredAssets.map(a => <AssetCard key={a.id} asset={a} />)}
                    </div>
                )}
            </div>
        </div>
    );
}
