import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function ChatBox() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef();

  const loadMessages = async () => {
    if (!user) return;
    try {
      const r = await api.get('/users/chat/messages');
      const msgs = (r.data.data || []).map(m => ({
        id: m.id,
        from: m.is_support ? 'support' : 'user',
        text: m.message,
        time: new Date(new Date(m.created_at).getTime() - 9*60*60*1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }));
      if (msgs.length > messages.length && !open) setUnread(u => u + (msgs.length - messages.length));
      setMessages(msgs);
    } catch(e) {}
  };

  useEffect(() => {
    if (!user) {
      setMessages([{ id: 1, from: 'bot', text: 'Hello! Please login to chat with support.', time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }]);
      return;
    }
    loadMessages();
    const t = setInterval(loadMessages, 5000);
    return () => clearInterval(t);
  }, [user]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [open, messages]);

  const send = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');
    if (user) {
      try {
        await api.post('/users/chat/messages', { message: text });
        loadMessages();
      } catch(e) {}
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 999 }}>
      {open && (
        <div style={{ width: 320, height: 440, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, display: 'flex', flexDirection: 'column', marginBottom: 10, boxShadow: '0 8px 32px rgba(0,0,0,.4)' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg3)', borderRadius: '8px 8px 0 0' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>EventHub Support</div>
              <div style={{ fontSize: 10, color: 'var(--gold)' }}>● Online</div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 16 }}>X</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 12, marginTop: 20 }}>Send a message to start chatting with support</div>
            )}
            {messages.map((msg, i) => (
              <div key={msg.id || i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.from === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 2 }}>{msg.from === 'support' ? 'Support' : 'You'}</div>
                <div style={{ maxWidth: '80%', padding: '8px 12px', borderRadius: 8, background: msg.from === 'user' ? 'var(--gold)' : msg.from === 'support' ? '#7c3aed' : 'var(--bg3)', color: msg.from === 'user' ? '#000' : '#fff', fontSize: 12, lineHeight: 1.5 }}>
                  {msg.text}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3 }}>{msg.time}</div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
              placeholder={user ? "Type a message..." : "Please login to chat"}
              disabled={!user}
              style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 4, padding: '6px 10px', fontSize: 12, color: 'var(--text)', outline: 'none' }} />
            <button onClick={send} disabled={!user} style={{ background: 'var(--gold)', border: 'none', borderRadius: 4, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#000' }}>Send</button>
          </div>
        </div>
      )}
      <button onClick={() => setOpen(!open)} style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--gold)', border: 'none', cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(201,168,76,.4)', position: 'relative' }}>
        💬
        {unread > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', color: '#fff', fontSize: 9, width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{unread}</span>}
      </button>
    </div>
  );
}