import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const QUICK = ['How to book a ticket?', 'How to get a refund?', 'Contact support', 'View my tickets'];

const REPLIES = {
  'how to book': 'Login → Select event → Choose ticket → Confirm → Pay via QR → Receive ticket code.',
  'refund': 'Go to My Tickets → select ticket → click Request Refund. Admin reviews within 24h.',
  'contact': 'Email: admin@eventhub.vn | Phone: 1900 1234 | Hours: 8:00-22:00 daily.',
  'ticket': 'Go to My Tickets to view all your purchased tickets and QR codes.',
};

function getReply(text) {
  const t = text.toLowerCase();
  for (const [k, v] of Object.entries(REPLIES)) {
    if (t.includes(k)) return [v];
  }
  return ['Thank you for your message! Our support team will respond shortly.'];
}

export default function ChatBox() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef();
  const prevUser = useRef(null);

  useEffect(() => {
    if (prevUser.current !== user?.email) {
      prevUser.current = user?.email;
      if (user) {
        setMessages([{ id: 1, from: 'bot', text: `Hello ${user.name}! How can I help you?`, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }]);
        api.get('/users/chat/messages').then(r => {
          const msgs = (r.data.data || []).map(m => ({
            id: m.id,
            from: m.is_support ? 'support' : 'user',
            text: m.message,
            time: new Date(new Date(m.created_at).getTime() - 9*60*60*1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          }));
          if (msgs.length) setMessages(msgs);
        }).catch(() => {});
      } else {
        setMessages([{ id: 1, from: 'bot', text: 'Hello! How can I help you today?', time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }]);
      }
    }
  }, [user]);

  useEffect(() => {
    if (open) { setUnread(0); setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100); }
  }, [open, messages]);

  const send = async (text) => {
    if (!text.trim()) return;
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setMessages(p => [...p, { id: Date.now(), from: 'user', text: text.trim(), time }]);
    setInput('');
    if (user) {
      try { await api.post('/users/chat/messages', { message: text.trim() }); } catch (e) {}
    }
    setTimeout(() => {
      setMessages(p => [...p, { id: Date.now() + 1, from: 'bot', lines: getReply(text), time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }]);
      if (!open) setUnread(u => u + 1);
    }, 800);
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
            {messages.map(msg => (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.from === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '80%', padding: '8px 12px', borderRadius: 8, background: msg.from === 'user' ? 'var(--gold)' : 'var(--bg3)', color: msg.from === 'user' ? '#000' : 'var(--text)', fontSize: 12, lineHeight: 1.5 }}>
                  {msg.text || (msg.lines || []).join(' ')}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3 }}>{msg.time}</div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {QUICK.map(q => (
              <button key={q} onClick={() => send(q)} style={{ fontSize: 10, padding: '4px 8px', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 12, color: 'var(--text3)', cursor: 'pointer' }}>{q}</button>
            ))}
          </div>
          <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send(input)}
              placeholder="Type a message..." style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 4, padding: '6px 10px', fontSize: 12, color: 'var(--text)', outline: 'none' }} />
            <button onClick={() => send(input)} style={{ background: 'var(--gold)', border: 'none', borderRadius: 4, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#000' }}>Send</button>
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