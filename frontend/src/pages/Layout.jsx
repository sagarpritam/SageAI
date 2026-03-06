import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';

const NAV_SECTIONS = [
    {
        label: 'Overview',
        items: [
            { path: '/', label: 'Dashboard', icon: '▣', end: true },
            { path: '/assets', label: 'Asset Inventory', icon: '◉', badge: 'NEW' },
        ]
    },
    {
        label: 'Security',
        items: [
            { path: '/scans', label: 'Scans', icon: '◎' },
            { path: '/schedules', label: 'Schedules', icon: '◷' },
            { path: '/reports', label: 'Reports', icon: '⊟' },
            { path: '/autofix', label: 'Auto-Fix', icon: '⚡', badge: 'AI' },
            { path: '/copilot', label: 'AI Copilot', icon: '✦', badge: 'AI' },
        ]
    },
    {
        label: 'AI Platform',
        items: [
            { path: '/agents', label: 'AI Security Team', icon: '◈', badge: 'NEW' },
            { path: '/assets', label: 'Asset Inventory', icon: '◉' },
        ]
    },
    {
        label: 'Account',
        items: [
            { path: '/team', label: 'Team', icon: '◈' },
            { path: '/plan', label: 'Plan & Billing', icon: '◆' },
            { path: '/settings', label: 'Settings', icon: '⊕' },
        ]
    }
];

const VERSION_BADGE = (
    <span style={{
        fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em',
        background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
        padding: '2px 7px', borderRadius: '999px', color: 'white',
        marginLeft: '4px',
    }}>v2.0</span>
);

export default function Layout() {
    const navigate = useNavigate();
    const email = localStorage.getItem('sageai_email') || 'user@org.com';
    const initials = email.slice(0, 2).toUpperCase();

    const handleLogout = () => {
        localStorage.removeItem('sageai_token');
        localStorage.removeItem('sageai_email');
        navigate('/login');
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* ── Sidebar ─────────────────────────────── */}
            <aside className="sidebar">
                {/* Header */}
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="sidebar-logo-icon">🛡️</div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span className="gradient-text" style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                                    SageAI
                                </span>
                                {VERSION_BADGE}
                            </div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1 }}>
                                Attack Surface Management
                            </div>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <div className="sidebar-body">
                    {NAV_SECTIONS.map(section => (
                        <div key={section.label}>
                            <div className="sidebar-section-label">{section.label}</div>
                            <nav className="sidebar-nav">
                                {section.items.map(({ path, label, icon, badge, end }) => (
                                    <NavLink
                                        key={path}
                                        to={path}
                                        end={end}
                                        className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                                    >
                                        <span className="sidebar-link-icon">{icon}</span>
                                        <span style={{ flex: 1 }}>{label}</span>
                                        {badge && (
                                            <span style={{
                                                fontSize: '0.58rem', fontWeight: 700, padding: '1px 6px',
                                                borderRadius: '999px', letterSpacing: '0.05em',
                                                background: badge === 'NEW'
                                                    ? 'rgba(16, 185, 129, 0.15)'
                                                    : 'rgba(124, 58, 237, 0.2)',
                                                color: badge === 'NEW'
                                                    ? '#6ee7b7'
                                                    : 'var(--brand-violet-light)',
                                                border: `1px solid ${badge === 'NEW' ? 'rgba(16,185,129,0.25)' : 'rgba(124,58,237,0.25)'}`,
                                            }}>
                                                {badge}
                                            </span>
                                        )}
                                    </NavLink>
                                ))}
                            </nav>
                        </div>
                    ))}
                </div>

                {/* Footer: User + Logout */}
                <div className="sidebar-footer">
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.625rem',
                        padding: '0.625rem', borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-hover)', border: '1px solid var(--border-color)',
                        marginBottom: '0.5rem',
                    }}>
                        <div style={{
                            width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.75rem', fontWeight: 700, color: 'white',
                        }}>
                            {initials}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {email}
                            </div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--brand-green)' }}>● Active</div>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="sidebar-link" style={{
                        border: 'none', background: 'none', width: '100%',
                        cursor: 'pointer', color: 'var(--text-muted)',
                    }}>
                        <span className="sidebar-link-icon">⇥</span>
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* ── Main ─────────────────────────────────── */}
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}
