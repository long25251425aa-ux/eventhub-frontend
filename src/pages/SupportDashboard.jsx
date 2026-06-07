import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const now = () => new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
const fmtD = d => new Date(new Date(d).getTime() - 9*60*60*1000).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

export default function SupportDashboard() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [conversations, setConversations] = useState({});
  const bottomRef = useRef();

  const load = async () => {
    try {
      // DÃ¹ng chat/all Ä‘á»ƒ cÃ³ Ä‘áº§y Ä‘á»§ sender_id vÃ  sender_email
      const { data } = await api.get('/users/chat/all');
      const all = data.data || [];
      
      // Group user messages theo sender_email
      const groups = {};
      const userMsgs = all.filter(m => m.is_support === 0);
      userMsgs.forEach(m => {
        const key = m.sender_email || ('uid_' + m.sender_id);
        if (!groups[key]) groups[key] = {
          name: m.sender_name || 'KhÃ¡ch',
          email: m.sender_email,
          sender_id: m.sender_id,
          msgs: []
        };
        groups[key].msgs.push({ ...m, text: m.message, from: 'user' });
      });
      // ThÃªm support replies
      const supportMsgs = all.filter(m => m.is_support === 1);
      supportMsgs.forEach(m => {
        const matchKey = Object.keys(groups).find(k =>
          (m.sender_email && groups[k].email === m.sender_email) ||
          (!m.sender_email && groups[k].sender_id && String(groups[k].sender_id) === String(m.sender_id))
        );
        if (matchKey) groups[matchKey].msgs.push({ ...m, text: m.message, from: 'support' });
      });
      Object.values(groups).forEach(g => g.msgs.sort((a,b) => new Date(a.created_at) - new Date(b.created_at)));
      setConversations(groups);
    } catch { setMessages([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); const t = setInterval(load, 10000); return () => clearInterval(t); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [selected, conversations]);

  const sendReply = async () => {
    if (!reply.trim() || !selected) return;
    setSending(true);
    try {
      // Gá»­i notification pháº£n há»“i cho user
      const conv = conversations[selected];
      const toEmail = conv?.email?.includes('@') ? conv.email : null;
      const toUserId = conv?.sender_id;
      console.log('Reply to:', toEmail, toUserId);
      await api.post('/users/chat/send', {
        message: reply.trim(),
        to_email: toEmail,
        to_user_id: toUserId,
      });
      toast.success('âœ… ÄÃ£ gá»­i pháº£n há»“i!');
      setReply('');
      // ThÃªm vÃ o conversation local
      load(); // Reload tá»« DB
    } catch (e) { toast.error(e.response?.data?.message || 'Lá»—i gá»­i'); }
    finally { setSending(false); }
  };

  const convList = Object.entries(conversations);
  const selConv = selected ? conversations[selected] : null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: 'var(--dark)', padding: '20px 32px', borderBottom: '1px solid rgba(201,168,76,.1)' }}>
        <div style={{ fontSize: 10, letterSpacing: 3, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 4 }}>Support Dashboard</div>
        <h1 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 26, color: '#faf7f2', fontWeight: 700 }}>
          ðŸ’¬ Há»™p thÆ° há»— trá»£ khÃ¡ch hÃ ng
        </h1>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', marginTop: 4 }}>
          Xin chÃ o <strong style={{ color: '#c9a84c' }}>{user?.name}</strong> Â· Táº¥t cáº£ tin nháº¯n tá»« Live Chat sáº½ hiá»‡n táº¡i Ä‘Ã¢y
        </p>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '300px 1fr', height: 'calc(100vh - 120px)' }}>
        {/* LEFT - Danh sÃ¡ch há»™i thoáº¡i */}
        <div style={{ borderRight: '1px solid var(--border)', overflowY: 'auto', background: 'var(--bg2)' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 11, letterSpacing: 1, color: 'var(--text3)', textTransform: 'uppercase' }}>
            {convList.length} cuá»™c há»™i thoáº¡i
          </div>
          {loading ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text3)' }}>Äang táº£i...</div>
          ) : convList.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>ðŸ’¬</div>
              <div style={{ fontSize: 13, color: 'var(--text3)' }}>ChÆ°a cÃ³ tin nháº¯n nÃ o</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Tin nháº¯n tá»« Live Chat sáº½ xuáº¥t hiá»‡n á»Ÿ Ä‘Ã¢y</div>
            </div>
          ) : convList.map(([key, conv]) => {
            const lastMsg = conv.msgs[conv.msgs.length - 1];
            const unread = conv.msgs.filter(m => m.from !== 'support' && !m.read).length;
            return (
              <div key={key} onClick={() => setSelected(key)}
                style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer', background: selected === key ? 'rgba(201,168,76,.08)' : 'transparent', borderLeft: selected === key ? '3px solid var(--gold)' : '3px solid transparent', transition: 'all .2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gold)', color: '#1a1510', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                      {(conv.name || key)[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{conv.name || 'KhÃ¡ch'}</div>
                      <div style={{ fontSize: 10, color: 'var(--text3)' }}>{conv.email || key}</div>
                    </div>
                  </div>
                  {unread > 0 && <span style={{ background: '#ef4444', color: '#fff', width: 18, height: 18, borderRadius: '50%', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>{unread}</span>}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', marginLeft: 40 }}>
                  {lastMsg?.text || lastMsg?.message || '...'}
                </div>
                {lastMsg?.created_at && <div style={{ fontSize: 10, color: 'var(--text3)', marginLeft: 40, marginTop: 2 }}>{fmtD(lastMsg.created_at)}</div>}
              </div>
            );
          })}
        </div>

        {/* RIGHT - Chat area */}
        <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
          {!selected ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 60 }}>ðŸ’¬</div>
              <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 22, color: 'var(--text3)' }}>Chá»n má»™t cuá»™c há»™i thoáº¡i</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>Tin nháº¯n tá»« khÃ¡ch hÃ ng sáº½ xuáº¥t hiá»‡n bÃªn trÃ¡i</div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg2)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gold)', color: '#1a1510', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>
                  {(selConv?.name || selected)[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{selConv?.name || 'KhÃ¡ch'}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{selConv?.email || selected} Â· {selConv?.msgs?.length || 0} tin nháº¯n</div>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
                {(selConv?.msgs || []).map((m, i) => {
                  const isSupport = m.from === 'support';
                  return (
                    <div key={m.id || i} style={{ display: 'flex', gap: 10, marginBottom: 14, flexDirection: isSupport ? 'row-reverse' : 'row' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: isSupport ? '#7c3aed' : 'var(--gold)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                        {isSupport ? 'ðŸ‘¨â€ðŸ’¼' : (selConv?.name || 'K')[0]?.toUpperCase()}
                      </div>
                      <div style={{ maxWidth: '70%' }}>
                        <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 3, textAlign: isSupport ? 'right' : 'left' }}>
                          {isSupport ? (m.sender_name || user?.name || 'Support') : (selConv?.name || 'KhÃ¡ch')}
                        </div>
                        <div style={{ background: isSupport ? '#7c3aed' : 'var(--bg3)', color: isSupport ? '#fff' : 'var(--text)', padding: '10px 14px', borderRadius: isSupport ? '14px 4px 4px 14px' : '4px 14px 14px 4px', fontSize: 13, lineHeight: 1.5, border: isSupport ? 'none' : '1px solid var(--border)' }}>
                          {m.text || m.message}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3, textAlign: isSupport ? 'right' : 'left' }}>
                          {m.created_at ? fmtD(m.created_at) : now()}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg2)' }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <textarea value={reply} onChange={e => setReply(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                    placeholder="Nháº­p pháº£n há»“i... (Enter Ä‘á»ƒ gá»­i, Shift+Enter xuá»‘ng dÃ²ng)"
                    style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', padding: '10px 14px', fontSize: 13, fontFamily: 'inherit', outline: 'none', borderRadius: 4, resize: 'none', minHeight: 44, maxHeight: 120 }}
                    rows={2} />
                  <button onClick={sendReply} disabled={!reply.trim() || sending}
                    style={{ background: '#7c3aed', border: 'none', color: '#fff', padding: '0 20px', fontSize: 13, cursor: reply.trim() ? 'pointer' : 'default', fontFamily: 'inherit', borderRadius: 4, opacity: (!reply.trim() || sending) ? .5 : 1, whiteSpace: 'nowrap' }}>
                    {sending ? '...' : 'ðŸ“¨ Gá»­i'}
                  </button>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 6 }}>Pháº£n há»“i sáº½ Ä‘Æ°á»£c gá»­i thÃ´ng bÃ¡o Ä‘áº¿n tÃ i khoáº£n khÃ¡ch hÃ ng</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}




