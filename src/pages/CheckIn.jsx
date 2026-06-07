import React, { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function CheckIn() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const doCheckin = async (ticketCode) => {
    const c = (ticketCode || code).trim().toUpperCase();
    if (!c) { toast.error('Vui lòng nhập mã vé'); return; }
    setLoading(true); setResult(null);
    try {
      const { data } = await api.patch('/orders/checkin/' + c);
      setResult({ success: true, message: data.message, data: data.data });
      setHistory(h => [{ code: c, success: true, event: data.data?.event, time: new Date() }, ...h.slice(0, 19)]);
      setCode('');
      toast.success(data.message);
    } catch (e) {
      const msg = e.response?.data?.message || 'Mã vé không hợp lệ';
      setResult({ success: false, message: msg });
      setHistory(h => [{ code: c, success: false, message: msg, time: new Date() }, ...h.slice(0, 19)]);
      toast.error(msg);
    } finally { setLoading(false); }
  };

  const fmtTime = d => d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div>
      <div style={{ background: 'var(--dark)', padding: '40px 48px', borderBottom: '1px solid rgba(201,168,76,.1)' }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 8 }}>Quản lý sự kiện</div>
        <h1 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 32, fontWeight: 700, color: '#faf7f2' }}>Check-in QR</h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', marginTop: 6 }}>Quét hoặc nhập mã vé để check-in người tham dự</p>
      </div>

      <div className="section" style={{ maxWidth: 600 }}>
        {/* Input mã vé */}
        <div style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 4, padding: '24px', marginBottom: 20 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 16 }}>Nhập mã vé</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              className="field-input"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && doCheckin()}
              placeholder="VD: TKT-ABCD-1234"
              style={{ flex: 1, fontFamily: 'monospace', fontSize: 15, letterSpacing: 2 }}
              autoFocus
            />
            <button className="btn btn-gold" onClick={() => doCheckin()} disabled={loading} style={{ padding: '10px 24px', flexShrink: 0 }}>
              {loading ? '...' : '✓ Check-in'}
            </button>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 10 }}>
            💡 Nhấn <kbd style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '1px 6px', borderRadius: 3, fontSize: 11 }}>Enter</kbd> để check-in nhanh
          </div>
        </div>

        {/* Kết quả */}
        {result && (
          <div style={{ background: result.success ? 'rgba(26,92,58,.06)' : 'rgba(139,26,26,.06)', border: `1px solid ${result.success ? 'rgba(26,92,58,.25)' : 'rgba(139,26,26,.25)'}`, borderRadius: 4, padding: '18px 20px', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 32 }}>{result.success ? '✅' : '❌'}</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: result.success ? '#1a5c3a' : '#8b1a1a', marginBottom: 4 }}>{result.message}</div>
                {result.success && result.data && (
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                    🎫 Mã vé: <strong style={{ fontFamily: 'monospace', color: 'var(--gold)' }}>{result.data.ticketCode}</strong>
                    {result.data.event && ` · 📅 ${result.data.event}`}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Hướng dẫn */}
        <div style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 4, padding: '20px', marginBottom: 20 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 14 }}>Hướng dẫn sử dụng</div>
          {[
            ['📱', 'Scan QR', 'Dùng camera điện thoại quét QR → mã vé tự điền vào ô trên'],
            ['⌨️', 'Nhập tay', 'Gõ mã vé dạng TKT-XXXX-YYYY rồi nhấn Enter hoặc nút Check-in'],
            ['✅', 'Thành công', 'Hệ thống xác nhận ngay lập tức, chống duplicate tự động'],
            ['❌', 'Lỗi thường gặp', 'Vé đã check-in, vé bị hủy, hoặc mã vé không hợp lệ'],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <div style={{ fontSize: 20, flexShrink: 0 }}>{icon}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{title}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.6 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Lịch sử check-in */}
        {history.length > 0 && (
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase' }}>Lịch sử check-in ({history.length})</span>
              <span style={{ fontSize: 11, color: 'var(--gold)' }}>{history.filter(h => h.success).length} thành công</span>
            </div>
            {history.map((h, i) => (
              <div key={i} style={{ padding: '10px 18px', borderBottom: i < history.length - 1 ? '1px solid var(--border2)' : 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 16 }}>{h.success ? '✅' : '❌'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'monospace', fontSize: 13, letterSpacing: 1, color: h.success ? 'var(--gold)' : 'var(--text3)' }}>{h.code}</div>
                  {h.event && <div style={{ fontSize: 11, color: 'var(--text3)' }}>{h.event}</div>}
                  {!h.success && h.message && <div style={{ fontSize: 11, color: '#8b1a1a' }}>{h.message}</div>}
                </div>
                <span style={{ fontSize: 11, color: 'var(--text3)', flexShrink: 0 }}>{fmtTime(h.time)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
