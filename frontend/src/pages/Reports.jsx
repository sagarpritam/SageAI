import { useState, useEffect } from 'react';
import { listScans, downloadPdf, getReport, downloadHackerOne } from '../api';

const RISK_COLORS = { Critical: '#ef4444', High: '#f97316', Medium: '#f59e0b', Low: '#10b981', Info: '#3b82f6' };
const RISK_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3, Info: 4 };

function severitySort(findings) {
    return [...(findings || [])].sort((a, b) =>
        (RISK_ORDER[a.severity] ?? 9) - (RISK_ORDER[b.severity] ?? 9)
    );
}

function HackerOneReport(scan, report) {
    const findings = report?.findings || [];
    const critical = findings.filter(f => f.severity === 'Critical');
    const high = findings.filter(f => f.severity === 'High');

    return `# Bug Bounty Report — ${scan.target}

**Platform:** SageAI 2.0 Automated Security Platform
**Severity:** ${scan.risk_level}
**Risk Score:** ${scan.risk_score}/100
**Date:** ${new Date(scan.created_at || Date.now()).toISOString().split('T')[0]}

---

## Summary
Automated penetration testing scan of \`${scan.target}\` identified **${findings.length} security findings**,
including ${critical.length} critical and ${high.length} high severity issues.

## Impact
${scan.risk_level === 'Critical'
            ? '**Critical:** Immediate breach risk. Attackers can exploit these vulnerabilities to gain unauthorized access, exfiltrate data, or achieve remote code execution.'
            : scan.risk_level === 'High'
                ? '**High:** Significant security risk requiring urgent remediation within 24-48 hours.'
                : '**Medium/Low:** Security issues requiring timely remediation per your security policy.'}

## Technical Details

${findings.slice(0, 10).map((f, i) => `### Finding ${i + 1}: ${f.type}
- **Severity:** ${f.severity}
- **Evidence:** ${f.evidence || 'See scan results'}
- **Tool:** ${f.source || 'SageAI Scanner'}
`).join('\n')}

## Steps to Reproduce
1. Navigate to \`${scan.target}\`
2. Execute the identified attack vector
3. Observe the vulnerability behavior as documented above

## Remediation
- Patch all Critical findings within 24 hours
- Patch High findings within 72 hours  
- Address Medium/Low per your vulnerability management policy
- Re-scan after patching to verify remediation

## References
- Scan ID: \`${scan.id}\`
- Generated: ${new Date().toISOString()}
- Tool: SageAI 2.0 (https://sageai.io)
`;
}

