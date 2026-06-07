import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './ChatBox.css';

const now = () => new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

// â”€â”€ Bot AI responses â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const BOT = {
  'dat ve': ['Äá»ƒ Ä‘áº·t vÃ©, báº¡n lÃ m theo cÃ¡c bÆ°á»›c:', '1. VÃ o **Sá»± kiá»‡n** â†’ chá»n sá»± kiá»‡n', '2. Chá»n sá»‘ lÆ°á»£ng vÃ©', '3. Nháº¥n **Äáº·t vÃ© & Thanh toÃ¡n**', '4. Chá»n phÆ°Æ¡ng thá»©c thanh toÃ¡n (QR/MoMo/ZaloPay...)', '5. HoÃ n táº¥t thanh toÃ¡n â†’ Admin xÃ¡c nháº­n â†’ VÃ© hiá»‡n trong **VÃ© cá»§a tÃ´i**'],
  'hoan ve': ['ChÃ­nh sÃ¡ch hoÃ n vÃ© EventHub:', 'âœ… Há»§y trÆ°á»›c **3 ngÃ y**: hoÃ n **100%**', 'âœ… Há»§y trÆ°á»›c **1 ngÃ y**: hoÃ n **50%**', 'âŒ Há»§y trong ngÃ y: **khÃ´ng hoÃ n tiá»n**', 'VÃ o **VÃ© cá»§a tÃ´i** â†’ nháº¥n **HoÃ n vÃ©** Ä‘á»ƒ gá»­i yÃªu cáº§u!'],
  'xuat ve': ['Äá»ƒ xuáº¥t vÃ© PDF:', '1. VÃ o **VÃ© cá»§a tÃ´i**', '2. TÃ¬m vÃ© cáº§n xuáº¥t', '3. Nháº¥n **Xuáº¥t PDF**', 'VÃ© PDF cÃ³ mÃ£ QR Ä‘á»ƒ check-in táº¡i cá»­a!'],
  'thanh toan': ['CÃ¡c phÆ°Æ¡ng thá»©c thanh toÃ¡n:', 'ðŸ¦ **QR Chuyá»ƒn khoáº£n** (MB Bank)', 'ðŸ’œ **MoMo** - VÃ­ Ä‘iá»‡n tá»­', 'ðŸ’™ **ZaloPay** - VÃ­ Ä‘iá»‡n tá»­', 'ðŸ”µ **VNPay** - QR', 'ðŸ’³ **Tháº» tÃ­n dá»¥ng** (Visa/MC/JCB)', 'ðŸ…¿ï¸ **PayPal** - Quá»‘c táº¿', 'âš¡ **Stripe** - Quá»‘c táº¿'],
  'ma giam gia': ['Äá»ƒ dÃ¹ng mÃ£ giáº£m giÃ¡:', '1. VÃ o trang chi tiáº¿t sá»± kiá»‡n', '2. Chá»n vÃ© â†’ nháº¥n **Äáº·t vÃ©**', '3. Táº¡i trang thanh toÃ¡n, nháº­p mÃ£ vÃ o Ã´ **Coupon/Voucher**', '4. Nháº¥n **Ãp dá»¥ng**', 'Gift codes cÃ³ sáºµn: **GIFT50**, **GIFT100**, **WELCOME**'],
  'lien he': ['ThÃ´ng tin liÃªn há»‡ há»— trá»£:', 'ðŸ“ž Hotline: **1900 1234** (8h-22h)', 'ðŸ“§ Email: **support@eventhub.vn**', 'ðŸ’¬ Zalo OA: **EventHub Vietnam**', 'â° Pháº£n há»“i trong **30 phÃºt** trong giá» hÃ nh chÃ­nh'],
  'default': ['Cáº£m Æ¡n báº¡n Ä‘Ã£ liÃªn há»‡ EventHub! ðŸ‘‹', 'TÃ´i chÆ°a hiá»ƒu rÃµ cÃ¢u há»i. Báº¡n cÃ³ thá»ƒ:', '- Chá»n gá»£i Ã½ bÃªn dÆ°á»›i', '- Há»i láº¡i báº±ng tá»« khÃ³a khÃ¡c', '- Gá»i **1900 1234** Ä‘á»ƒ Ä‘Æ°á»£c há»— trá»£ trá»±c tiáº¿p'],
};

