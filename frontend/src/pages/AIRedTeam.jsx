import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

export default function AIRedTeam() {
    const [targets, setTargets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newTarget, setNewTarget] = useState({
        name: '',
        model: 'gpt-4o',
        uri: 'https://api.openai.com/v1/',
        type: 'openai.OpenAIGenerator'
    });
    const [auditResults, setAuditResults] = useState(null);

    useEffect(() => {
        fetchTargets();
    }, []);

    const fetchTargets = async () => {
        try {
            const token = localStorage.getItem('sageai_token');
            const res = await axios.get(`${API_BASE}/redteam/targets`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTargets(res.data.targets || []);
        } catch (err) {
            console.error('Failed to fetch targets', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTarget = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('sageai_token');
            await axios.post(`${API_BASE}/redteam/targets`, newTarget, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNewTarget({ name: '', model: 'gpt-4o', uri: 'https://api.openai.com/v1/', type: 'openai.OpenAIGenerator' });
            fetchTargets();
        } catch (err) {
            alert('Failed to create target: ' + err.message);
        }
    };

    const handleStartAudit = async (targetName) => {
        try {
            const token = localStorage.getItem('sageai_token');
            const res = await axios.post(`${API_BASE}/redteam/audit`, {
                target_name: targetName,
                probes: ['jailbreak', 'pii_leakage']
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Audit job started! ID: ' + res.data.job.name);
        } catch (err) {
            alert('Failed to start audit: ' + err.message);
        }
    };

    return (
        <div className="page-container">
            <header className="page-header">
                <div className="page-title-area">
                    <h1 className="page-title">AI Red Teaming</h1>
                    <p className="page-subtitle">Security auditing & safety testing for LLM targets via NVIDIA NeMo</p>
                </div>
            </header>

            <div className="dashboard-grid">
                {/* Create Target */}
                <div className="card shadow-sm" style={{ gridColumn: 'span 4' }}>
                    <div className="card-header border-bottom">
                        <h3 className="card-title">Register New LLM Target</h3>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleCreateTarget}>
                            <div className="form-group mb-3">
                                <label className="form-label">Target Name</label>
                                <input 
                                    className="input-field" 
                                    placeholder="e.g. Production GPT-4o"
                                    value={newTarget.name}
                                    onChange={e => setNewTarget({...newTarget, name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group mb-3">
                                <label className="form-label">Model Identifier</label>
                                <input 
                                    className="input-field" 
                                    placeholder="e.g. gpt-4o"
                                    value={newTarget.model}
                                    onChange={e => setNewTarget({...newTarget, model: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group mb-3">
                                <label className="form-label">API Base URI</label>
                                <input 
                                    className="input-field" 
                                    placeholder="https://api.openai.com/v1/"
                                    value={newTarget.uri}
                                    onChange={e => setNewTarget({...newTarget, uri: e.target.value})}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary w-100">Add Target</button>
                        </form>
                    </div>
                </div>

                {/* Target List */}
                <div className="card shadow-sm" style={{ gridColumn: 'span 8' }}>
                    <div className="card-header border-bottom">
                        <h3 className="card-title">Configured Audit Targets</h3>
                    </div>
                    <div className="card-body p-0">
                        {loading ? (
                            <div className="p-4 text-center">Loading targets...</div>
                        ) : targets.length === 0 ? (
                            <div className="p-4 text-center text-muted">No targets configured yet.</div>
                        ) : (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Model</th>
                                        <th>Type</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {targets.map(t => (
                                        <tr key={t.name}>
                                            <td><strong>{t.name}</strong></td>
                                            <td><code>{t.model}</code></td>
                                            <td><span className="badge badge-outline">{t.type}</span></td>
                                            <td>
                                                <button 
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleStartAudit(t.name)}
                                                >
                                                    🎯 Run Security Audit
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Audit Explanation Card */}
                <div className="card shadow-sm mt-4" style={{ gridColumn: 'span 12', background: 'var(--bg-accent)', border: '1px solid var(--brand-violet-dim)' }}>
                    <div className="card-body d-flex align-items-center gap-4">
                        <div style={{ fontSize: '2.5rem' }}>🛡️</div>
                        <div>
                            <h4 style={{ color: 'var(--brand-violet-light)', marginBottom: '0.25rem' }}>AI Guardrail Auditing</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: 800 }}>
                                SageAI uses **NVIDIA NeMo Auditor** to automatically test your AI targets for jailbreaks, PII leakage, and offensive content generation. 
                                Each audit runs hundreds of adversarial probes to stress-test your AI safety guardrails.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .badge-outline {
                    background: transparent;
                    border: 1px solid var(--border-color);
                    color: var(--text-muted);
                    font-size: 0.7rem;
                    padding: 2px 8px;
                }
            `}} />
        </div>
    );
}
