import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const fmt = n => n === 0 ? 'Free' : new Intl.NumberFormat('vi-VN').format(n) + 'đ';
const fmtD = d => new Date(d).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
const fmtT = d => new Date(d).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

// ── Countdown ────────────────────────────────────────
function useCountdown(target) {
  const calc = () => {
    const diff = new Date(target) - new Date();
    if (diff <= 0) return null;
    return { d: Math.floor(diff / 86400000), h: Math.floor((diff % 86400000) / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) };
  };
  const [t, setT] = useState(calc);
  useEffect(() => { const id = setInterval(() => setT(calc()), 1000); return () => clearInterval(id); }, [target]);
  return t;
}

function CDItem({ v, l }) {
  return (
    <div style={{ textAlign: 'center', minWidth: 52, background: 'rgba(201,168,76,.08)', border: '1px solid rgba(201,168,76,.2)', borderRadius: 4, padding: '8px 10px' }}>
      <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 28, fontWeight: 300, color: 'var(--gold)', lineHeight: 1 }}>{String(v).padStart(2, '0')}</div>
      <div style={{ fontSize: 8, letterSpacing: 2, color: 'rgba(201,168,76,.5)', textTransform: 'uppercase', marginTop: 3 }}>{l}</div>
    </div>
  );
}

// ── QR Payment Modal ─────────────────────────────────
function QRModal({ order, onClose, onDone }) {
  const [cd, setCd] = useState(300);
  useEffect(() => {
    const t = setInterval(() => setCd(c => { if (c <= 1) { clearInterval(t); onClose(); return 0; } return c - 1; }), 1000);
    return () => clearInterval(t);
  }, []);
  const mm = String(Math.floor(cd / 60)).padStart(2, '0');
  const ss = String(cd % 60).padStart(2, '0');
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(order.orderCode)}&bgcolor=ffffff&color=1a1510&margin=8`;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, padding: 20 }}>
      <div style={{ background: '#ffffff', color: '#1a1510', width: 420, maxWidth: '100%', borderRadius: 4, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,.4)' }}>
        <div style={{ background: 'var(--dark)', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, letterSpacing: 2, color: 'var(--gold)', textTransform: 'uppercase' }}>Payment chuyển khoản</span>
          <span style={{ fontFamily: 'monospace', fontSize: 15, color: cd < 60 ? '#ff6b6b' : 'rgba(201,168,76,.7)' }}>{mm}:{ss}</span>
        </div>
        <div style={{ padding: '20px 24px', textAlign: 'center' }}>
          <img src={qr} alt="QR" style={{ border: '2px solid var(--border)', borderRadius: 4, marginBottom: 16, display: 'block', margin: '0 auto 16px' }} />
          <div style={{ background: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: 4, padding: '12px 16px', textAlign: 'left', marginBottom: 14 }}>
            {[['Ngân hàng', 'MB Bank'], ['Số tài khoản', '1234567890'], ['Chủ TK', 'EVENTHUB VN'], ['Số tiền', fmt(order.total)], ['Nội dung CK', order.orderCode]].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid var(--border2)', fontSize: 12 }}>
                <span style={{ color: 'var(--text3)' }}>{l}</span>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontFamily: ['Số tài khoản', 'Nội dung CK'].includes(l) ? 'monospace' : 'inherit', color: l === 'Số tiền' ? 'var(--gold)' : 'var(--text)' }}>{v}</span>
                  {['Số tài khoản', 'Nội dung CK', 'Số tiền'].includes(l) && (
                    <button onClick={() => { navigator.clipboard.writeText(v); toast.success('Đã copy!'); }} style={{ background: 'none', border: '1px solid var(--border)', padding: '1px 6px', fontSize: 10, cursor: 'pointer', borderRadius: 2, color: 'var(--text3)', fontFamily: 'inherit' }}>Copy</button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(201,168,76,.06)', border: '1px solid rgba(201,168,76,.2)', borderRadius: 4, padding: '9px 12px', fontSize: 11, color: '#7a5010', marginBottom: 16, textAlign: 'left' }}>
            ⚠ Nhập đúng nội dung <strong>{order.orderCode}</strong> để hệ thống tự xác nhận thanh toán.
          </div>
        </div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border2)', display: 'flex', gap: 10, background: 'var(--bg2)' }}>
          <button onClick={onClose} style={{ flex: 1, background: 'none', border: '1px solid var(--border)', color: 'var(--text)', padding: '10px', fontSize: 11, letterSpacing: 1.5, cursor: 'pointer', fontFamily: 'inherit', borderRadius: 4 }}>Hủy bỏ</button>
          <button onClick={onDone} style={{ flex: 2, background: 'var(--gold)', border: 'none', color: '#1a1510', padding: '10px', fontSize: 11, letterSpacing: 1.5, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, borderRadius: 4 }}>Tôi đã chuyển khoản xong ✓</button>
        </div>
      </div>
    </div>
  );
}

// ── Google Maps Embed ─────────────────────────────────
function GoogleMap({ address }) {
  const encoded = encodeURIComponent(address || 'Ho Chi Minh City Vietnam');
  return (
    <div style={{ borderRadius: 4, overflow: 'hidden', border: '1px solid var(--border2)' }}>
      <iframe
        title="Bản đồ địa điểm"
        src={`https://maps.google.com/maps?q=${encoded}&output=embed&z=15`}
        width="100%"
        height="260"
        style={{ border: 'none', display: 'block' }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <a href={`https://www.google.com/maps/search/?api=1&query=${encoded}`} target="_blank" rel="noopener noreferrer"
        style={{ display: 'block', padding: '9px 14px', background: 'var(--bg2)', fontSize: 11, color: 'var(--gold)', textDecoration: 'none', letterSpacing: 1, borderTop: '1px solid var(--border2)' }}>
        📍 Xem trên Google Maps →
      </a>
    </div>
  );
}