function getReply(msg) {
  const m = msg.toLowerCase();
  if (m.includes('Ä‘áº·t') || m.includes('mua') || m.includes('book')) return BOT['dat ve'];
  if (m.includes('hoÃ n') || m.includes('há»§y') || m.includes('refund')) return BOT['hoan ve'];
  if (m.includes('pdf') || m.includes('xuáº¥t') || m.includes('in vÃ©')) return BOT['xuat ve'];
  if (m.includes('thanh toÃ¡n') || m.includes('payment') || m.includes('momo') || m.includes('qr')) return BOT['thanh toan'];
  if (m.includes('mÃ£') || m.includes('coupon') || m.includes('giáº£m') || m.includes('gift')) return BOT['ma giam gia'];
  if (m.includes('liÃªn há»‡') || m.includes('hotline') || m.includes('há»— trá»£') || m.includes('contact')) return BOT['lien he'];
  return BOT['default'];
}

const QUICK = ['CÃ¡ch Ä‘áº·t vÃ©?', 'ChÃ­nh sÃ¡ch hoÃ n vÃ©', 'PhÆ°Æ¡ng thá»©c thanh toÃ¡n', 'MÃ£ giáº£m giÃ¡', 'LiÃªn há»‡ há»— trá»£'];

// â”€â”€ Message bubble â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Bubble({ msg }) {
  const isBot = msg.from === 'bot' || msg.from === 'admin';
  const isAdmin = msg.from === 'admin';
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexDirection: isBot ? 'row' : 'row-reverse' }}>
      {isBot && (
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: isAdmin ? '#1a5c3a' : '#c9a84c', color: '#1a1510', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>
          {isAdmin ? 'ðŸ‘¨â€ðŸ’¼' : 'EH'}
        </div>
      )}
      <div style={{ maxWidth: '75%' }}>
        {isAdmin && <div style={{ fontSize: 10, color: '#1a5c3a', marginBottom: 3, fontWeight: 600 }}>Admin EventHub</div>}
        <div style={{ background: isBot ? (isAdmin ? '#f0fdf4' : '#f5f0e8') : '#1a1510', color: isBot ? '#1a1510' : '#faf7f2', padding: '10px 14px', borderRadius: isBot ? '4px 14px 14px 4px' : '14px 4px 4px 14px', fontSize: 12, lineHeight: 1.6, border: isBot ? '1px solid #e8dfc8' : 'none' }}>
          {msg.lines ? msg.lines.map((line, i) => {
            const parts = line.split(/\*\*(.*?)\*\*/g);
            return <p key={i} style={{ margin: i > 0 ? '4px 0 0' : 0 }}>{parts.map((p, j) => j % 2 === 1 ? <strong key={j} style={{ color: isBot ? '#c9a84c' : '#c9a84c' }}>{p}</strong> : p)}</p>;
          }) : <p style={{ margin: 0 }}>{msg.text}</p>}
        </div>
        <div style={{ fontSize: 10, color: '#8a7f72', marginTop: 3, textAlign: isBot ? 'left' : 'right' }}>{msg.time}</div>
      </div>
    </div>
  );
}

