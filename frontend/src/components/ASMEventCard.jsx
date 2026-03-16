import { useState } from 'react';

const SEVERITY_COLORS = {
    info: '#3b82f6',
    low: '#10b981',
    medium: '#f59e0b',
    high: '#f97316',
    critical: '#ef4444'
};

const EVENT_ICONS = {
    new_subdomain: '🌐',
    new_ip: '🖥️',
    new_port: '🔌',
    new_service: '🛠️',
    port_closed: '🚫',
    service_changed: '🔄',
    dns_changed: '🧬',
    new_vulnerability: '⚠️'
};

export default function ASMEventCard({ event, isLast }) {
    const [expanded, setExpanded] = useState(false);
    const sevColor = SEVERITY_COLORS[event.severity] || '#3b82f6';
    const icon = EVENT_ICONS[event.event_type] || '🔔';

    let details = {};
    try {
        details = typeof event.details === 'string' ? JSON.parse(event.details) : event.details;
    } catch (e) {
        details = { raw: event.details };
    }

    return (
        <div style={{ display: 'flex', gap: '1.25rem', padding: '1.25rem 0', borderBottom: isLast ? 'none' : '1px solid var(--border-color)', position: 'relative' }}>
            {/* Timeline Dot & Line */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '10px', 
                    background: sevColor + '1a', 
                    border: `1px solid ${sevColor}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    zIndex: 1,
                    boxShadow: `0 0 10px ${sevColor}15`
                }}>
                    {icon}
                </div>
                {!isLast && <div style={{ width: 2, background: 'var(--border-color)', flex: 1, marginTop: 8, marginBottom: -20 }} />}
            </div>
            
            {/* Content */}
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        {event.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                        {new Date(event.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                </div>
                
                <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', lineHeight: 1.5 }}>
                    {event.description}
                </div>

                {event.details && event.details !== '{}' && (
                    <div>
                        <button 
                            onClick={() => setExpanded(!expanded)}
                            style={{ 
                                background: 'none', 
                                border: 'none', 
                                color: 'var(--brand-violet-light)', 
                                fontSize: '0.75rem', 
                                padding: 0, 
                                cursor: 'pointer',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                            }}
                        >
                            {expanded ? '▲ Hide Details' : '▼ View Technical Details'}
                        </button>
                        
                        {expanded && (
                            <div className="animate-in" style={{ marginTop: '0.75rem' }}>
                                <pre className="mono" style={{ 
                                    fontSize: '0.72rem', 
                                    background: 'var(--bg-elevated)', 
                                    padding: '0.75rem', 
                                    borderRadius: 8, 
                                    color: 'var(--brand-cyan-light)', 
                                    border: '1px solid var(--border-color)',
                                    overflowX: 'auto',
                                    maxHeight: '200px'
                                }}>
                                    {JSON.stringify(details, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
