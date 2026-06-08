import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const fmt = n => new Intl.NumberFormat('vi-VN').format(n || 0);

// ── Payment Methods ───────────────────────────────
const METHODS = [
  {
    id: 'qr_bank', label: 'QR Chuyển khoản', icon: '🏦', tag: 'Phổ biến',
    desc: 'Chuyển khoản ngân hàng qua mã QR', free: true,
    banks: ['MB Bank', 'Vietcombank', 'Techcombank', 'BIDV', 'VietinBank', 'ACB'],
  },
  {
    id: 'momo', label: 'MoMo', icon: '💜', tag: 'Nhanh nhất',
    desc: 'Payment qua ví MoMo', free: true,
  },
  {
    id: 'zalopay', label: 'ZaloPay', icon: '💙', tag: '',
    desc: 'Payment qua ví ZaloPay', free: true,
  },
  {
    id: 'vnpay', label: 'VNPay', icon: '🔵', tag: '',
    desc: 'Payment qua VNPay QR', free: true,
  },
  {
    id: 'card', label: 'Thẻ tín dụng / Ghi nợ', icon: '💳', tag: '',
    desc: 'Visa, Mastercard, JCB, Napas', free: false, fee: '1.5%',
  },
  {
    id: 'paypal', label: 'PayPal', icon: '🅿️', tag: 'Quốc tế',
    desc: 'Payment quốc tế qua PayPal', free: false, fee: '3.5%',
  },
  {
    id: 'stripe', label: 'Stripe', icon: '⚡', tag: '',
    desc: 'Payment quốc tế qua Stripe', free: false, fee: '2.9%',
  },
  {
    id: 'internet_banking', label: 'Internet Banking', icon: '🖥️', tag: '',
    desc: 'Login ngân hàng trực tuyến', free: true,
  },
];

