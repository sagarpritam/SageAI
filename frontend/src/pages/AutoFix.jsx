import { useState, useEffect } from 'react';
import { getAutoFixStatus, runAutoFix, getGitHubStatus } from '../api';

export default function AutoFix() {
    const [ready, setReady] = useState(false);
    const [readyMsg, setReadyMsg] = useState('');
    const [repo, setRepo] = useState('');
    const [branch, setBranch] = useState('main');
    const [maxFixes, setMaxFixes] = useState(5);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        getAutoFixStatus().then(r => {
            setReady(r.data.ready);
            setReadyMsg(r.data.message);
        }).catch(() => setReadyMsg('Failed to check status.'));
    }, []);

    const handleRun = async () => {
        if (!repo) return;
        setLoading(true);
        setError('');
        setResults(null);
        try {
            const res = await runAutoFix(repo, branch, maxFixes);
            setResults(res.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Auto-fix failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-in">
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                🛡️ Self-Healing Code
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                AI-powered auto-fix: Scan repos for vulnerabilities and open GitHub PRs with secure patches
            </p>

            {/* Status Banner */}
            <div className="card" style={{
                marginBottom: '1.5rem',
                borderLeft: `3px solid ${ready ? 'var(--brand-green)' : 'var(--brand-yellow, #f59e0b)'}`,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{ready ? '✅' : '⚠️'}</span>
                    <div>
                        <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                            {ready ? 'Ready to Auto-Fix' : 'Setup Required'}
                        </p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{readyMsg}</p>
                    </div>
                </div>
            </div>

            {/* Scan Form */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>🚀 Run Auto-Fix Pipeline</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '0.75rem', alignItems: 'end', marginBottom: '1rem' }}>
                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                            Repository (owner/repo)
                        </label>
                        <input
                            className="input"
                            placeholder="e.g. sagarpritam/my-app"
                            value={repo}
                            onChange={e => setRepo(e.target.value)}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                            Branch
                        </label>
                        <input
                            className="input"
                            placeholder="main"
                            value={branch}
                            onChange={e => setBranch(e.target.value)}
                            style={{ width: '120px' }}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                            Max Fixes
                        </label>
                        <input
                            className="input"
                            type="number"
                            min="1"
                            max="20"
                            value={maxFixes}
                            onChange={e => setMaxFixes(parseInt(e.target.value))}
                            style={{ width: '80px' }}
                        />
                    </div>
                </div>

                <button
                    className="btn-primary"
                    onClick={handleRun}
                    disabled={!ready || !repo || loading}
                    style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem' }}
                >
                    {loading ? '🔄 Scanning & fixing... (this may take a minute)' : '⚡ Scan & Auto-Fix'}
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="card animate-in" style={{ borderLeft: '3px solid var(--brand-red, #ef4444)', marginBottom: '1.5rem' }}>
                    <p style={{ color: 'var(--brand-red, #ef4444)', fontSize: '0.85rem', fontWeight: 600 }}>❌ {error}</p>
                </div>
            )}

            {/* Results */}
            {results && <ResultsView results={results} />}
        </div>
    );
}

function ResultsView({ results }) {
    const scan = results.scan_results || {};
    const fix = results.fix_results || {};

    return (
        <div className="animate-in">
            {/* Clean repo */}
            {results.status === 'clean' && (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <span style={{ fontSize: '3rem' }}>🎉</span>
                    <h3 style={{ marginTop: '1rem' }}>{results.message}</h3>
                </div>
            )}

            {/* Scan Summary */}
            {results.status === 'completed' && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                        <StatCard label="VULNERABILITIES FOUND" value={scan.total_findings || 0} color="var(--brand-yellow, #f59e0b)" />
                        <StatCard label="FIXED (PRs OPENED)" value={(fix.fixed || []).length} color="var(--brand-green)" />
                        <StatCard label="FAILED" value={(fix.failed || []).length} color="var(--brand-red, #ef4444)" />
                        <StatCard label="BLOCKED BY GUARDRAILS" value={(fix.blocked || []).length} color="var(--text-secondary)" />
                    </div>

                    {/* Summary */}
                    {fix.summary && (
                        <div className="card" style={{ marginBottom: '1.5rem' }}>
                            <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>📊 {fix.summary}</p>
                        </div>
                    )}

                    {/* Pull Requests */}
                    {(fix.fixed || []).length > 0 && (
                        <div className="card" style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--brand-green)' }}>✅ Pull Requests Created</h3>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr><th>File</th><th>Vulnerability</th><th>Lines Changed</th><th>PR</th></tr>
                                    </thead>
                                    <tbody>
                                        {fix.fixed.map((f, i) => (
                                            <tr key={i}>
                                                <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{f.file}</td>
                                                <td><span className="badge badge-medium">{f.vulnerability}</span></td>
                                                <td>{f.lines_changed}</td>
                                                <td>
                                                    <a href={f.pr_url} target="_blank" rel="noopener noreferrer"
                                                        style={{ color: 'var(--brand-blue)', fontSize: '0.8rem', textDecoration: 'none' }}>
                                                        View PR ↗
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Failed */}
                    {(fix.failed || []).length > 0 && (
                        <div className="card" style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--brand-red, #ef4444)' }}>❌ Failed Fixes</h3>
                            {fix.failed.map((f, i) => (
                                <div key={i} style={{ fontSize: '0.8rem', marginBottom: '0.5rem', padding: '0.5rem', background: 'var(--bg-primary)', borderRadius: '6px' }}>
                                    <strong>{f.file}</strong> — {f.vulnerability}: {f.reason}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* SAST Findings */}
                    {(scan.findings || []).length > 0 && (
                        <div className="card">
                            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>🔍 All SAST Findings</h3>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr><th>File</th><th>Line</th><th>Severity</th><th>Issue</th></tr>
                                    </thead>
                                    <tbody>
                                        {scan.findings.map((f, i) => (
                                            <tr key={i}>
                                                <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{f.file}</td>
                                                <td>{f.line}</td>
                                                <td>
                                                    <span className={`badge badge-${f.severity === 'HIGH' ? 'high' : f.severity === 'MEDIUM' ? 'medium' : 'low'}`}>
                                                        {f.severity}
                                                    </span>
                                                </td>
                                                <td style={{ fontSize: '0.8rem' }}>{f.issue_text}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function StatCard({ label, value, color }) {
    return (
        <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {label}
            </p>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color, marginTop: '0.25rem' }}>{value}</p>
        </div>
    );
}
