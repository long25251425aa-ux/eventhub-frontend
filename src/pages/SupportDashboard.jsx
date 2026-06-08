import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
const now = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
const fmtD = d => new Date(new Date(d).getTime() - 9*60*60*1000).toLocaleString('en-US');
export default function SupportDashboard() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [convList, setConvList] = useState([]);
  const [selConv, setSelConv] = useState(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef();
  const load = async () => {
    try {
      const r = await api.get('/users/chat/all');
      const all = r.data.data || [];
      // Group by sender_email
      const groups = {};
      all.forEach(m => {
        const key = m.sender_email || ('uid_' + m.sender_id);
        if (!groups[key]) groups[key] = { email: m.sender_email, name: m.sender_name, id: m.sender_id, msgs: [] };
        groups[key].msgs.push(m);
      });
      const list = Object.values(groups).map(g => ({ ...g, last: g.msgs[g.msgs.length-1]?.message || '', time: g.msgs[g.msgs.length-1]?.created_at }));
      setConvList(list);
      if (selConv) {
        const updated = list.find(c => c.email === selConv.email);
        if (updated) { setSelConv(updated); setMessages(updated.msgs); }
      }
    } catch(e) {}
  };
  useEffect(() => { load(); const t = setInterval(load, 5000); return () => clearInterval(t); }, []);
  useEffect(() => { if (selConv) { setMessages(selConv.msgs || []); } }, [selConv]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  const sendReply = async () => {
    if (!reply.trim() || !selConv) return;
    setSending(true);
    try {
      await api.post('/users/chat/reply', { to_email: selConv.email, to_id: selConv.id, message: reply.trim() });
      setReply('');
      toast.success('Reply sent!');
      load();
    } catch(e) { toast.error(e.response?.data?.message || 'Error sending reply'); }
    setSending(false);
  };
  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px)', background: 'var(--bg)' }}>
      {/* LEFT */}
      <div style={{ width: 280, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--bg2)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Support Inbox</div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{convList.length} conversations</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {convList.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text3)', fontSize: 12 }}>No conversations yet</div>
          ) : convList.map((c, i) => (
            <div key={i} onClick={() => setSelConv(c)}
              style={{ padding: '12px 16px', borderBottom: '1px solid var(--border2)', cursor: 'pointer', background: selConv?.email === c.email ? 'rgba(201,168,76,.1)' : 'transparent', transition: 'background .2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{c.name || c.email}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>{c.time ? new Date(new Date(c.time).getTime()-9*60*60*1000).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'}) : ''}</div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.last}</div>
            </div>
          ))}
        </div>
      </div>
      {/* RIGHT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!selConv ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>💬</div>
            <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 22, marginBottom: 8 }}>Select a conversation</div>
            <div style={{ fontSize: 12 }}>Choose a conversation from the left to start replying</div>
          </div>
        ) : (
          <>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{selConv.name || selConv.email}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{selConv.email}</div>
              </div>
              <div style={{ fontSize: 10, color: 'var(--gold)', background: 'rgba(201,168,76,.1)', padding: '4px 10px', borderRadius: 12 }}>● Active</div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {messages.map((m, i) => {
                const isSupport = m.is_support === 1 || m.is_support === true;
                return (
                  <div key={m.id || i} style={{ display: 'flex', gap: 10, marginBottom: 14, flexDirection: isSupport ? 'row-reverse' : 'row' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: isSupport ? '#7c3aed' : 'var(--gold)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                      {isSupport ? 'S' : (selConv?.name || 'U')[0]?.toUpperCase()}
                    </div>
                    <div style={{ maxWidth: '70%' }}>
                      <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 3, textAlign: isSupport ? 'right' : 'left' }}>
                        {isSupport ? (m.sender_name || user?.name || 'Support') : (selConv?.name || 'Guest')}
                      </div>
                      <div style={{ padding: '10px 14px', borderRadius: 8, background: isSupport ? '#7c3aed' : 'var(--bg3)', color: isSupport ? '#fff' : 'var(--text)', fontSize: 13, lineHeight: 1.6 }}>
                        {m.message}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4, textAlign: isSupport ? 'right' : 'left' }}>
                        {m.created_at ? new Date(new Date(m.created_at).getTime()-9*60*60*1000).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'}) : now()}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg2)', display: 'flex', gap: 10 }}>
              <textarea value={reply} onChange={e => setReply(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); }}}
                placeholder="Type reply... (Enter to send, Shift+Enter for new line)"
                style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 4, padding: '8px 12px', fontSize: 13, color: 'var(--text)', resize: 'none', height: 60, outline: 'none', fontFamily: 'inherit' }} />
              <button onClick={sendReply} disabled={sending}
                style={{ background: 'var(--gold)', border: 'none', borderRadius: 4, padding: '0 20px', fontSize: 12, fontWeight: 700, cursor: 'pointer', color: '#000', opacity: sending ? .6 : 1 }}>
                {sending ? '...' : 'Send'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}