export default function Reports() {
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [report, setReport] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);
    const [downloading, setDownloading] = useState('');
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('findings');

    useEffect(() => {
        listScans()
            .then(r => setScans(r.data.filter(s => s.status === 'completed')))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const handleViewReport = async (scanId) => {
        setReportLoading(true);
        setReport(null);
        try {
            const res = await getReport(scanId);
            setReport(res.data);
            setActiveTab('findings');
        } catch {
            setReport({ error: true });
        } finally { setReportLoading(false); }
    };

    const handleDownloadPdf = async (scanId) => {
        setDownloading(scanId + '-pdf');
        try {
            const res = await downloadPdf(scanId);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a'); a.href = url;
            a.download = `SageAI_Report_${scanId.slice(0, 8)}.pdf`;
            a.click(); window.URL.revokeObjectURL(url);
        } catch { }
        setDownloading('');
    };

    const handleHackerOne = async (scan) => {
        setDownloading(scan.id + '-h1');
        try {
            const res = await downloadHackerOne(scan.id);
            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/markdown' }));
            const a = document.createElement('a'); a.href = url;
            a.download = `hackerone_${scan.target.replace(/[^a-z0-9]/gi, '_').slice(0, 20)}.md`;
            a.click(); window.URL.revokeObjectURL(url);
        } catch {
            // Fallback: client-side if API unavailable
            alert('Could not generate report from server. Try again.');
        }
        setDownloading('');
    };

    const filtered = scans.filter(s => {
        const matchFilter = filter === 'all' || s.risk_level?.toLowerCase() === filter;
        const matchSearch = !search || s.target.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    return (
        <div className="animate-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Reports</h1>
                    <p className="page-subtitle">Security assessment reports, PDF export & bug bounty submissions</p>
                </div>
                <span className="badge badge-violet">⊟ {scans.length} report{scans.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="page-body">
                <div style={{ display: 'grid', gridTemplateColumns: report ? '420px 1fr' : '1fr', gap: '1.25rem', alignItems: 'start' }}>

                    {/* ── Left: Report List ─────────────────────── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                        {/* Search + filter */}
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <input className="input" placeholder="Search targets..."
                                value={search} onChange={e => setSearch(e.target.value)}
                                style={{ flex: 1, minWidth: 160 }} />
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                                {['all', 'critical', 'high', 'medium', 'low'].map(f => (
                                    <button key={f} onClick={() => setFilter(f)}
                                        style={{
                                            padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-md)',
                                            border: '1px solid', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                                            textTransform: 'capitalize', transition: 'all 0.15s',
                                            borderColor: filter === f ? (RISK_COLORS[f.charAt(0).toUpperCase() + f.slice(1)] || 'var(--brand-violet)') : 'var(--border-color)',
                                            background: filter === f ? (RISK_COLORS[f.charAt(0).toUpperCase() + f.slice(1)] || 'var(--brand-violet)') + '20' : 'transparent',
                                            color: filter === f ? (RISK_COLORS[f.charAt(0).toUpperCase() + f.slice(1)] || 'var(--brand-violet-light)') : 'var(--text-muted)',
                                        }}>
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Cards */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                            {loading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                                    <div className="spinner spinner-lg" />
                                </div>
                            ) : filtered.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⊟</div>
                                    <p>{scans.length === 0 ? 'No completed scans yet. Run a scan first.' : 'No reports match your filter.'}</p>
                                </div>
                            ) : filtered.map(s => {
                                const isActive = report?.scan_id === s.id;
                                const rl = s.risk_level?.toLowerCase() || 'info';
                                return (
                                    <div key={s.id} style={{
                                        padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)',
                                        border: `1px solid ${isActive ? RISK_COLORS[s.risk_level] + '50' : 'var(--border-color)'}`,
                                        background: isActive ? RISK_COLORS[s.risk_level] + '08' : 'var(--bg-card)',
                                        cursor: 'pointer', transition: 'all 0.2s',
                                    }}
                                        onClick={() => handleViewReport(s.id)}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.625rem' }}>
                                            <div className="mono" style={{ fontSize: '0.8rem', color: 'var(--brand-cyan-light)', fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '0.5rem' }}>
                                                {s.target.replace(/https?:\/\//, '')}
                                            </div>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                                                {s.created_at ? new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span className={`badge badge-${rl}`}>
                                                    <span className={`risk-dot risk-dot-${rl}`} />
                                                    {s.risk_level}
                                                </span>
                                                <span style={{ fontWeight: 700, color: RISK_COLORS[s.risk_level] || 'var(--text-primary)', fontSize: '0.85rem' }}>
                                                    {s.risk_score}
                                                </span>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>/100</span>
                                            </div>

                                            {/* Actions on hover/active */}
                                            <div style={{ display: 'flex', gap: '0.35rem' }} onClick={e => e.stopPropagation()}>
                                                <button className="btn-secondary" style={{ padding: '0.3rem 0.625rem', fontSize: '0.68rem' }}
                                                    onClick={() => handleDownloadPdf(s.id)} disabled={downloading === s.id + '-pdf'}>
                                                    {downloading === s.id + '-pdf' ? <span className="spinner spinner-sm" /> : '⬇ PDF'}
                                                </button>
                                                <button className="btn-secondary"
                                                    style={{ padding: '0.3rem 0.625rem', fontSize: '0.68rem', borderColor: 'rgba(124,58,237,0.3)', color: 'var(--brand-violet-light)' }}
                                                    onClick={() => handleHackerOne(s)}>
                                                    🐛 H1
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Right: Report Detail ───────────────────── */}
                    {(report || reportLoading) && (
                        <div className="animate-slide">
                            {reportLoading ? (
                                <div className="card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                                    <div className="spinner spinner-lg" />
                                </div>
                            ) : report?.error ? (
                                <div className="card">
                                    <div className="alert alert-error">Failed to load report. Try again.</div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {/* Header */}
                                    <div className="card" style={{ borderColor: RISK_COLORS[report.summary?.risk_level] + '40' || 'var(--border-color)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <div>
                                                <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--brand-cyan-light)', marginBottom: '0.25rem' }}>
                                                    {report.target}
                                                </div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                    Report #{report.report_id?.slice(0, 8)} · {new Date(report.generated_at).toLocaleString()}
                                                </div>
                                            </div>
                                            <button onClick={() => setReport(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.2rem', lineHeight: 1 }}>×</button>
                                        </div>

                                        {/* Stats row */}
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.625rem' }}>
                                            {[
                                                { label: 'Risk Score', value: report.summary?.risk_score, color: RISK_COLORS[report.summary?.risk_level] },
                                                { label: 'Risk Level', badge: report.summary?.risk_level },
                                                { label: 'Findings', value: report.summary?.total_findings },
                                                { label: 'Critical', value: report.findings?.filter(f => f.severity === 'Critical').length || 0, color: '#ef4444' },
                                            ].map(({ label, value, color, badge }) => (
                                                <div key={label} className="stat-card" style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                    <span className="stat-label">{label}</span>
                                                    {badge
                                                        ? <span className={`badge badge-${badge.toLowerCase()}`} style={{ marginTop: 4 }}>{badge}</span>
                                                        : <span className="stat-value" style={{ fontSize: '1.4rem', color: color || 'var(--text-primary)' }}>{value ?? '—'}</span>
                                                    }
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Tabs */}
                                    <div className="tabs" style={{ marginBottom: 0 }}>
                                        {[
                                            { id: 'findings', label: `Findings (${report.findings?.length || 0})` },
                                            { id: 'executive', label: 'Executive Summary' },
                                            { id: 'remediation', label: 'Remediation' },
                                        ].map(t => (
                                            <button key={t.id} className={`tab ${activeTab === t.id ? 'active' : ''}`}
                                                onClick={() => setActiveTab(t.id)}>
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Tab content */}
                                    {activeTab === 'findings' && (
                                        <div className="card animate-in" style={{ padding: 0, overflow: 'hidden' }}>
                                            {severitySort(report.findings).length === 0 ? (
                                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                    No findings recorded.
                                                </div>
                                            ) : severitySort(report.findings).map((f, i) => (
                                                <div key={i} style={{
                                                    padding: '0.75rem 1.25rem',
                                                    borderBottom: i < report.findings.length - 1 ? '1px solid var(--border-color)' : 'none',
                                                    borderLeft: `3px solid ${RISK_COLORS[f.severity] || 'var(--border-color)'}`,
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                        <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{f.type}</span>
                                                        <span className={`badge badge-${f.severity?.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>{f.severity}</span>
                                                    </div>
                                                    {f.evidence && (
                                                        <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {f.evidence}
                                                        </div>
                                                    )}
                                                    {f.source && (
                                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>
                                                            via {f.source}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {activeTab === 'executive' && (
                                        <div className="card animate-in">
                                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                                                {report.executive_summary || 'Executive summary not available for this scan.'}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'remediation' && (
                                        <div className="card animate-in">
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                {['Critical', 'High', 'Medium', 'Low'].map(sev => {
                                                    const items = report.findings?.filter(f => f.severity === sev) || [];
                                                    if (items.length === 0) return null;
                                                    return (
                                                        <div key={sev}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                                <span className={`badge badge-${sev.toLowerCase()}`}>{sev}</span>
                                                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{items.length} issue{items.length !== 1 ? 's' : ''}</span>
                                                            </div>
                                                            {items.map((f, i) => (
                                                                <div key={i} style={{ padding: '0.5rem 0.75rem', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)', marginBottom: '0.375rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                                                    <strong style={{ color: 'var(--text-primary)' }}>{f.type}</strong>
                                                                    {f.evidence && <span> — {f.evidence.slice(0, 80)}</span>}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Export actions */}
                                    <div style={{ display: 'flex', gap: '0.625rem' }}>
                                        <button className="btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.82rem' }}
                                            onClick={() => handleDownloadPdf(report.scan_id)}>
                                            ⬇ Download PDF Report
                                        </button>
                                        <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.82rem', borderColor: 'rgba(124,58,237,0.3)', color: 'var(--brand-violet-light)' }}
                                            onClick={() => handleHackerOne(scans.find(s => s.id === report.scan_id) || {})}>
                                            🐛 Export HackerOne Format
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
