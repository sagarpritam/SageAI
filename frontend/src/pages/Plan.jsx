import { useState, useEffect } from 'react';
import { getOrgPlan, getPlans } from '../api';

const PLAN_ICONS = { free: '🌱', pro: '⚡', enterprise: '🏢' };
const PLAN_COLORS = { free: 'var(--brand-green)', pro: 'var(--brand-violet)', enterprise: 'var(--brand-cyan)' };

const PLAN_FEATURES = {
    free: ['5 scans/month', '1 user', '7-day report retention', 'Community support', 'Core vulnerability scanner'],
    pro: ['Unlimited scans', '10 users', '90-day report retention', 'Priority support', 'Asset Inventory (ASM)', 'AI Copilot', 'github Auto-Fix PRs', 'Webhooks & API Keys', 'Custom scan schedules'],
    enterprise: ['Unlimited everything', 'Unlimited users', '1 year retention', 'Dedicated support + SLA', 'Multi-Agent AI Team', 'Security Knowledge Graph', 'Plugin Marketplace', 'SSO/SAML', 'Audit logs', 'Custom integrations'],
};

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

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
            <div className="spinner spinner-lg" />
        </div>
    );

    const currentPlan = orgPlan?.plan || 'free';
    const planOrder = ['free', 'pro', 'enterprise'];

    const scansUsed = orgPlan?.usage?.scans_used || 0;
    const scansMax = orgPlan?.plan_details?.max_scans_per_month;
    const scansPct = scansMax === -1 ? 0 : Math.min(100, (scansUsed / scansMax) * 100);

    return (
        <div className="animate-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Plan & Billing</h1>
                    <p className="page-subtitle">Manage your subscription and usage</p>
                </div>
                <span className="badge badge-violet" style={{ fontSize: '0.8rem', padding: '0.4rem 0.875rem' }}>
                    {PLAN_ICONS[currentPlan]} {currentPlan.toUpperCase()}
                </span>
            </div>
            <div className="page-body">
                {/* Current usage */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                    <div className="stat-card">
                        <span className="stat-label">Current Plan</span>
                        <span className="stat-value gradient-text" style={{ fontSize: '1.75rem' }}>{currentPlan.toUpperCase()}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Scans Used</span>
                        <span className="stat-value" style={{ color: 'var(--brand-blue)', fontSize: '1.75rem' }}>
                            {scansUsed}
                            <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                                /{scansMax === -1 ? '∞' : scansMax}
                            </span>
                        </span>
                        {scansMax !== -1 && (
                            <div className="progress-bar" style={{ marginTop: '0.5rem' }}>
                                <div className="progress-fill" style={{ width: `${scansPct}%`, background: scansPct > 80 ? 'var(--brand-red)' : undefined }} />
                            </div>
                        )}
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Team Members</span>
                        <span className="stat-value" style={{ color: 'var(--brand-cyan)', fontSize: '1.75rem' }}>
                            {orgPlan?.usage?.users_count || 0}
                            <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                                /{orgPlan?.plan_details?.max_users === -1 ? '∞' : orgPlan?.plan_details?.max_users}
                            </span>
                        </span>
                    </div>
                </div>

                {/* Plan cards */}
                <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Available Plans
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                    {planOrder.map(key => {
                        const plan = allPlans?.[key];
                        const isCurrent = key === currentPlan;
                        const isPopular = key === 'pro';

                        return (
                            <div key={key} className={`plan-card ${isCurrent ? 'current' : ''} ${isPopular && !isCurrent ? 'popular' : ''}`}>
                                {/* Popular badge */}
                                {isPopular && (
                                    <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-violet))', color: 'white', padding: '0.2rem 0.875rem', borderRadius: 999, fontSize: '0.65rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                        ✦ MOST POPULAR
                                    </div>
                                )}
                                {isCurrent && (
                                    <div style={{ position: 'absolute', top: -12, right: '1rem', background: 'linear-gradient(135deg, var(--brand-violet), #4f46e5)', color: 'white', padding: '0.2rem 0.75rem', borderRadius: 999, fontSize: '0.65rem', fontWeight: 700 }}>
                                        CURRENT
                                    </div>
                                )}

                                {/* Icon + name */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '1.5rem' }}>{PLAN_ICONS[key]}</span>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: PLAN_COLORS[key] }}>
                                        {plan?.display_name || key.charAt(0).toUpperCase() + key.slice(1)}
                                    </span>
                                </div>

                                {/* Price */}
                                <div style={{ margin: '1rem 0 1.25rem' }}>
                                    <span style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                                        ${plan?.price_monthly ?? (key === 'free' ? 0 : key === 'pro' ? 49 : 199)}
                                    </span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>/month</span>
                                </div>

                                {/* Features */}
                                <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                                    {(PLAN_FEATURES[key] || []).map(f => (
                                        <div key={f} className="plan-feature">
                                            <span className="plan-feature-icon">✓</span>
                                            {f}
                                        </div>
                                    ))}
                                </div>

                                <button className={isCurrent ? 'btn-secondary' : 'btn-primary'} style={{ width: '100%', justifyContent: 'center' }} disabled={isCurrent}>
                                    {isCurrent ? '✓ Current Plan' : key === 'enterprise' ? 'Contact Sales' : 'Upgrade →'}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Enterprise callout */}
                <div className="card" style={{ marginTop: '1.5rem', background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(6,182,212,0.04))', borderColor: 'rgba(124,58,237,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                        <div>
                            <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.3rem' }}>Need something custom?</p>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                Enterprise plans include SSO, audit logs, custom API limits, dedicated support, and SLA guarantees.
                            </p>
                        </div>
                        <a href="mailto:sales@sageai.io" className="btn-primary" style={{ whiteSpace: 'nowrap', textDecoration: 'none', fontSize: '0.85rem' }}>
                            Talk to Sales ↗
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
