import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/scans', label: 'Scans', icon: '🔍' },
    { path: '/schedules', label: 'Schedules', icon: '⏰' },
    { path: '/reports', label: 'Reports', icon: '📄' },
    { path: '/autofix', label: 'Auto-Fix', icon: '🛡️' },
    { path: '/team', label: 'Team', icon: '👥' },
    { path: '/plan', label: 'Plan & Billing', icon: '💎' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Layout() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('sageai_token');
        navigate('/login');
    };

    return (
        <div style={{ display: 'flex' }}>
            {/* Sidebar */}
            <aside className="sidebar">
                <div style={{ marginBottom: '2rem', padding: '0 0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>🛡️</span>
                        <span className="gradient-text" style={{ fontSize: '1.25rem', fontWeight: 700 }}>SageAI</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem', paddingLeft: '2.25rem' }}>
                        Security Scanner
                    </div>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                    {NAV_ITEMS.map(({ path, label, icon }) => (
                        <NavLink
                            key={path}
                            to={path}
                            end={path === '/'}
                            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        >
                            <span>{icon}</span>
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>

                <button
                    onClick={handleLogout}
                    className="sidebar-link"
                    style={{ marginTop: 'auto', border: 'none', cursor: 'pointer', background: 'none', width: '100%' }}
                >
                    <span>🚪</span>
                    <span>Logout</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}
