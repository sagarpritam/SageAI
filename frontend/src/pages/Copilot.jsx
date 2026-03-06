import { useState, useEffect, useRef } from 'react';
import api from '../api';

const QUICK_COMMANDS = [
    { label: '🌐 Scan a domain', cmd: 'Scan example.com for all vulnerabilities and give me a summary' },
    { label: '🔍 Explain a CVE', cmd: 'Explain CVE-2024-12345 and how to fix it' },
    { label: '🗺️ Attack surface', cmd: 'Discover the attack surface for example.com' },
    { label: '🛡️ Remediation', cmd: 'How do I fix SQL injection vulnerabilities in Python?' },
    { label: '📄 Bug bounty', cmd: 'Write a HackerOne bug report for an XSS vulnerability' },
    { label: '⚡ Port scan', cmd: 'Scan ports on 192.168.1.1 and identify open services' },
];

const WELCOME = {
    role: 'ai',
    content: `**SageAI Copilot** ✦ — Your AI Security Expert

I have full context of your scan history, asset inventory, and vulnerability knowledge base.

**I can help you:**
- 🔍 Analyze and explain security findings from your scans
- 🛡️ Generate step-by-step remediation plans
- 🌐 Discover your attack surface (subdomains, APIs, tech stack)
- 📄 Write bug bounty reports (HackerOne, Bugcrowd format)
- ⚡ Run targeted security checks  
- 💡 Answer any cybersecurity question

Type a message or pick a quick command to get started.`,
    time: new Date(),
};

function renderContent(text) {
    return text
        .split('\n')
        .map(line => {
            // Code blocks
            if (line.startsWith('    ') || line.startsWith('\t')) {
                return `<code style="display:block;background:rgba(124,58,237,0.1);padding:4px 8px;border-radius:4px;font-family:Fira Code,monospace;font-size:0.8em;color:var(--brand-violet-light);margin:2px 0">${line.trim()}</code>`;
            }
            // Bold
            line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            // Inline code
            line = line.replace(/`(.*?)`/g, '<code style="background:rgba(124,58,237,0.15);padding:1px 6px;border-radius:4px;font-family:Fira Code,monospace;font-size:0.85em;color:var(--brand-violet-light)">$1</code>');
            // Bullet points
            if (line.match(/^[-•*] /)) return `<div style="padding-left:12px;line-height:1.6">◦ ${line.slice(2)}</div>`;
            if (line.match(/^\d+\. /)) return `<div style="padding-left:12px;line-height:1.6">${line}</div>`;
            return line || '<br/>';
        })
        .join('\n')
        .replace(/\n(<br\/>)+\n/g, '\n');
}