// ── QR Modal ──────────────────────────────────────
function QRPaymentModal({ order, method, onClose, onSuccess }) {
  const [cd, setCd] = useState(600);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setCd(c => {
      if (c <= 1) { clearInterval(t); onClose(); return 0; }
      return c - 1;
    }), 1000);
    return () => clearInterval(t);
  }, []);

  const mm = String(Math.floor(cd / 60)).padStart(2, '0');
  const ss = String(cd % 60).padStart(2, '0');

  const BANK_INFO = {
    qr_bank: { bank: 'MB Bank', account: '1234567890', owner: 'EVENTHUB VN' },
    momo: { bank: 'MoMo', account: '0901234567', owner: 'EventHub' },
    zalopay: { bank: 'ZaloPay', account: '0901234568', owner: 'EventHub' },
    vnpay: { bank: 'VNPay', account: '9704001234567890', owner: 'EVENTHUB' },
  };

  const info = BANK_INFO[method?.id] || BANK_INFO.qr_bank;
  const qrData = `${info.bank}|${info.account}|${order.total}|${order.orderCode}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrData)}&bgcolor=ffffff&color=1a1510&margin=10`;

  const methodIcons = { momo: '💜', zalopay: '💙', vnpay: '🔵', qr_bank: '🏦' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 600, padding: 20 }}>
      <div style={{ background: '#fff', width: 440, maxWidth: '100%', borderRadius: 8, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,.4)' }}>
        {/* Header */}
        <div style={{ background: '#1a1510', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>{methodIcons[method?.id] || '💳'}</span>
            <span style={{ fontSize: 13, color: '#c9a84c', fontWeight: 600 }}>{method?.label || 'Payment'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'monospace', fontSize: 16, color: cd < 120 ? '#ef4444' : '#f59e0b', fontWeight: 700 }}>{mm}:{ss}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.5)', fontSize: 20, cursor: 'pointer' }}>×</button>
          </div>
        </div>

        <div style={{ padding: '20px 24px' }}>
          {/* QR Code */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <img src={qrUrl} alt="QR" style={{ border: '3px solid #f0e8d8', borderRadius: 8, display: 'block', margin: '0 auto' }} />
            <div style={{ fontSize: 11, color: '#8a7f72', marginTop: 8 }}>Quét mã QR bằng app {info.bank} hoặc Camera</div>
          </div>

          {/* Bank info */}
          <div style={{ background: '#faf7f2', border: '1px solid #e8dfc8', borderRadius: 6, padding: '12px 16px', marginBottom: 14 }}>
            {[
              ['Ngân hàng / Ví', info.bank],
              ['Số tài khoản', info.account],
              ['Chủ TK', info.owner],
              ['Số tiền', fmt(order.total) + 'đ'],
              ['Nội dung CK', order.orderCode],
            ].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid #e8dfc8', fontSize: 12 }}>
                <span style={{ color: '#8a7f72' }}>{l}</span>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, color: l === 'Số tiền' ? '#c9a84c' : '#1a1510', fontFamily: ['Số tài khoản','Nội dung CK','Số tiền'].includes(l) ? 'monospace' : 'inherit' }}>{v}</span>
                  {['Số tài khoản','Nội dung CK','Số tiền'].includes(l) && (
                    <button onClick={() => { navigator.clipboard.writeText(v.replace('đ','')); toast.success('Đã copy!'); }}
                      style={{ background: 'none', border: '1px solid #d4c8b0', padding: '1px 8px', fontSize: 10, cursor: 'pointer', borderRadius: 3, color: '#8a7f72', fontFamily: 'inherit' }}>Copy</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 4, padding: '8px 12px', fontSize: 11, color: '#92400e', marginBottom: 16 }}>
            ⚠️ Nhập đúng nội dung <strong>{order.orderCode}</strong> để hệ thống tự xác nhận.
          </div>
        </div>

        <div style={{ padding: '12px 20px', borderTop: '1px solid #e8dfc8', display: 'flex', gap: 10, background: '#f5f0e8' }}>
          <button onClick={onClose} style={{ flex: 1, background: 'none', border: '1px solid #d4c8b0', color: '#8a7f72', padding: 10, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', borderRadius: 4 }}>Hủy bỏ</button>
          <button onClick={() => { onSuccess(); onClose(); }}
            style={{ flex: 2, background: '#1a5c3a', border: 'none', color: '#fff', padding: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', borderRadius: 4 }}>
            ✓ Tôi đã thanh toán xong
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Card Payment Form ─────────────────────────────
function CardForm({ method, onPay, loading }) {
  const [f, setF] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  const formatCard = v => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
  const formatExpiry = v => { const d = v.replace(/\D/g,'').slice(0,4); return d.length > 2 ? d.slice(0,2)+'/'+d.slice(2) : d; };

  return (
    <div style={{ background: '#faf7f2', border: '1px solid #e8dfc8', borderRadius: 6, padding: '20px', marginTop: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1510', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        💳 {method.label}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          {['VISA','MC','JCB'].map(b => <span key={b} style={{ fontSize: 10, background: '#1a1510', color: '#fff', padding: '2px 6px', borderRadius: 3 }}>{b}</span>)}
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 10, color: '#8a7f72', marginBottom: 4, letterSpacing: 1 }}>SỐ THẺ</label>
        <input value={f.number} onChange={e => set('number', formatCard(e.target.value))}
          placeholder="0000 0000 0000 0000" maxLength={19}
          style={{ width: '100%', border: '1px solid #d4c8b0', borderRadius: 4, padding: '10px 12px', fontFamily: 'monospace', fontSize: 14, outline: 'none', letterSpacing: 2, background: '#fff', color: '#1a1510', boxSizing: 'border-box' }} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 10, color: '#8a7f72', marginBottom: 4, letterSpacing: 1 }}>TÊN CHỦ THẺ</label>
        <input value={f.name} onChange={e => set('name', e.target.value.toUpperCase())}
          placeholder="NGUYEN VAN A"
          style={{ width: '100%', border: '1px solid #d4c8b0', borderRadius: 4, padding: '10px 12px', fontFamily: 'inherit', fontSize: 13, outline: 'none', background: '#fff', color: '#1a1510', boxSizing: 'border-box' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 10, color: '#8a7f72', marginBottom: 4, letterSpacing: 1 }}>HẾT HẠN</label>
          <input value={f.expiry} onChange={e => set('expiry', formatExpiry(e.target.value))}
            placeholder="MM/YY" maxLength={5}
            style={{ width: '100%', border: '1px solid #d4c8b0', borderRadius: 4, padding: '10px 12px', fontFamily: 'monospace', fontSize: 14, outline: 'none', background: '#fff', color: '#1a1510', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 10, color: '#8a7f72', marginBottom: 4, letterSpacing: 1 }}>CVV</label>
          <input value={f.cvv} onChange={e => set('cvv', e.target.value.replace(/\D/g,'').slice(0,4))}
            placeholder="***" type="password" maxLength={4}
            style={{ width: '100%', border: '1px solid #d4c8b0', borderRadius: 4, padding: '10px 12px', fontFamily: 'monospace', fontSize: 14, outline: 'none', background: '#fff', color: '#1a1510', boxSizing: 'border-box' }} />
        </div>
      </div>
      <button onClick={() => onPay(f)} disabled={loading || !f.number || !f.name || !f.expiry || !f.cvv}
        style={{ width: '100%', background: '#1a1510', border: 'none', color: '#c9a84c', padding: 13, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 4, opacity: loading ? .6 : 1 }}>
        {loading ? 'Đang xử lý...' : '🔒 Payment an toàn'}
      </button>
      <div style={{ textAlign: 'center', fontSize: 10, color: '#8a7f72', marginTop: 8 }}>🔒 Mã hóa SSL 256-bit · PCI DSS Compliant</div>
    </div>
  );
}

// ── PayPal / Stripe ───────────────────────────────
function ExternalPayment({ method, amount, onPay, loading }) {
  const logos = { paypal: '🅿️', stripe: '⚡' };
  const colors = { paypal: '#003087', stripe: '#635bff' };
  return (
    <div style={{ background: '#faf7f2', border: '1px solid #e8dfc8', borderRadius: 6, padding: '20px', marginTop: 16, textAlign: 'center' }}>
      <div style={{ fontSize: 36, marginBottom: 8 }}>{logos[method.id]}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1510', marginBottom: 4 }}>{method.label}</div>
      <div style={{ fontSize: 12, color: '#8a7f72', marginBottom: 16 }}>{method.desc}</div>
      <div style={{ fontSize: 11, color: '#8a7f72', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 4, padding: '8px', marginBottom: 16 }}>
        Phí giao dịch: <strong>{method.fee}</strong> · Bạn sẽ trả: <strong>{fmt(Math.round(amount * (1 + parseFloat(method.fee)/100)))}đ</strong>
      </div>
      <button onClick={onPay} disabled={loading}
        style={{ background: colors[method.id], border: 'none', color: '#fff', padding: '12px 32px', fontSize: 13, fontWeight: 700, cursor: 'pointer', borderRadius: 4, width: '100%', opacity: loading ? .6 : 1 }}>
        {loading ? 'Đang chuyển hướng...' : `Payment qua ${method.label} →`}
      </button>
      <div style={{ fontSize: 10, color: '#8a7f72', marginTop: 8 }}>Bạn sẽ được chuyển đến trang {method.label} an toàn</div>
    </div>
  );
}

// ── Main Payment Page ─────────────────────────────
export default function Payment() {
  const location = useLocation();
  const nav = useNavigate();
  const { order } = location.state || {};

  const [method, setMethod] = useState(METHODS[0]);
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');
  const [couponType, setCouponType] = useState('');
  const [giftCode, setGiftCode] = useState('');
  const [giftDiscount, setGiftDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);

  useEffect(() => { if (!order) nav('/events'); }, [order]);
  if (!order) return null;

  const subtotal = order.total || 0;
  const totalDiscount = discount + giftDiscount;
  const finalTotal = Math.max(0, subtotal - totalDiscount);

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    try {
      const { data } = await api.post('/users/coupons/validate', { code: coupon, event_id: order.event_id, amount: subtotal });
      setDiscount(data.discount);
      setCouponMsg(data.message);
      setCouponType('coupon');
      toast.success(data.message);
    } catch (e) {
      setDiscount(0); setCouponMsg('');
      toast.error(e.response?.data?.message || 'Mã không hợp lệ');
    }
  };

  const applyGiftCode = async () => {
    if (!giftCode.trim()) return;
    // Demo: gift code GIFT50 giảm 50k, GIFT100 giảm 100k
    const gifts = { 'GIFT50': 50000, 'GIFT100': 100000, 'GIFT200': 200000, 'WELCOME': 30000 };
    const val = gifts[giftCode.toUpperCase()];
    if (val) {
      setGiftDiscount(val);
      toast.success(`🎁 Gift code áp dụng! Giảm ${fmt(val)}đ`);
    } else {
      toast.error('Gift code không hợp lệ');
    }
  };

  const handlePay = async (cardData) => {
    setLoading(true);
    try {
      // Order đã được tạo từ EventDetail, chỉ cần hiện QR
      const orderInfo = {
        orderCode: order.order_code || order.orderCode,
        total: finalTotal,
        event_name: order.event_name,
      };
      setPendingOrder(orderInfo);

      if (['qr_bank','momo','zalopay','vnpay','internet_banking'].includes(method.id)) {
        setShowQR(true);
      } else {
        // Thẻ/PayPal/Stripe - giả lập xử lý
        await new Promise(r => setTimeout(r, 1500));
        toast.success('🎉 Payment thành công! Admin sẽ xác nhận trong 24h.');
        nav('/my-tickets');
      }
    } catch (e) { toast.error(e.response?.data?.message || 'Lỗi thanh toán'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {showQR && pendingOrder && (
        <QRPaymentModal
          order={pendingOrder}
          method={method}
          onClose={() => { setShowQR(false); nav('/my-tickets'); }}
          onSuccess={() => { toast.success('✅ Đã ghi nhận! Admin sẽ xác nhận trong 24h.'); nav('/my-tickets'); }}
        />
      )}

      {/* Header */}
      <div style={{ background: 'var(--dark)', padding: '36px 48px', borderBottom: '1px solid rgba(201,168,76,.1)' }}>
        <button onClick={() => nav(-1)} style={{ background: 'none', border: '1px solid rgba(255,255,255,.2)', color: 'rgba(255,255,255,.7)', padding: '7px 16px', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', borderRadius: 4, marginBottom: 16 }}>← Back</button>
        <div style={{ fontSize: 10, letterSpacing: 4, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 8 }}>Bước cuối cùng</div>
        <h1 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 32, fontWeight: 700, color: '#faf7f2' }}>Payment</h1>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '36px 24px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 28, alignItems: 'start' }}>

        {/* LEFT - Payment methods */}
        <div>
          {/* Coupon & Gift Code */}
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 6, padding: '20px', marginBottom: 20 }}>
            <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 16 }}>🏷️ Coupon Code & Quà tặng</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 10, color: 'var(--text3)', marginBottom: 6, letterSpacing: 1 }}>MÃ COUPON / VOUCHER</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())} placeholder="VD: GIAM20"
                    style={{ flex: 1, background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 12px', fontSize: 12, fontFamily: 'monospace', outline: 'none', borderRadius: 4 }} />
                  <button onClick={applyCoupon} style={{ background: 'var(--dark)', border: '1px solid rgba(201,168,76,.3)', color: 'var(--gold)', padding: '8px 12px', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', borderRadius: 4, whiteSpace: 'nowrap' }}>Apply</button>
                </div>
                {couponMsg && <div style={{ fontSize: 11, color: '#1a5c3a', marginTop: 4 }}>✓ {couponMsg}</div>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, color: 'var(--text3)', marginBottom: 6, letterSpacing: 1 }}>GIFT CODE</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input value={giftCode} onChange={e => setGiftCode(e.target.value.toUpperCase())} placeholder="VD: GIFT100"
                    style={{ flex: 1, background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 12px', fontSize: 12, fontFamily: 'monospace', outline: 'none', borderRadius: 4 }} />
                  <button onClick={applyGiftCode} style={{ background: 'var(--dark)', border: '1px solid rgba(201,168,76,.3)', color: 'var(--gold)', padding: '8px 12px', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', borderRadius: 4, whiteSpace: 'nowrap' }}>Apply</button>
                </div>
                {giftDiscount > 0 && <div style={{ fontSize: 11, color: '#1a5c3a', marginTop: 4 }}>🎁 Giảm {fmt(giftDiscount)}đ</div>}
              </div>
            </div>
            <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 8 }}>Gift codes: GIFT50 · GIFT100 · GIFT200 · WELCOME</div>
          </div>

          {/* Method selection */}
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 6, padding: '20px' }}>
            <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 16 }}>💳 Phương thức thanh toán</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              {METHODS.map(m => (
                <div key={m.id} onClick={() => setMethod(m)}
                  style={{ border: `2px solid ${method.id === m.id ? 'var(--gold)' : 'var(--border)'}`, borderRadius: 6, padding: '12px', cursor: 'pointer', background: method.id === m.id ? 'rgba(201,168,76,.05)' : 'var(--bg2)', transition: 'all .2s', position: 'relative' }}>
                  {m.tag && <span style={{ position: 'absolute', top: -8, right: 8, background: 'var(--gold)', color: '#1a1510', fontSize: 8, fontWeight: 700, padding: '2px 6px', borderRadius: 10, letterSpacing: 1 }}>{m.tag}</span>}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>{m.icon}</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{m.label}</div>
                      <div style={{ fontSize: 10, color: 'var(--text3)' }}>{m.free ? 'Free' : `Phí ${m.fee}`}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Payment form based on method */}
            {['qr_bank','momo','zalopay','vnpay','internet_banking'].includes(method.id) && (
              <button onClick={() => handlePay()} disabled={loading}
                style={{ width: '100%', background: 'var(--gold)', border: 'none', color: '#1a1510', padding: 14, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 4, opacity: loading ? .6 : 1 }}>
                {loading ? 'Đang xử lý...' : `${method.icon} Payment ${fmt(finalTotal)}đ`}
              </button>
            )}
            {method.id === 'card' && <CardForm method={method} onPay={handlePay} loading={loading} />}
            {['paypal','stripe'].includes(method.id) && <ExternalPayment method={method} amount={finalTotal} onPay={() => handlePay()} loading={loading} />}
          </div>
        </div>

        {/* RIGHT - Order summary */}
        <div style={{ position: 'sticky', top: 80 }}>
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border2)', background: 'var(--dark)' }}>
              <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--gold)', textTransform: 'uppercase' }}>Tóm tắt đơn hàng</div>
            </div>
            <div style={{ padding: '16px 20px' }}>
              <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{order.event_name}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16 }}>{order.ticket_count || 1} vé · {order.ticket_type_name}</div>

              {[
                ['Tạm tính', fmt(subtotal) + 'đ'],
                ...(discount > 0 ? [['Coupon giảm', '- ' + fmt(discount) + 'đ']] : []),
                ...(giftDiscount > 0 ? [['Gift code giảm', '- ' + fmt(giftDiscount) + 'đ']] : []),
                ...(method.fee ? [['Phí thanh toán', method.fee]] : []),
              ].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8, color: v.startsWith('-') ? '#1a5c3a' : 'var(--text3)' }}>
                  <span>{l}</span><span style={{ fontWeight: v.startsWith('-') ? 700 : 400 }}>{v}</span>
                </div>
              ))}

              <div style={{ borderTop: '1px solid var(--border2)', paddingTop: 12, marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, letterSpacing: 1, color: 'var(--text3)', textTransform: 'uppercase' }}>Tổng thanh toán</span>
                <span style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 26, fontWeight: 300, color: 'var(--gold)' }}>{fmt(finalTotal)}đ</span>
              </div>

              {totalDiscount > 0 && (
                <div style={{ background: 'rgba(26,92,58,.08)', border: '1px solid rgba(26,92,58,.2)', borderRadius: 4, padding: '8px 12px', marginTop: 10, fontSize: 12, color: '#1a5c3a', textAlign: 'center' }}>
                  🎉 Bạn tiết kiệm được <strong>{fmt(totalDiscount)}đ</strong>!
                </div>
              )}
            </div>

            <div style={{ padding: '12px 20px', background: 'var(--bg2)', borderTop: '1px solid var(--border2)', fontSize: 10, color: 'var(--text3)', lineHeight: 1.7 }}>
              🔒 Payment được bảo mật bởi SSL 256-bit<br/>
              ✅ Vé sẽ gửi ngay sau khi admin xác nhận<br/>
              ♻️ Hoàn tiền trong 30 ngày theo chính sách
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
