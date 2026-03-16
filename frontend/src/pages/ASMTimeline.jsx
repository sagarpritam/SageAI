import { useState, useEffect } from 'react';
import { getAsmEvents } from '../api';
import ASMEventCard from '../components/ASMEventCard';

export default function ASMTimeline() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterSev, setFilterSev] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await getAsmEvents(100);
            setEvents(res.data || []);
        } catch (err) {
            console.error("Failed to fetch ASM events", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const filteredEvents = events.filter(evt => {
        if (filterSev !== 'all' && evt.severity !== filterSev) return false;
        if (searchTerm && !evt.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
            !evt.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="animate-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">ASM Live Timeline</h1>
                    <p className="page-subtitle">Historical feed of all attack surface changes and discoveries</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn-secondary" onClick={fetchEvents} disabled={loading}>
                        {loading ? 'Refreshing...' : '↻ Refresh Feed'}
                    </button>
                    <span className="badge badge-success">Live Monitoring Active</span>
                </div>
            </div>

            <div className="page-body">
                <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>SEARCH EVENTS</div>
                        <input 
                            className="input" 
                            placeholder="Search by asset or event type..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>SEVERITY</div>
                        <select className="input" value={filterSev} onChange={e => setFilterSev(e.target.value)}>
                            <option value="all">All Severities</option>
                            <option value="info">Info</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                        </select>
                    </div>
                </div>

                <div className="card" style={{ padding: '0 1.5rem' }}>
                    {loading ? (
                        <div style={{ padding: '4rem', textAlign: 'center' }}>
                            <div className="spinner spinner-lg" style={{ margin: '0 auto 1rem' }} />
                            <div style={{ color: 'var(--text-muted)' }}>Loading timeline...</div>
                        </div>
                    ) : filteredEvents.length > 0 ? (
                        <div>
                            {filteredEvents.map((evt, i) => (
                                <ASMEventCard 
                                    key={evt.id} 
                                    event={evt} 
                                    isLast={i === filteredEvents.length - 1} 
                                />
                            ))}
                        </div>
                    ) : (
                        <div style={{ padding: '5rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>◖</div>
                            <h3>No events found</h3>
                            <p>No attack surface changes have been detected for the selected filters.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
