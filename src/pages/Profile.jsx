import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const fmt = n => new Intl.NumberFormat('vi-VN').format(n || 0);
const fmtD = d => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

const TABS = [
  { k: 'info', label: 'Thông tin cá nhân', icon: '👤' },
  { k: 'password', label: 'Change Password', icon: '🔐' },
  { k: 'favorites', label: 'Events yêu thích', icon: '❤️' },
  { k: 'history', label: 'Lịch sử thanh toán', icon: '📜' },
  { k: 'security', label: 'Bảo mật', icon: '🛡' },
];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('info');
  const [f, setF] = useState({ name: user?.name || '', phone: user?.phone || '', avatar: user?.avatar || '' });
  const [pw, setPw] = useState({ current: '', newPw: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingFav, setLoadingFav] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (tab === 'favorites' && !favorites.length) {
      setLoadingFav(true);
      api.get('/users/favorites').then(r => setFavorites(r.data.data || [])).catch(() => {}).finally(() => setLoadingFav(false));
    }
    if (tab === 'history' && !orders.length) {
      setLoadingOrders(true);
      api.get('/orders/my/orders').then(r => setOrders(r.data.data || [])).catch(() => {}).finally(() => setLoadingOrders(false));
    }
  }, [tab]);

  const saveProfile = async e => {
    e.preventDefault(); setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', f);
      updateUser(data.user);
      toast.success('Update Information thành công!');
    } catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
    finally { setSaving(false); }
  };

  const savePw = async e => {
    e.preventDefault();
    if (pw.newPw !== pw.confirm) { toast.error('Password mới không khớp'); return; }
    setPwSaving(true);
    try {
      await api.put('/auth/change-password', { currentPassword: pw.current, newPassword: pw.newPw });
      toast.success('Change Password thành công!');
      setPw({ current: '', newPw: '', confirm: '' });
    } catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
    finally { setPwSaving(false); }
  };

  const handleImg = e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image(); img.onload = () => {
        const canvas = document.createElement('canvas'); const MAX = 200;
        let w2 = img.width, h2 = img.height;
        if (w2 > MAX) { h2 = Math.round(h2 * MAX / w2); w2 = MAX; }
        canvas.width = w2; canvas.height = h2;
        canvas.getContext('2d').drawImage(img, 0, 0, w2, h2);
        setF(prev => ({ ...prev, avatar: canvas.toDataURL('image/jpeg', 0.8) }));
      }; img.src = ev.target.result;
    }; reader.readAsDataURL(file);
  };

  const removeFavorite = async eventId => {
    try {
      await api.post(`/events/${eventId}/favorite`);
      setFavorites(prev => prev.filter(e => e.id !== eventId));
      toast.success('Đã bỏ yêu thích');
    } catch { toast.error('Lỗi'); }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ background: 'var(--dark)', padding: '40px 48px', borderBottom: '1px solid rgba(201,168,76,.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ position: 'relative' }}>
            {f.avatar
              ? <img src={f.avatar} alt="" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(201,168,76,.3)' }} />
              : <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(201,168,76,.15)', border: '2px solid rgba(201,168,76,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: 'var(--gold)', fontWeight: 700 }}>
                  {user?.name?.[0]?.toUpperCase()}
                </div>
            }
            <label style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, background: 'var(--gold)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 12 }}>
              📷<input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImg} />
            </label>
          </div>
          <div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 700, color: '#faf7f2' }}>{user?.name}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', marginTop: 3 }}>{user?.email}</div>
            <span style={{ marginTop: 8, display: 'inline-block', fontSize: 9, letterSpacing: 2, padding: '3px 10px', borderRadius: 2, textTransform: 'uppercase', fontWeight: 600, ...(user?.role === 'admin' ? { background: 'rgba(201,168,76,.15)', color: 'var(--gold)', border: '1px solid rgba(201,168,76,.3)' } : user?.role === 'organizer' ? { background: 'rgba(37,99,235,.15)', color: '#60a5fa', border: '1px solid rgba(37,99,235,.3)' } : { background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.5)', border: '1px solid rgba(255,255,255,.1)' }) }}>
              {user?.role === 'admin' ? 'Admin' : user?.role === 'organizer' ? 'Organizer' : 'Member'}
            </span>
          </div>
        </div>
      </div>

      <div className="section" style={{ padding: '40px 48px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 32, overflowX: 'auto' }}>
          {TABS.map(t => (
            <button key={t.k} onClick={() => setTab(t.k)}
              style={{ background: 'none', border: 'none', borderBottom: tab === t.k ? '2px solid var(--gold)' : '2px solid transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', padding: '12px 20px', color: tab === t.k ? 'var(--gold)' : 'var(--text3)', marginBottom: -1, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', transition: 'color .2s' }}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        {/* Tab: Thông tin cá nhân */}
        {tab === 'info' && (
          <form onSubmit={saveProfile} style={{ maxWidth: 480 }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                {f.avatar
                  ? <img src={f.avatar} alt="" style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} />
                  : <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'var(--bg2)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: 'var(--text3)' }}>
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                }
              </div>
              <div style={{ marginTop: 10 }}>
                <label className="btn btn-dark btn-sm" style={{ cursor: 'pointer' }}>
                  📷 Thay ảnh đại diện
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImg} />
                </label>
                {f.avatar && <button type="button" onClick={() => setF(p => ({ ...p, avatar: '' }))} style={{ marginLeft: 8, background: 'none', border: 'none', color: '#8b1a1a', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>× Xóa ảnh</button>}
              </div>
            </div>
            <div className="field">
              <label className="field-label">Full Name</label>
              <input className="field-input" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} required placeholder="Nguyễn Văn An" />
            </div>
            <div className="field">
              <label className="field-label">Email</label>
              <input className="field-input" value={user?.email || ''} disabled style={{ opacity: .5, cursor: 'not-allowed' }} />
            </div>
            <div className="field">
              <label className="field-label">Phone Number</label>
              <input className="field-input" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} placeholder="0901 234 567" />
            </div>
            <div className="field">
              <label className="field-label">Role tài khoản</label>
              <input className="field-input" value={user?.role === 'admin' ? 'Admin viên' : user?.role === 'organizer' ? 'Ban tổ chức' : 'Member'} disabled style={{ opacity: .5 }} />
            </div>
            <button type="submit" className="btn btn-gold" style={{ padding: '11px 32px' }} disabled={saving}>
              {saving ? 'Đang lưu...' : '💾 Save Changes'}
            </button>
          </form>
        )}

        {/* Tab: Change Password */}
        {tab === 'password' && (
          <form onSubmit={savePw} style={{ maxWidth: 400 }}>
            <div className="field">
              <label className="field-label">Password hiện tại</label>
              <input className="field-input" type="password" value={pw.current} onChange={e => setPw({ ...pw, current: e.target.value })} required autoFocus />
            </div>
            <div className="field">
              <label className="field-label">Password mới</label>
              <input className="field-input" type="password" value={pw.newPw} onChange={e => setPw({ ...pw, newPw: e.target.value })} required placeholder="Tối thiểu 6 ký tự" />
            </div>
            <div className="field">
              <label className="field-label">Confirm mật khẩu mới</label>
              <input className="field-input" type="password" value={pw.confirm} onChange={e => setPw({ ...pw, confirm: e.target.value })} required placeholder="Nhập lại mật khẩu mới" />
              {pw.confirm && pw.newPw !== pw.confirm && <div className="field-error">Password không khớp</div>}
            </div>
            <button type="submit" className="btn btn-gold" style={{ padding: '11px 32px' }} disabled={pwSaving || (pw.confirm && pw.newPw !== pw.confirm)}>
              {pwSaving ? 'Đang đổi...' : '🔐 Change Password'}
            </button>
          </form>
        )}

        {/* Tab: Yêu thích */}
        {tab === 'favorites' && (
          <div>
            {loadingFav ? <div className="loader"><div className="spinner" /></div>
              : favorites.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">❤️</div>
                  <div className="empty-title">Chưa có sự kiện yêu thích</div>
                  <div className="empty-sub">Khám phá và thêm sự kiện vào danh sách yêu thích của bạn</div>
                  <button className="btn btn-dark" style={{ marginTop: 16 }} onClick={() => navigate('/events')}>Khám phá sự kiện</button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                  {favorites.map(e => (
                    <div key={e.id} style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: 120, background: 'var(--dark)', position: 'relative', cursor: 'pointer', overflow: 'hidden' }} onClick={() => navigate(`/events/${e.slug || e.id}`)}>
                        {e.thumbnail ? <img src={e.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 40 }}>🎫</div>}
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,.6))' }} />
                      </div>
                      <div style={{ padding: '12px 14px' }}>
                        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, fontWeight: 700, marginBottom: 4, cursor: 'pointer' }} onClick={() => navigate(`/events/${e.slug || e.id}`)}>{e.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 10 }}>📅 {fmtD(e.start_date)}{e.venue_name && ` · 📍 ${e.venue_name}`}</div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-gold btn-sm" style={{ flex: 1 }} onClick={() => navigate(`/events/${e.slug || e.id}`)}>View Details</button>
                          <button className="btn btn-danger btn-sm" onClick={() => removeFavorite(e.id)}>❌</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}

        {/* Tab: Lịch sử thanh toán */}
        {tab === 'history' && (
          <div>
            {loadingOrders ? <div className="loader"><div className="spinner" /></div>
              : orders.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📜</div>
                  <div className="empty-title">Chưa có lịch sử thanh toán</div>
                  <div className="empty-sub">Các đơn hàng đã đặt sẽ xuất hiện ở đây</div>
                  <button className="btn btn-dark" style={{ marginTop: 16 }} onClick={() => navigate('/events')}>Book Now</button>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16 }}>
                    Tổng: <strong style={{ color: 'var(--text)' }}>{orders.length}</strong> đơn hàng ·
                    Paid: <strong style={{ color: '#1a5c3a' }}>{orders.filter(o => o.status === 'paid').length}</strong> ·
                    Total: <strong style={{ color: 'var(--gold)' }}>{fmt(orders.filter(o => o.status === 'paid').reduce((s, o) => s + Number(o.total || 0), 0))}đ</strong>
                  </div>
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr><th>Mã đơn</th><th>Events</th><th>Số vé</th><th>Total</th><th>Payment</th><th>Status</th><th>Days</th></tr>
                      </thead>
                      <tbody>
                        {orders.map(o => (
                          <tr key={o.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/events/${o.event_id}`)}>
                            <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--gold)' }}>{o.order_code}</td>
                            <td style={{ fontSize: 13, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.event_title}</td>
                            <td style={{ textAlign: 'center' }}>{o.ticket_count || 1}</td>
                            <td style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16 }}>{fmt(o.total)}đ</td>
                            <td><span className={`status-tag status-${o.payment_status}`}>{o.payment_status === 'paid' ? 'Paid' : o.payment_status === 'pending' ? 'Chờ thanh toán' : o.payment_status === 'refunded' ? 'Đã hoàn' : 'Thất bại'}</span></td>
                            <td><span className={`status-tag status-${o.status}`}>{o.status === 'paid' ? 'Hoàn thành' : o.status === 'pending' ? 'Đang xử lý' : o.status === 'cancelled' ? 'Đã hủy' : 'Đã hoàn vé'}</span></td>
                            <td style={{ fontSize: 12, color: 'var(--text3)' }}>{fmtD(o.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
          </div>
        )}

        {/* Tab: Bảo mật */}
        {tab === 'security' && (
          <div style={{ maxWidth: 480 }}>
            {[
              { title: 'Xác thực hai yếu tố (2FA)', desc: 'Bảo vệ tài khoản bằng OTP khi đăng nhập', status: 'Chưa bật', statusClass: 'status-draft' },
              { title: 'Login Google', desc: 'Liên kết tài khoản Google để đăng nhập nhanh', status: 'Chưa liên kết', statusClass: 'status-draft' },
              { title: 'Phiên đăng nhập', desc: 'Quản lý thiết bị và vị trí đang đăng nhập', status: 'Đang hoạt động', statusClass: 'status-active' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 4, padding: '18px 20px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 3 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>{item.desc}</div>
                </div>
                <span className={`status-tag ${item.statusClass}`}>{item.status}</span>
              </div>
            ))}
            <div style={{ marginTop: 24, padding: '16px 20px', background: 'rgba(139,26,26,.04)', border: '1px solid rgba(139,26,26,.15)', borderRadius: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#8b1a1a', marginBottom: 6 }}>⚠ Vùng nguy hiểm</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>Các thao tác này không thể hoàn tác. Vui lòng cân nhắc kỹ trước khi thực hiện.</div>
              <button className="btn btn-danger btn-sm" onClick={() => toast.error('Tính năng xóa tài khoản chưa được kích hoạt')}>Yêu cầu xóa tài khoản</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