function TypingIndicator() {
    return (
        <div className="chat-msg">
            <div className="chat-avatar chat-avatar-ai" style={{ fontSize: '0.85rem' }}>✦</div>
            <div className="chat-bubble chat-bubble-ai" style={{ padding: '0.75rem 1rem' }}>
                <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                    {[0, 1, 2].map(i => (
                        <div key={i} style={{
                            width: 7, height: 7, borderRadius: '50%',
                            background: 'var(--brand-violet)',
                            animation: 'pulse-glow 1.2s ease-in-out infinite',
                            animationDelay: `${i * 0.2}s`,
                        }} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function Copilot() {
    const [messages, setMessages] = useState([WELCOME]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [showQuick, setShowQuick] = useState(true);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const send = async (text) => {
        const msg = (text || input).trim();
        if (!msg || loading) return;
        setInput('');
        setShowQuick(false);
        setMessages(prev => [...prev, { role: 'user', content: msg, time: new Date() }]);
        setLoading(true);

        try {
            const res = await api.post('/ai/chat', { message: msg });
            const reply = res.data?.response || res.data?.message || res.data?.result || 'I processed your request.';
            setMessages(prev => [...prev, { role: 'ai', content: reply, time: new Date() }]);
        } catch (err) {
            const errMsg = err.response?.data?.detail || 'Connection error. Please try again.';
            setMessages(prev => [...prev, {
                role: 'ai', content: `⚠️ **Error:** ${errMsg}`, time: new Date(), error: true,
            }]);
        } finally {
            setLoading(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    };

    const handleClear = () => {
        setMessages([{ ...WELCOME, time: new Date() }]);
        setShowQuick(true);
    };

    return (
        <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
            {/* ── Header ─────────────────────────────────── */}
            <div className="page-header" style={{ flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--brand-violet), var(--brand-cyan))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.1rem', boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
                        animation: 'pulse-glow 3s ease-in-out infinite',
                    }}>✦</div>
                    <div>
                        <h1 className="page-title" style={{ fontSize: '1.15rem', marginBottom: '0.1rem' }}>AI Security Copilot</h1>
                        <p className="page-subtitle" style={{ margin: 0 }}>Context-aware · Scan history aware · Multi-tool capable</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className="badge badge-violet">
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981', display: 'inline-block', marginRight: 4 }} />
                        Online
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'var(--bg-hover)', padding: '0.25rem 0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                        {messages.length - 1} messages
                    </span>
                    <button className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.875rem' }}
                        onClick={handleClear}>Clear</button>
                </div>
            </div>

            {/* ── Quick Commands Bar ──────────────────────── */}
            {showQuick && messages.length <= 1 && (
                <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '0.375rem', flexWrap: 'wrap', background: 'var(--bg-secondary)', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', alignSelf: 'center', marginRight: '0.25rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quick start</span>
                    {QUICK_COMMANDS.map(q => (
                        <button key={q.label} onClick={() => send(q.cmd)} style={{
                            fontSize: '0.72rem', padding: '0.3rem 0.75rem', borderRadius: 999, cursor: 'pointer',
                            background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.18)',
                            color: 'var(--brand-violet-light)', transition: 'all 0.15s', whiteSpace: 'nowrap',
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.15)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(124,58,237,0.06)'}>
                            {q.label}
                        </button>
                    ))}
                </div>
            )}

            {/* ── Messages ───────────────────────────────── */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {messages.map((msg, i) => (
                    <div key={i} className={`chat-msg ${msg.role === 'user' ? 'chat-msg-user' : ''} animate-in`}>
                        <div className={`chat-avatar ${msg.role === 'ai' ? 'chat-avatar-ai' : 'chat-avatar-user'}`} style={{ fontSize: msg.role === 'ai' ? '0.9rem' : '0.75rem' }}>
                            {msg.role === 'ai' ? '✦' : '👤'}
                        </div>
                        <div>
                            <div
                                className={`chat-bubble ${msg.role === 'ai' ? 'chat-bubble-ai' : 'chat-bubble-user'}`}
                                style={msg.error ? { borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)' } : {}}
                                dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }}
                            />
                            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 4, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                                {msg.time?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                ))}
                {loading && <TypingIndicator />}
                <div ref={bottomRef} />
            </div>

            {/* ── Input Area ─────────────────────────────── */}
            <div className="chat-input-area">
                <div style={{ flex: 1, position: 'relative' }}>
                    <textarea
                        ref={inputRef}
                        className="input"
                        placeholder="Ask anything about security, CVEs, your scan results, or request a scan..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKey}
                        rows={1}
                        disabled={loading}
                        style={{ resize: 'none', minHeight: 44, maxHeight: 140, overflowY: 'auto', lineHeight: 1.6, paddingRight: '3rem' }}
                    />
                    {input.length > 0 && (
                        <span style={{ position: 'absolute', right: '0.75rem', bottom: '0.625rem', fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                            ↵ Enter
                        </span>
                    )}
                </div>
                <button
                    className="btn-primary"
                    onClick={() => send()}
                    disabled={loading || !input.trim()}
                    style={{ flexShrink: 0, padding: '0.75rem 1.5rem', fontSize: '0.875rem' }}>
                    {loading ? <span className="spinner spinner-sm" /> : <span>Send ↗</span>}
                </button>
            </div>
        </div>
    );
}