// ── Share Buttons ─────────────────────────────────────
function ShareButtons({ title, url }) {
  const full = url || window.location.href;
  const shares = [
    { label: 'Facebook', color: '#1877f2', icon: '📘', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(full)}` },
    { label: 'Twitter / X', color: '#000', icon: '🐦', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(full)}` },
    { label: 'Zalo', color: '#0068ff', icon: '💬', href: `https://zalo.me/share?url=${encodeURIComponent(full)}` },
    { label: 'Copy link', color: '#8a7f72', icon: '🔗', action: () => { navigator.clipboard.writeText(full); toast.success('Đã copy đường dẫn!'); } },
  ];
  return (
    <div>
      <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 10 }}>Chia sẻ sự kiện</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {shares.map(s => (
          <button key={s.label} onClick={() => s.action ? s.action() : window.open(s.href, '_blank')}
            style={{ background: 'none', border: `1px solid ${s.color}40`, color: s.color, padding: '6px 14px', fontSize: 11, letterSpacing: 1, cursor: 'pointer', borderRadius: 4, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5, transition: 'background .2s' }}
            onMouseOver={e => e.currentTarget.style.background = `${s.color}12`}
            onMouseOut={e => e.currentTarget.style.background = 'none'}>
            <span>{s.icon}</span> {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function EventDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState({});
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');
  const [booking, setBooking] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [isFav, setIsFav] = useState(false);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [reviewing, setReviewing] = useState(false);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    api.get(`/events/${id}`).then(r => {
      setEvent(r.data.data);
      setIsFav(r.data.data.isFavorite);
    }).catch(() => nav('/events')).finally(() => setLoading(false));
  }, [id]);

  const countdown = useCountdown(event?.start_date);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><div style={{ width: 36, height: 36, border: '2px solid var(--border)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin .8s linear infinite' }} /></div>;
  if (!event) return null;

  const left = event.capacity - event.sold;
  const pct = Math.round(event.sold / event.capacity * 100);
  const subtotal = (event.ticketTypes || []).reduce((s, tt) => s + tt.price * (qty[tt.id] || 0), 0);
  const total = Math.max(0, subtotal - discount);
  const hasItems = Object.values(qty).some(v => v > 0);

  const applyCode = async () => {
    if (!coupon.trim()) return;
    try {
      const { data } = await api.post('/users/coupons/validate', { code: coupon, event_id: event.id, amount: subtotal });
      setDiscount(data.discount);
      setCouponMsg(data.message);
      toast.success(data.message);
    } catch (e) {
      setCouponMsg('');
      setDiscount(0);
      toast.error(e.response?.data?.message || 'Mã không hợp lệ');
    }
  };

  const book = async () => {
    if (!user) { toast.error('Vui lòng đăng nhập'); nav('/login'); return; }
    if (user.role === 'admin') { toast.error('Admin không thể đặt vé'); return; }
    if (!hasItems) { toast.error('Vui lòng chọn ít nhất 1 vé'); return; }
    setBooking(true);
    try {
      const items = Object.entries(qty).filter(([, v]) => v > 0).map(([id, quantity]) => ({ ticket_type_id: parseInt(id), quantity }));
      const { data } = await api.post('/orders', { event_id: event.id, items, coupon_code: coupon || undefined });
      const orderData = data.data;
      if (total > 0) {
        // Chuyển sang trang thanh toán
        nav('/payment', { state: {
          order: {
            ...orderData,
            event_name: event.name || event.title,
            event_id: event.id,
            ticket_type_name: items.map(i => {
              const tt = event.ticketTypes?.find(t => t.id === i.ticket_type_id);
              return tt?.name || 'Vé thường';
            }).join(', '),
            ticket_count: items.reduce((s, i) => s + i.quantity, 0),
            total: total,
          }
        }});
      } else {
        // Vé miễn phí - không cần thanh toán
        toast.success('🎉 Register thành công!');
        nav('/my-tickets');
      }
    } catch (e) { toast.error(e.response?.data?.message || 'Đặt vé thất bại'); }
    finally { setBooking(false); }
  };

  const submitReview = async () => {
    if (!user) { toast.error('Vui lòng đăng nhập'); return; }
    setReviewing(true);
    try {
      await api.post(`/events/${event.id}/review`, review);
      toast.success('Cảm ơn bạn đã đánh giá!');
    } catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
    finally { setReviewing(false); }
  };

  const TABS = [
    { k: 'about', l: 'Giới thiệu' },
    { k: 'agenda', l: 'Schedule' },
    { k: 'speakers', l: 'Diễn giả' },
    { k: 'reviews', l: `Đánh giá (${event.review_count || 0})` },
  ];

  return (
    <div>
      {showQR && pendingOrder && (
        <QRModal order={pendingOrder} onClose={() => { setShowQR(false); nav('/my-tickets'); }}
          onDone={() => { setShowQR(false); toast.success('Đã ghi nhận! Admin sẽ xác nhận trong 24h.'); nav('/my-tickets'); }} />
      )}

      {/* ── 1. BANNER ─────────────────────────── */}
      <div style={{ background: 'var(--dark)', position: 'relative', overflow: 'hidden', borderBottom: '1px solid rgba(201,168,76,.1)', minHeight: 300 }}>
        {event.banner && <img src={event.banner} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: .25 }} />}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,.2) 0%, rgba(13,10,5,.95) 100%)' }} />
        <div style={{ position: 'relative', padding: '40px 48px 36px' }}>
          <button onClick={() => nav(-1)} style={{ background: 'none', border: '1px solid rgba(255,255,255,.2)', color: 'rgba(255,255,255,.7)', padding: '7px 16px', fontSize: 11, letterSpacing: 1.5, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 24, borderRadius: 4 }}>← Back</button>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
            {event.category_name && <span style={{ background: event.category_color || '#7c3aed', color: '#fff', fontSize: 10, letterSpacing: 2, padding: '4px 12px', borderRadius: 2, fontWeight: 600 }}>{event.category_name.toUpperCase()}</span>}
            {event.is_featured && <span style={{ background: 'var(--gold)', color: '#1a1510', fontSize: 10, letterSpacing: 2, padding: '4px 10px', borderRadius: 2, fontWeight: 700 }}>NỔI BẬT</span>}
            {event.is_online && <span style={{ background: 'rgba(37,99,235,.8)', color: '#fff', fontSize: 10, letterSpacing: 2, padding: '4px 10px', borderRadius: 2 }}>ONLINE</span>}
            <span style={{ background: 'none', border: `1px solid ${left > 0 ? 'rgba(26,92,58,.5)' : 'rgba(139,26,26,.5)'}`, color: left > 0 ? '#4ade80' : '#f87171', fontSize: 10, letterSpacing: 2, padding: '4px 10px', borderRadius: 2 }}>
              {left > 0 ? `🎫 Còn ${left} vé` : '❌ Sold Out'}
            </span>
          </div>

          <h1 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 44, fontWeight: 700, color: '#faf7f2', lineHeight: 1.15, marginBottom: 16, maxWidth: 760 }}>{event.title}</h1>

          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 18 }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,.65)', display: 'flex', alignItems: 'center', gap: 6 }}>📅 {fmtD(event.start_date)} · {fmtT(event.start_date)}</span>
            {event.end_date && <span style={{ fontSize: 13, color: 'rgba(255,255,255,.65)', display: 'flex', alignItems: 'center', gap: 6 }}>⏱ Kết thúc: {fmtT(event.end_date)}</span>}
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,.65)', display: 'flex', alignItems: 'center', gap: 6 }}>📍 {event.is_online ? 'Trực tuyến' : `${event.venue_name}${event.venue_address ? `, ${event.venue_address}` : ''}`}</span>
            {event.avg_rating > 0 && <span style={{ fontSize: 13, color: 'rgba(255,255,255,.65)', display: 'flex', alignItems: 'center', gap: 4 }}>⭐ {event.avg_rating} ({event.review_count} đánh giá)</span>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {event.organizer_avatar && <img src={event.organizer_avatar} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />}
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,.45)' }}>Tổ chức bởi <strong style={{ color: 'rgba(255,255,255,.8)' }}>{event.organizer_name}</strong></span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,.4)' }}>· 👁 {event.view_count || 0} views</span>
            <button onClick={async () => {
              if (!user) { toast.error('Vui lòng đăng nhập'); return; }
              const { data } = await api.post(`/events/${event.id}/favorite`).catch(() => ({ data: { isFavorite: isFav } }));
              setIsFav(data.isFavorite);
              toast.success(data.isFavorite ? 'Đã thêm yêu thích ❤️' : 'Đã bỏ yêu thích');
            }} style={{ marginLeft: 'auto', background: 'none', border: `1px solid ${isFav ? '#ff6b6b44' : 'rgba(255,255,255,.2)'}`, color: isFav ? '#ff6b6b' : 'rgba(255,255,255,.5)', padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', borderRadius: 4 }}>
              {isFav ? '❤️ Đã yêu thích' : '🤍 Yêu thích'}
            </button>
          </div>
        </div>
      </div>

      {/* ── BODY ─────────────────────────────── */}
      <div style={{ padding: '40px 48px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'start', maxWidth: 1280, margin: '0 auto' }}>

        {/* LEFT */}
        <div>
          {/* ── 2. THUMBNAIL ─────────────────── */}
          {event.thumbnail && (
            <img src={event.thumbnail} alt={event.title} style={{ width: '100%', maxHeight: 380, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--border)', marginBottom: 28 }} />
          )}

          {/* ── COUNTDOWN ────────────────────── */}
          {countdown && (
            <div style={{ background: 'var(--bg3)', border: '1px solid rgba(201,168,76,.2)', borderRadius: 4, padding: '18px 20px', marginBottom: 20 }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 12 }}>⏳ Events bắt đầu sau</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <CDItem v={countdown.d} l="Days" />
                <div style={{ fontSize: 24, color: 'rgba(201,168,76,.3)', alignSelf: 'center', fontFamily: 'Cormorant Garamond,serif' }}>:</div>
                <CDItem v={countdown.h} l="Hours" />
                <div style={{ fontSize: 24, color: 'rgba(201,168,76,.3)', alignSelf: 'center', fontFamily: 'Cormorant Garamond,serif' }}>:</div>
                <CDItem v={countdown.m} l="Minutes" />
                <div style={{ fontSize: 24, color: 'rgba(201,168,76,.3)', alignSelf: 'center', fontFamily: 'Cormorant Garamond,serif' }}>:</div>
                <CDItem v={countdown.s} l="Seconds" />
              </div>
            </div>
          )}

          {/* ── TABS ─────────────────────────── */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 24, overflowX: 'auto' }}>
            {TABS.map(t => (
              <button key={t.k} onClick={() => setActiveTab(t.k)}
                style={{ background: 'none', border: 'none', borderBottom: activeTab === t.k ? '2px solid var(--gold)' : '2px solid transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', padding: '11px 20px', color: activeTab === t.k ? 'var(--gold)' : 'var(--text3)', marginBottom: -1, whiteSpace: 'nowrap' }}>
                {t.l}
              </button>
            ))}
          </div>

          {/* ── 3. ABOUT / MÔ TẢ ─────────────── */}
          {activeTab === 'about' && (
            <div>
              {/* Description */}
              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 4, padding: '22px 24px', marginBottom: 20 }}>
                <div style={{ fontSize: 10, letterSpacing: 3, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 20, height: 1, background: 'var(--gold)', display: 'inline-block' }} />Description sự kiện
                </div>
                <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>{event.description || 'Chưa có mô tả.'}</p>
              </div>

              {/* Nhà tổ chức */}
              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 4, padding: '20px 24px', marginBottom: 20 }}>
                <div style={{ fontSize: 10, letterSpacing: 3, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 20, height: 1, background: 'var(--gold)', display: 'inline-block' }} />Nhà tổ chức
                </div>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  {event.organizer_avatar ? <img src={event.organizer_avatar} alt="" style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} /> : <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(201,168,76,.1)', border: '1px solid rgba(201,168,76,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'var(--gold)', fontWeight: 700 }}>{event.organizer_name?.[0]}</div>}
                  <div>
                    <div style={{ fontSize: 16, fontFamily: 'Cormorant Garamond,serif', fontWeight: 700 }}>{event.organizer_name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{event.organizer_email}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Ban tổ chức chuyên nghiệp</div>
                  </div>
                </div>
              </div>

              {/* Location + Google Maps */}
              {!event.is_online && (event.venue_name || event.venue_address) && (
                <div style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 4, padding: '20px 24px', marginBottom: 20 }}>
                  <div style={{ fontSize: 10, letterSpacing: 3, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 20, height: 1, background: 'var(--gold)', display: 'inline-block' }} />Location tổ chức
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                    <span style={{ fontSize: 24 }}>📍</span>
                    <div>
                      {event.venue_name && <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 3 }}>{event.venue_name}</div>}
                      {event.venue_address && <div style={{ fontSize: 13, color: 'var(--text3)' }}>{event.venue_address}</div>}
                    </div>
                  </div>
                  <GoogleMap address={`${event.venue_name || ''} ${event.venue_address || ''}`} />
                </div>
              )}

              {event.is_online && event.online_url && (
                <div style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 4, padding: '20px 24px', marginBottom: 20 }}>
                  <div style={{ fontSize: 10, letterSpacing: 3, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 12 }}>Link tham dự trực tuyến</div>
                  <a href={event.online_url} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', fontSize: 13, wordBreak: 'break-all' }}>{event.online_url}</a>
                </div>
              )}

              {/* FAQ */}
              {event.faq?.length > 0 && (
                <div style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 4, padding: '20px 24px', marginBottom: 20 }}>
                  <div style={{ fontSize: 10, letterSpacing: 3, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 20, height: 1, background: 'var(--gold)', display: 'inline-block' }} />FAQ
                  </div>
                  {event.faq.map((f, i) => (
                    <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid var(--border2)' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>❓ {f.q}</div>
                      <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{f.a}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Điều khoản + Refund Policy */}
              {(event.refund_policy || event.terms) && (
                <div style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 4, padding: '20px 24px', marginBottom: 20 }}>
                  <div style={{ fontSize: 10, letterSpacing: 3, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 20, height: 1, background: 'var(--gold)', display: 'inline-block' }} />Điều khoản & Chính sách
                  </div>
                  {event.refund_policy && (
                    <>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>♻️ Refund Policy</div>
                      <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 14 }}>{event.refund_policy}</p>
                    </>
                  )}
                  {event.terms && (
                    <>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>📋 Điều khoản tham dự</div>
                      <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>{event.terms}</p>
                    </>
                  )}
                </div>
              )}

              {/* Share */}
              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 4, padding: '20px 24px', marginBottom: 20 }}>
                <ShareButtons title={event.title} />
              </div>
            </div>
          )}

          {/* ── 4. AGENDA / TIMELINE ─────────── */}
          {activeTab === 'agenda' && (
            <div style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 4, padding: '22px 24px' }}>
              {!event.agenda?.length ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text3)', fontSize: 13 }}>Chưa có lịch trình chương trình.</div>
              ) : (
                <div style={{ position: 'relative', paddingLeft: 24 }}>
                  <div style={{ position: 'absolute', left: 7, top: 0, bottom: 0, width: 2, background: 'var(--border)' }} />
                  {event.agenda.map((a, i) => (
                    <div key={i} style={{ position: 'relative', paddingBottom: 24 }}>
                      <div style={{ position: 'absolute', left: -24, top: 4, width: 14, height: 14, borderRadius: '50%', background: 'var(--gold)', border: '2px solid var(--bg3)', boxSizing: 'border-box' }} />
                      {a.time && <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--gold)', fontWeight: 700, marginBottom: 4, letterSpacing: 1 }}>{a.time}</div>}
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 4, fontFamily: 'Cormorant Garamond,serif' }}>{a.title}</div>
                      {a.desc && <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.6 }}>{a.desc}</div>}
                      {a.speaker && <div style={{ fontSize: 11, color: 'var(--gold)', marginTop: 4 }}>👤 {a.speaker}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── 5. SPEAKERS ──────────────────── */}
          {activeTab === 'speakers' && (
            <div>
              {!event.speakers?.length ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text3)', fontSize: 13 }}>Chưa có thông tin diễn giả.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16 }}>
                  {event.speakers.map(s => (
                    <div key={s.id} style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 4, padding: '20px', textAlign: 'center' }}>
                      {s.avatar ? <img src={s.avatar} alt="" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px', border: '2px solid var(--border)', display: 'block' }} /> : <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(201,168,76,.1)', border: '1px solid rgba(201,168,76,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: 'var(--gold)', margin: '0 auto 12px', fontWeight: 700 }}>{s.name[0]}</div>}
                      <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Cormorant Garamond,serif', marginBottom: 4 }}>{s.name}</div>
                      {s.title && <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: 1, marginBottom: 8 }}>{s.title}</div>}
                      {s.bio && <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.6 }}>{s.bio}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── 6. REVIEWS & BÌNH LUẬN ───────── */}
          {activeTab === 'reviews' && (
            <div>
              {event.avg_rating > 0 && (
                <div style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 4, padding: '20px 24px', marginBottom: 20, display: 'flex', gap: 24, alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 56, fontWeight: 300, color: 'var(--gold)', lineHeight: 1 }}>{event.avg_rating}</div>
                    <div style={{ fontSize: 18, color: '#f59e0b', marginTop: 4 }}>{'★'.repeat(Math.round(event.avg_rating))}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{event.review_count} đánh giá</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    {[5, 4, 3, 2, 1].map(n => {
                      const c = (event.reviews || []).filter(r => r.rating === n).length;
                      const pct2 = event.review_count > 0 ? Math.round(c / event.review_count * 100) : 0;
                      return (
                        <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                          <span style={{ fontSize: 11, color: '#f59e0b', minWidth: 16 }}>{'★'.repeat(n)}</span>
                          <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: pct2 + '%', height: '100%', background: '#f59e0b', borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--text3)', minWidth: 28 }}>{pct2}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Danh sách reviews */}
              {(event.reviews || []).map(r => (
                <div key={r.id} style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 4, padding: '16px 20px', marginBottom: 12, display: 'flex', gap: 12 }}>
                  {r.user_avatar ? <img src={r.user_avatar} alt="" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} /> : <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(201,168,76,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: 'var(--gold)', flexShrink: 0 }}>{r.user_name?.[0]}</div>}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{r.user_name}</span>
                      <span style={{ fontSize: 13, color: '#f59e0b' }}>{'★'.repeat(r.rating)}</span>
                      <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 'auto' }}>{new Date(r.created_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                    {r.comment && <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.65 }}>{r.comment}</p>}
                  </div>
                </div>
              ))}

              {/* Form đánh giá */}
              {user && user.role !== 'admin' && (
                <div style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 4, padding: '20px 24px', marginTop: 16 }}>
                  <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 14 }}>Viết đánh giá của bạn</div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <button key={s} onClick={() => setReview(r => ({ ...r, rating: s }))} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: s <= review.rating ? '#f59e0b' : 'var(--border)', transition: 'color .15s' }}>★</button>
                    ))}
                    <span style={{ fontSize: 12, color: 'var(--text3)', alignSelf: 'center', marginLeft: 6 }}>{['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Xuất sắc'][review.rating]}</span>
                  </div>
                  <textarea style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '10px 14px', fontFamily: 'inherit', fontSize: 13, outline: 'none', resize: 'vertical', minHeight: 80, borderRadius: 4, marginBottom: 12 }}
                    placeholder="Chia sẻ cảm nhận của bạn về sự kiện này..."
                    value={review.comment} onChange={e => setReview(r => ({ ...r, comment: e.target.value }))} />
                  <button onClick={submitReview} disabled={reviewing} style={{ background: 'var(--dark)', border: '1px solid rgba(201,168,76,.3)', color: 'var(--gold)', padding: '9px 24px', fontSize: 11, letterSpacing: 1.5, cursor: 'pointer', fontFamily: 'inherit', borderRadius: 4, opacity: reviewing ? .6 : 1 }}>
                    {reviewing ? 'Đang gửi...' : 'Send đánh giá'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT — Sticky booking panel */}
        <div style={{ position: 'sticky', top: 'calc(64px + 16px)' }}>
          {/* Vé còn lại */}
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 4, overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border2)' }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 10 }}>Thông tin vé</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>📅 {fmtD(event.start_date)} · {fmtT(event.start_date)}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10 }}>📍 {event.is_online ? 'Trực tuyến' : event.venue_name}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text3)', marginBottom: 5 }}>
                <span>{event.sold}/{event.capacity} vé sold</span>
                <span style={{ color: pct >= 80 ? '#8b1a1a' : 'var(--text3)' }}>{pct}% {pct >= 80 ? '🔥 Sắp hết!' : ''}</span>
              </div>
              <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: pct + '%', background: pct >= 100 ? '#8b1a1a' : pct >= 70 ? '#8b5e00' : 'var(--gold)', borderRadius: 2, transition: 'width .5s' }} />
              </div>
            </div>

            {/* Ticket types */}
            {(event.ticketTypes || []).map(tt => {
              const rem = tt.quantity - tt.sold;
              const maxQ = Math.min(tt.max_per_order || 5, rem);
              return (
                <div key={tt.id} style={{ padding: '14px 20px', borderBottom: '1px solid var(--border2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{tt.name}</div>
                      {tt.description && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>{tt.description}</div>}
                      <div style={{ fontSize: 10, color: rem <= 5 ? '#8b5e00' : 'var(--text3)', marginTop: 2 }}>{rem <= 5 ? `⚠ Còn ${rem} vé` : `${rem} vé còn lại`}</div>
                    </div>
                    <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 19, fontWeight: 300 }}>{fmt(tt.price)}</div>
                  </div>
                  {rem > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                      <button onClick={() => setQty(q => ({ ...q, [tt.id]: Math.max(0, (q[tt.id] || 0) - 1) }))} style={{ width: 28, height: 28, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)' }}>−</button>
                      <span style={{ minWidth: 24, textAlign: 'center', fontSize: 14, fontWeight: 700 }}>{qty[tt.id] || 0}</span>
                      <button onClick={() => setQty(q => ({ ...q, [tt.id]: Math.min(maxQ, (q[tt.id] || 0) + 1) }))} style={{ width: 28, height: 28, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)' }}>+</button>
                    </div>
                  ) : <span style={{ fontSize: 10, letterSpacing: 2, color: '#8b1a1a', background: 'rgba(139,26,26,.08)', border: '1px solid rgba(139,26,26,.2)', padding: '3px 10px', borderRadius: 2 }}>HẾT VÉ</span>}
                </div>
              );
            })}

            {/* Coupon */}
            {hasItems && subtotal > 0 && (
              <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border2)' }}>
                <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 8 }}>Coupon Code</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())} placeholder="Nhập mã..." style={{ flex: 1, background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 12px', fontSize: 12, fontFamily: 'monospace', outline: 'none', borderRadius: 4 }} />
                  <button onClick={applyCode} style={{ background: 'var(--dark)', border: '1px solid rgba(201,168,76,.3)', color: 'var(--gold)', padding: '8px 14px', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', borderRadius: 4, whiteSpace: 'nowrap' }}>Apply</button>
                </div>
                {couponMsg && <div style={{ fontSize: 11, color: '#1a5c3a', marginTop: 5 }}>✓ {couponMsg}</div>}
              </div>
            )}

            {/* Total */}
            {hasItems && (
              <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border2)' }}>
                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: 'var(--text3)' }}>Discount</span>
                    <span style={{ color: '#1a5c3a' }}>− {fmt(discount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, letterSpacing: 1.5, color: 'var(--text3)', textTransform: 'uppercase' }}>Tổng thanh toán</span>
                  <span style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 24, fontWeight: 300 }}>{fmt(total)}</span>
                </div>
              </div>
            )}

            {/* CTA */}
            {left > 0 ? (
              <div style={{ padding: '16px 20px' }}>
                {total > 0 && <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 12, padding: '8px 10px', background: 'rgba(201,168,76,.06)', border: '1px solid rgba(201,168,76,.15)', borderRadius: 4 }}>📱 Sau khi đặt, màn hình QR chuyển khoản sẽ hiện ra.</div>}
                <button onClick={book} disabled={booking || !hasItems} style={{ width: '100%', padding: 13, background: booking || !hasItems ? 'rgba(201,168,76,.4)' : 'var(--gold)', border: 'none', color: '#1a1510', fontFamily: 'inherit', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, cursor: booking || !hasItems ? 'not-allowed' : 'pointer', borderRadius: 4 }}>
                  {booking ? 'Đang xử lý...' : total > 0 ? 'Đặt vé & Payment' : 'Đặt vé miễn phí'}
                </button>
              </div>
            ) : (
              <div style={{ padding: '16px 20px', textAlign: 'center', fontSize: 11, letterSpacing: 3, color: '#8b1a1a', background: 'rgba(139,26,26,.04)', textTransform: 'uppercase' }}>Events đã hết vé</div>
            )}
          </div>

          {/* Share nhỏ */}
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 4, padding: '16px 20px' }}>
            <ShareButtons title={event.title} />
          </div>
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @media(max-width:900px){.event-grid{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}
