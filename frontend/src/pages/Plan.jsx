import { useState, useEffect } from 'react';
import { getOrgPlan, getPlans } from '../api';

export default function Plan() {
    const [orgPlan, setOrgPlan] = useState(null);
    const [allPlans, setAllPlans] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getOrgPlan(), getPlans()])
            .then(([op, ap]) => { setOrgPlan(op.data); setAllPlans(ap.data); })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>;
    }

    const currentPlan = orgPlan?.plan || 'free';
    const planOrder = ['free', 'pro', 'enterprise'];

    return (
        <div className="animate-in">
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Plan & Billing</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Manage your subscription</p>

            {/* Current Usage */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Current Usage</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    <div className="stat-card">
                        <span className="stat-label">Current Plan</span>
                        <span className="stat-value gradient-text" style={{ fontSize: '1.5rem' }}>{currentPlan.toUpperCase()}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Scans Used</span>
                        <span className="stat-value" style={{ color: 'var(--brand-blue)' }}>
                            {orgPlan?.usage?.scans_used || 0}
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                /{orgPlan?.plan_details?.max_scans_per_month === -1 ? '∞' : orgPlan?.plan_details?.max_scans_per_month}
                            </span>
                        </span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Team Members</span>
                        <span className="stat-value" style={{ color: 'var(--brand-cyan)' }}>
                            {orgPlan?.usage?.users_count || 0}
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                /{orgPlan?.plan_details?.max_users === -1 ? '∞' : orgPlan?.plan_details?.max_users}
                            </span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Plans Grid */}
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Available Plans</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                {allPlans && planOrder.map(key => {
                    const plan = allPlans[key];
                    if (!plan) return null;
                    const isCurrent = key === currentPlan;

                    return (
                        <div
                            key={key}
                            className="card"
                            style={{
                                borderColor: isCurrent ? 'var(--brand-blue)' : 'var(--border-color)',
                                position: 'relative',
                                ...(isCurrent && { boxShadow: '0 0 25px rgba(59,130,246,0.15)' }),
                            }}
                        >
                            {isCurrent && (
                                <div style={{
                                    position: 'absolute', top: '-10px', right: '1rem',
                                    background: 'linear-gradient(135deg, var(--brand-blue), var(--brand-cyan))',
                                    color: 'white', padding: '0.2rem 0.75rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600,
                                }}>
                                    CURRENT
                                </div>
                            )}

                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>{plan.display_name}</h3>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <span style={{ fontSize: '2rem', fontWeight: 700 }}>${plan.price_monthly}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>/month</span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    ✅ {plan.max_scans_per_month === -1 ? 'Unlimited' : plan.max_scans_per_month} scans/month
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    ✅ {plan.max_users === -1 ? 'Unlimited' : plan.max_users} team members
                                </div>
                                {plan.features.map(f => (
                                    <div key={f} style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        ✅ {f.replace(/_/g, ' ')}
                                    </div>
                                ))}
                            </div>

                            <button
                                className={isCurrent ? 'btn-secondary' : 'btn-primary'}
                                style={{ width: '100%' }}
                                disabled={isCurrent}
                            >
                                {isCurrent ? 'Current Plan' : 'Upgrade'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
