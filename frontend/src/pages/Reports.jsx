import { useState, useEffect } from 'react';
import { listScans, downloadPdf, getReport } from '../api';

export default function Reports() {
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [report, setReport] = useState(null);
    const [downloading, setDownloading] = useState('');

    useEffect(() => {
        listScans()
            .then(r => setScans(r.data.filter(s => s.status === 'completed')))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const handleViewReport = async (scanId) => {
        try {
            const res = await getReport(scanId);
            setReport(res.data);
        } catch { setReport(null); }
    };

    const handleDownloadPdf = async (scanId) => {
        setDownloading(scanId);
        try {
            const res = await downloadPdf(scanId);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = `SageAI_report_${scanId.slice(0, 8)}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch { }
        setDownloading('');
    };

    return (
        <div className="animate-in">
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Reports</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>View and download security reports</p>

            <div style={{ display: 'grid', gridTemplateColumns: report ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
                {/* Report List */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Completed Scans</h3>
                    </div>
                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
                    ) : scans.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', padding: '2rem', textAlign: 'center' }}>No completed scans yet</p>
                    ) : (
                        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                            <table>
                                <thead><tr><th>Target</th><th>Risk</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {scans.map(s => (
                                        <tr key={s.id}>
                                            <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{s.target}</td>
                                            <td><span className={`badge badge-${s.risk_level.toLowerCase()}`}>{s.risk_level}</span></td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button className="btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }} onClick={() => handleViewReport(s.id)}>
                                                        👁 View
                                                    </button>
                                                    <button
                                                        className="btn-primary"
                                                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
                                                        onClick={() => handleDownloadPdf(s.id)}
                                                        disabled={downloading === s.id}
                                                    >
                                                        {downloading === s.id ? '...' : '📥 PDF'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Report Detail */}
                {report && (
                    <div className="card animate-in">
                        <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>📋 Report Details</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                            <div><strong>Report ID:</strong> <span style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.75rem' }}>{report.report_id}</span></div>
                            <div><strong>Target:</strong> <span style={{ color: 'var(--brand-blue-light)' }}>{report.target}</span></div>
                            <div><strong>Generated:</strong> <span style={{ color: 'var(--text-secondary)' }}>{new Date(report.generated_at).toLocaleString()}</span></div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
                            <div className="stat-card">
                                <span className="stat-label">Score</span>
                                <span className="stat-value" style={{ fontSize: '1.5rem', color: report.summary.risk_score >= 40 ? 'var(--brand-red)' : 'var(--brand-green)' }}>
                                    {report.summary.risk_score}
                                </span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">Level</span>
                                <span className={`badge badge-${report.summary.risk_level.toLowerCase()}`}>{report.summary.risk_level}</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">Findings</span>
                                <span className="stat-value" style={{ fontSize: '1.5rem' }}>{report.summary.total_findings}</span>
                            </div>
                        </div>

                        {report.findings.length > 0 && (
                            <div style={{ marginTop: '1rem' }}>
                                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Findings</h4>
                                {report.findings.map((f, i) => (
                                    <div key={i} className="card" style={{ padding: '0.5rem 0.75rem', marginBottom: '0.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{f.type}</span>
                                            <span className={`badge badge-${f.severity.toLowerCase()}`}>{f.severity}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
