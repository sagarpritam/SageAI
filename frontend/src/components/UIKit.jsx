import { useState, useEffect } from 'react';

/* ── Skeleton Loader ──────────────────────────────── */
export function Skeleton({ width = '100%', height = '20px', rounded = '8px', className = '' }) {
    return (
        <div
            className={`skeleton ${className}`}
            style={{
                width, height, borderRadius: rounded,
                background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s ease-in-out infinite',
            }}
        />
    );
}

export function CardSkeleton() {
    return (
        <div className="glass-card" style={{ padding: '24px' }}>
            <Skeleton width="60%" height="14px" />
            <Skeleton width="40%" height="32px" className="mt-2" />
            <Skeleton width="80%" height="12px" className="mt-2" />
        </div>
    );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
    return (
        <div className="glass-card" style={{ padding: '24px' }}>
            <Skeleton width="30%" height="20px" />
            <div style={{ marginTop: '16px' }}>
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                        {Array.from({ length: cols }).map((_, j) => (
                            <Skeleton key={j} width={`${100 / cols}%`} height="16px" />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── Search Bar ───────────────────────────────────── */
export function SearchBar({ value, onChange, placeholder = 'Search...' }) {
    return (
        <div style={{ position: 'relative', maxWidth: '320px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>🔍</span>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="input"
                style={{ paddingLeft: '36px', width: '100%' }}
            />
        </div>
    );
}

/* ── Export Buttons ────────────────────────────────── */
export function ExportButtons({ data, filename = 'export' }) {
    const exportJSON = () => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${filename}.json`; a.click();
        URL.revokeObjectURL(url);
    };

    const exportCSV = () => {
        if (!data?.length) return;
        const headers = Object.keys(data[0]);
        const csv = [headers.join(','), ...data.map(row =>
            headers.map(h => JSON.stringify(row[h] ?? '')).join(',')
        )].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${filename}.csv`; a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={exportJSON} className="btn btn-secondary" style={{ fontSize: '13px', padding: '6px 12px' }}>
                📥 JSON
            </button>
            <button onClick={exportCSV} className="btn btn-secondary" style={{ fontSize: '13px', padding: '6px 12px' }}>
                📊 CSV
            </button>
        </div>
    );
}

/* ── Empty State ──────────────────────────────────── */
export function EmptyState({ icon = '📭', title, message }) {
    return (
        <div style={{ textAlign: 'center', padding: '48px 24px', opacity: 0.6 }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>{icon}</div>
            <h3 style={{ color: 'var(--text-primary)' }}>{title}</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>{message}</p>
        </div>
    );
}

/* ── Status Badge ─────────────────────────────────── */
export function StatusBadge({ status }) {
    const colors = {
        completed: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e' },
        running: { bg: 'rgba(6,182,212,0.15)', text: '#06b6d4' },
        failed: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444' },
        pending: { bg: 'rgba(234,179,8,0.15)', text: '#eab308' },
    };
    const c = colors[status] || colors.pending;
    return (
        <span style={{
            background: c.bg, color: c.text,
            padding: '4px 10px', borderRadius: '20px',
            fontSize: '12px', fontWeight: 600, textTransform: 'capitalize',
        }}>
            {status}
        </span>
    );
}

/* ── Risk Badge ───────────────────────────────────── */
export function RiskBadge({ level }) {
    const colors = {
        Critical: '#ef4444', High: '#f97316', Medium: '#eab308', Low: '#22c55e',
    };
    return (
        <span style={{
            color: colors[level] || '#6b7280',
            fontWeight: 700, fontSize: '13px',
        }}>
            {level}
        </span>
    );
}