// â”€â”€ Notification Panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function NotifPanel({ notifs, onRead, onClose }) {
  return (
    <div style={{ position: 'fixed', top: 60, right: 16, width: 340, background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,.15)', zIndex: 999, overflow: 'hidden' }}>
      <div style={{ background: '#1a1510', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#c9a84c', fontSize: 12, fontWeight: 600, letterSpacing: 1 }}>ðŸ”” ThÃ´ng bÃ¡o</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onRead} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.5)', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit' }}>Äá»c táº¥t cáº£</button>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.5)', fontSize: 16, cursor: 'pointer' }}>Ã—</button>
        </div>
      </div>
      <div style={{ maxHeight: 360, overflowY: 'auto' }}>
        {notifs.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: '#8a7f72', fontSize: 13 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>ðŸ”•</div>ChÆ°a cÃ³ thÃ´ng bÃ¡o nÃ o
          </div>
        ) : notifs.map(n => (
          <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', background: n.is_read ? '#fff' : '#fffbeb', cursor: 'pointer', transition: 'background .2s' }}
            onMouseOver={e => e.currentTarget.style.background = '#faf7f2'}
            onMouseOut={e => e.currentTarget.style.background = n.is_read ? '#fff' : '#fffbeb'}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>
                {n.type === 'success' ? 'âœ…' : n.type === 'error' ? 'âŒ' : n.type === 'warning' ? 'âš ï¸' : 'ðŸ””'}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: n.is_read ? 400 : 700, color: '#1a1510', marginBottom: 2 }}>{n.title}</div>
                <div style={{ fontSize: 11, color: '#8a7f72', lineHeight: 1.4 }}>{n.message}</div>
                <div style={{ fontSize: 10, color: '#b0a898', marginTop: 4 }}>{new Date(n.created_at).toLocaleString('vi-VN')}</div>
              </div>
              {!n.is_read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#c9a84c', flexShrink: 0, marginTop: 4 }} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// â”€â”€ Main ChatBox â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function ChatBox() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('bot'); // bot | live
  const getInitBot = () => [{
    id: 1, from: 'bot', time: now(),
    lines: ['Xin chÃ o! TÃ´i lÃ  trá»£ lÃ½ **EventHub** ðŸ‘‹', 'TÃ´i cÃ³ thá»ƒ giÃºp báº¡n vá» Ä‘áº·t vÃ©, thanh toÃ¡n, hoÃ n vÃ© vÃ  nhiá»u hÆ¡n ná»¯a!', 'Báº¡n cáº§n há»— trá»£ gÃ¬ hÃ´m nay?']
  }];
  const getInitLive = () => [{
    id: 1, from: 'admin', time: now(),
    lines: ['Xin chÃ o! Admin EventHub Ä‘Ã¢y ðŸ‘¨â€ðŸ’¼', 'ChÃºng tÃ´i sáºµn sÃ ng há»— trá»£ báº¡n. HÃ£y Ä‘á»ƒ láº¡i tin nháº¯n!']
  }];

  const [messages, setMessages] = useState(getInitBot);
  const [liveMessages, setLiveMessages] = useState(getInitLive);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [notifUnread, setNotifUnread] = useState(0);
  const bottomRef = useRef();
  const inputRef = useRef();
  const pollRef = useRef();

  // Load chat history tá»« DB
  const loadChatHistory = async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/users/chat/history');
      const msgs = data.data || [];
      if (msgs.length > 0) {
        const formatted = msgs.map(m => ({
          id: 'db_' + m.id,
          from: m.is_support ? 'admin' : 'user',
          text: m.message,
          time: new Date(new Date(m.created_at).getTime() - 9*60*60*1000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' })
        }));
        setLiveMessages([...getInitLive(), ...formatted]);
      }
    } catch {}
  };

  // Load notifications
  const loadNotifs = async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/users/notifications');
      const list = data.data || [];
      setNotifs(list);
      setNotifUnread(list.filter(n => !n.is_read).length);
    } catch {}
  };

  useEffect(() => {
    setMessages(getInitBot());
    setLiveMessages(getInitLive());
    setOpen(false);
    loadNotifs();
    loadChatHistory();
    pollRef.current = setInterval(() => { loadNotifs(); loadChatHistory(); }, 10000);
    return () => clearInterval(pollRef.current);
  }, [user?.id]);

  useEffect(() => {
    if (open) { setUnread(0); setTimeout(() => inputRef.current?.focus(), 300); }
  }, [open]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, liveMessages, typing]);

  const readAll = async () => {
    try { await api.patch('/users/notifications/read-all'); loadNotifs(); } catch {}
  };

  const sendBot = (text) => {
    if (!text.trim()) return;
    setMessages(p => [...p, { id: Date.now(), from: 'user', text: text.trim(), time: now() }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(p => [...p, { id: Date.now() + 1, from: 'bot', lines: getReply(text), time: now() }]);
    }, 800 + Math.random() * 500);
  };

  const sendLive = async (text) => {
    if (!text.trim()) return;
    const msgObj = { id: Date.now(), from: 'user', text: text.trim(), time: now() };
    setLiveMessages(p => [...p, msgObj]);
    setInput('');

    // LÆ°u vÃ o DB
    try {
      await api.post('/users/chat/send', { message: text.trim() });
    } catch {}

    // Auto reply
    setTimeout(() => {
      setLiveMessages(p => [...p, {
        id: Date.now() + 1, from: 'admin', time: now(),
        lines: [
          `Xin chÃ o **${user?.name || 'báº¡n'}**! ðŸ‘¨â€ðŸ’¼`,
          'Tin nháº¯n cá»§a báº¡n Ä‘Ã£ Ä‘Æ°á»£c gá»­i Ä‘áº¿n Admin.',
          'ðŸ“§ Email: **long25251425Aa@gmail.com**',
          'ðŸ“ž Hotline: **0346094160**',
          'Admin sáº½ pháº£n há»“i trong **30 phÃºt**!'
        ]
      }]);
    }, 1500);
  };

  const send = tab === 'bot' ? sendBot : sendLive;
  const msgs = tab === 'bot' ? messages : liveMessages;

  return (
    <>
      {/* Notification bell - standalone */}
      {user && (
        <>
          <button onClick={() => setShowNotif(o => !o)}
            style={{ position: 'fixed', bottom: 96, right: 20, width: 44, height: 44, borderRadius: '50%', background: '#1a1510', border: '1px solid rgba(201,168,76,.3)', color: '#c9a84c', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 900, boxShadow: '0 4px 16px rgba(0,0,0,.3)', transition: 'all .2s' }}
            onMouseOver={e => e.currentTarget.style.background = '#c9a84c'}
            onMouseOut={e => e.currentTarget.style.background = '#1a1510'}>
            ðŸ””
            {notifUnread > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', color: '#fff', width: 18, height: 18, borderRadius: '50%', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{notifUnread > 9 ? '9+' : notifUnread}</span>
            )}
          </button>
          {showNotif && <NotifPanel notifs={notifs} onRead={readAll} onClose={() => setShowNotif(false)} />}
        </>
      )}

      {/* Chat FAB */}
      <button onClick={() => setOpen(o => !o)}
        style={{ position: 'fixed', bottom: 20, right: 20, width: 52, height: 52, borderRadius: '50%', background: open ? '#8b1a1a' : '#c9a84c', border: 'none', color: open ? '#fff' : '#1a1510', fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 900, boxShadow: '0 4px 20px rgba(201,168,76,.4)', transition: 'all .3s' }}>
        {open ? 'Ã—' : 'ðŸ’¬'}
        {!open && unread > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', color: '#fff', width: 18, height: 18, borderRadius: '50%', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{unread}</span>}
      </button>

      {/* Chat window */}
      {open && (
        <div style={{ position: 'fixed', bottom: 84, right: 20, width: 340, height: 500, background: '#fff', borderRadius: 12, boxShadow: '0 16px 48px rgba(0,0,0,.25)', zIndex: 900, display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #e8dfc8' }}>
          {/* Header */}
          <div style={{ background: '#1a1510', padding: '12px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>ðŸ’¬</div>
                <div>
                  <div style={{ color: '#faf7f2', fontSize: 13, fontWeight: 600 }}>EventHub Support</div>
                  <div style={{ color: '#c9a84c', fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                    Trá»±c tuyáº¿n Â· Pháº£n há»“i ngay
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.5)', fontSize: 20, cursor: 'pointer' }}>Ã—</button>
            </div>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4 }}>
              {[['bot', 'ðŸ¤– Trá»£ lÃ½ AI'], ['live', 'ðŸ‘¨â€ðŸ’¼ Live Support']].map(([t, l]) => (
                <button key={t} onClick={() => setTab(t)}
                  style={{ flex: 1, padding: '5px 8px', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', border: 'none', borderRadius: 4, background: tab === t ? '#c9a84c' : 'rgba(255,255,255,.1)', color: tab === t ? '#1a1510' : 'rgba(255,255,255,.7)', transition: 'all .2s' }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', background: '#faf7f2' }}>
            {msgs.map(m => <Bubble key={m.id} msg={m} />)}
            {typing && tab === 'bot' && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#1a1510' }}>EH</div>
                <div style={{ background: '#f5f0e8', border: '1px solid #e8dfc8', borderRadius: '4px 14px 14px 4px', padding: '12px 16px', display: 'flex', gap: 4, alignItems: 'center' }}>
                  {[0,1,2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#c9a84c', display: 'inline-block', animation: `bounce 1s ${i*0.2}s infinite` }} />)}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies - bot only */}
          {tab === 'bot' && (
            <div style={{ padding: '8px 12px', background: '#fff', borderTop: '1px solid #e8dfc8', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {QUICK.map(q => (
                <button key={q} onClick={() => sendBot(q)}
                  style={{ background: 'none', border: '1px solid #d4c8b0', color: '#8a7f72', padding: '4px 10px', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit', borderRadius: 12, transition: 'all .2s', whiteSpace: 'nowrap' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = '#c9a84c'; e.currentTarget.style.color = '#c9a84c'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = '#d4c8b0'; e.currentTarget.style.color = '#8a7f72'; }}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '10px 12px', background: '#fff', borderTop: '1px solid #e8dfc8', display: 'flex', gap: 8 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
              placeholder={tab === 'bot' ? 'Nháº­p cÃ¢u há»i...' : 'Nháº¯n tin vá»›i admin...'}
              ref={inputRef}
              style={{ flex: 1, border: '1px solid #d4c8b0', borderRadius: 20, padding: '8px 14px', fontSize: 12, outline: 'none', fontFamily: 'inherit', background: '#faf7f2', color: '#1a1510' }} />
            <button onClick={() => send(input)} disabled={!input.trim()}
              style={{ width: 36, height: 36, borderRadius: '50%', background: input.trim() ? '#c9a84c' : '#e8dfc8', border: 'none', color: '#1a1510', cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s', flexShrink: 0 }}>
              âž¤
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }`}</style>
    </>
  );
}





