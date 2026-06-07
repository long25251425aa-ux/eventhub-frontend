import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const fmt = n => new Intl.NumberFormat('vi-VN').format(n || 0);
const fmtD = d => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

function EventModal({ event, categories, onClose, onSaved }) {
  const isEdit = !!event?.id;
  const [f, setF] = useState(event || {
    title: '', description: '', category_id: '', venue_name: '', venue_address: '',
    start_date: '', end_date: '', is_online: false, online_url: '',
    capacity: 100, refund_policy: 'Hoàn 100% trước 3 ngày, 50% trước 1 ngày.',
    status: 'draft', ticketTypes: [{ name: 'Vé thường', type: 'paid', price: 0, quantity: 100, max_per_order: 5 }]
  });
  const [saving, setSaving] = useState(false);
  const imgRef = React.useRef();

  const handleImg = e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image(); img.onload = () => {
        const canvas = document.createElement('canvas'); const MAX = 900;
        let w2 = img.width, h2 = img.height;
        if (w2 > MAX) { h2 = Math.round(h2 * MAX / w2); w2 = MAX; }
        canvas.width = w2; canvas.height = h2;
        canvas.getContext('2d').drawImage(img, 0, 0, w2, h2);
        setF(p => ({ ...p, thumbnail: canvas.toDataURL('image/jpeg', 0.75) }));
      }; img.src = ev.target.result;
    }; reader.readAsDataURL(file);
  };

  const save = async () => {
    if (!f.title || !f.start_date) { toast.error('Vui lòng điền tiêu đề và ngày bắt đầu'); return; }
    setSaving(true);
    try {
      if (isEdit) await api.put('/events/' + event.id, f);
      else await api.post('/events', f);
      toast.success(isEdit ? 'Cập nhật thành công!' : 'Tạo sự kiện thành công!');
      onSaved();
    } catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, padding: 20 }}>
      <div style={{ background: 'var(--bg3)', width: 580, maxWidth: '96vw', borderRadius: 4, overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}>
        <div style={{ background: 'var(--dark)', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 11, letterSpacing: 2, color: 'var(--gold)', textTransform: 'uppercase' }}>{isEdit ? 'Chỉnh sửa' : 'Tạo mới'} sự kiện</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 10, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 6 }}>Tiêu đề sự kiện *</label>
            <input className="field-input" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} autoFocus />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 10, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 6 }}>Danh mục</label>
              <select className="field-select" value={f.category_id || ''} onChange={e => setF({ ...f, category_id: e.target.value || null })}>
                <option value="">-- Chọn danh mục --</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 6 }}>Trạng thái</label>
              <select className="field-select" value={f.status} onChange={e => setF({ ...f, status: e.target.value })}>
                <option value="draft">Bản nháp</option>
                <option value="published">Xuất bản</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 10, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 6 }}>Ngày bắt đầu *</label>
              <input className="field-input" type="datetime-local" value={f.start_date || ''} onChange={e => setF({ ...f, start_date: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 6 }}>Ngày kết thúc</label>
              <input className="field-input" type="datetime-local" value={f.end_date || ''} onChange={e => setF({ ...f, end_date: e.target.value })} />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 10, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 6 }}>Địa điểm</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12, color: 'var(--text3)', cursor: 'pointer' }}>
              <input type="checkbox" checked={f.is_online} onChange={e => setF({ ...f, is_online: e.target.checked })} />
              Sự kiện trực tuyến (Online)
            </label>
            {f.is_online
              ? <input className="field-input" value={f.online_url || ''} onChange={e => setF({ ...f, online_url: e.target.value })} placeholder="Link Zoom / Google Meet..." />
              : <>
                <input className="field-input" value={f.venue_name || ''} onChange={e => setF({ ...f, venue_name: e.target.value })} placeholder="Tên địa điểm" style={{ marginBottom: 6 }} />
                <input className="field-input" value={f.venue_address || ''} onChange={e => setF({ ...f, venue_address: e.target.value })} placeholder="Địa chỉ chi tiết" />
              </>
            }
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 10, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 6 }}>Ảnh sự kiện</label>
            <input ref={imgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImg} />
            <div onClick={() => imgRef.current.click()} style={{ border: '1px dashed var(--border)', borderRadius: 4, cursor: 'pointer', minHeight: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: 'var(--bg2)' }}
              onMouseOver={e => e.currentTarget.style.borderColor = 'var(--gold)'}
              onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              {f.thumbnail
                ? <img src={f.thumbnail} alt="" style={{ width: '100%', height: 140, objectFit: 'cover' }} />
                : <div style={{ textAlign: 'center', padding: 20 }}>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>📸</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>Nhấn để chọn ảnh · Tự động nén</div>
                  </div>
              }
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 10, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 6 }}>Sức chứa</label>
              <input className="field-input" type="number" value={f.capacity} onChange={e => setF({ ...f, capacity: +e.target.value })} />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 10, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 6 }}>Mô tả sự kiện</label>
            <textarea className="field-textarea" rows={4} value={f.description || ''} onChange={e => setF({ ...f, description: e.target.value })} placeholder="Mô tả chi tiết về sự kiện..." />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 10, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 6 }}>Chính sách hoàn vé</label>
            <textarea className="field-textarea" rows={2} value={f.refund_policy || ''} onChange={e => setF({ ...f, refund_policy: e.target.value })} />
          </div>

          {/* Loại vé */}
          <div style={{ marginBottom: 4 }}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Loại vé</span>
              <button type="button" className="btn btn-dark btn-sm" onClick={() => setF(p => ({ ...p, ticketTypes: [...(p.ticketTypes || []), { name: '', type: 'paid', price: 0, quantity: 50, max_per_order: 5 }] }))}>+ Thêm loại vé</button>
            </div>
            {(f.ticketTypes || []).map((tt, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8, marginBottom: 8, padding: '10px', background: 'var(--bg2)', borderRadius: 4 }}>
                <input className="field-input" value={tt.name} onChange={e => setF(p => { const t = [...p.ticketTypes]; t[i] = { ...t[i], name: e.target.value }; return { ...p, ticketTypes: t }; })} placeholder="Tên loại vé" style={{ marginBottom: 0 }} />
                <select className="field-select" value={tt.type} onChange={e => setF(p => { const t = [...p.ticketTypes]; t[i] = { ...t[i], type: e.target.value }; return { ...p, ticketTypes: t }; })} style={{ marginBottom: 0 }}>
                  <option value="free">Miễn phí</option>
                  <option value="paid">Thường</option>
                  <option value="vip">VIP</option>
                  <option value="early_bird">Early Bird</option>
                </select>
                <input className="field-input" type="number" value={tt.price} onChange={e => setF(p => { const t = [...p.ticketTypes]; t[i] = { ...t[i], price: +e.target.value }; return { ...p, ticketTypes: t }; })} placeholder="Giá" style={{ marginBottom: 0 }} />
                <input className="field-input" type="number" value={tt.quantity} onChange={e => setF(p => { const t = [...p.ticketTypes]; t[i] = { ...t[i], quantity: +e.target.value }; return { ...p, ticketTypes: t }; })} placeholder="Số lượng" style={{ marginBottom: 0 }} />
                {(f.ticketTypes || []).length > 1 && <button type="button" onClick={() => setF(p => { const t = [...p.ticketTypes]; t.splice(i, 1); return { ...p, ticketTypes: t }; })} style={{ background: 'none', border: 'none', color: '#8b1a1a', cursor: 'pointer', fontSize: 16 }}>×</button>}
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border2)', display: 'flex', gap: 10, justifyContent: 'flex-end', background: 'var(--bg2)', flexShrink: 0 }}>
          <button className="btn btn-dark" onClick={onClose}>Hủy bỏ</button>
          <button className="btn btn-gold" onClick={save} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu sự kiện'}</button>
        </div>
      </div>
    </div>
  );
}

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ totalEvents: 0, totalTickets: 0, totalRevenue: 0, checkinRate: 0 });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('events');
  const [modal, setModal] = useState(null);
  const [orders, setOrders] = useState([]);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/events?status=all&limit=100'),
      api.get('/events/categories'),
      api.get('/orders/my/orders').catch(() => ({ data: { data: [] } })),
    ]).then(([er, cr, or]) => {
      const myEvents = (er.data.data || []).filter(e => e.organizer_id === user?.id || true); // show all for now
      setEvents(myEvents);
      setCategories(cr.data.data || []);
      setOrders(or.data.data || []);
      // Tính stats
      const totalTickets = myEvents.reduce((s, e) => s + (e.sold || 0), 0);
      const totalRevenue = (or.data.data || []).filter(o => o.status === 'paid').reduce((s, o) => s + Number(o.total || 0), 0);
      setStats({ totalEvents: myEvents.length, totalTickets, totalRevenue, checkinRate: 0 });
    }).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const del = async id => {
    if (!window.confirm('Xóa sự kiện này?')) return;
    try { await api.delete('/events/' + id); toast.success('Đã xóa'); load(); }
    catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
  };

  const togglePublish = async (id, status) => {
    try { await api.patch('/events/' + id + '/publish'); toast.success(status === 'published' ? 'Đã ẩn sự kiện' : 'Đã xuất bản'); load(); }
    catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
  };

  return (
    <div>
      {modal && <EventModal event={modal === 'new' ? null : modal} categories={categories} onClose={() => setModal(null)} onSaved={() => { setModal(null); load(); }} />}

      <div style={{ background: 'var(--dark)', padding: '40px 48px', borderBottom: '1px solid rgba(201,168,76,.1)' }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 8 }}>Organizer Panel</div>
        <h1 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 32, fontWeight: 700, color: '#faf7f2' }}>Ban tổ chức · {user?.name}</h1>
      </div>

      <div className="section">
        {/* KPI */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: 'var(--border)', marginBottom: 28 }}>
          {[
            { n: stats.totalEvents, l: 'Sự kiện của tôi', c: 'var(--gold)' },
            { n: stats.totalTickets, l: 'Tổng vé đã bán', c: '#1a5c3a' },
            { n: fmt(stats.totalRevenue) + 'đ', l: 'Doanh thu', c: '#8b5e00' },
            { n: orders.filter(o => o.status === 'pending').length, l: 'Đơn chờ xử lý', c: '#993556' },
          ].map(s => (
            <div key={s.l} style={{ background: 'var(--bg3)', padding: '22px 20px' }}>
              <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 32, fontWeight: 300, color: s.c }}>{s.n}</div>
              <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase', marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
          {[['events', 'Sự kiện của tôi'], ['tickets', 'Theo dõi vé'], ['orders', 'Đơn hàng']].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} style={{ background: 'none', border: 'none', borderBottom: tab === k ? '2px solid var(--gold)' : '2px solid transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', padding: '12px 20px', color: tab === k ? 'var(--gold)' : 'var(--text3)', marginBottom: -1 }}>
              {l}
            </button>
          ))}
        </div>

        {/* Tab: Sự kiện */}
        {tab === 'events' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <button className="btn btn-gold" onClick={() => nav('/events/create')}>+ Tạo sự kiện mới</button>
            </div>
            {loading ? <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
              : events.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
                  <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 22, marginBottom: 8 }}>Chưa có sự kiện nào</div>
                  <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 20 }}>Tạo sự kiện đầu tiên của bạn ngay hôm nay</div>
                  <button className="btn btn-gold" onClick={() => nav('/events/create')}>+ Tạo sự kiện ngay</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--border)' }}>
                  {events.map(e => {
                    const pct = e.capacity > 0 ? Math.round(e.sold / e.capacity * 100) : 0;
                    return (
                      <div key={e.id} style={{ background: 'var(--bg3)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 52, height: 52, borderRadius: 4, overflow: 'hidden', flexShrink: 0, background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                          {e.thumbnail ? <img src={e.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🎫'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 17, fontWeight: 700, marginBottom: 2 }}>{e.title}</div>
                          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6 }}>📅 {fmtD(e.start_date)} · 📍 {e.venue_name || 'Trực tuyến'}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ height: 4, width: 120, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: pct + '%', background: pct >= 100 ? '#8b1a1a' : 'var(--gold)', borderRadius: 2 }} />
                            </div>
                            <span style={{ fontSize: 11, color: 'var(--text3)' }}>{e.sold}/{e.capacity} vé ({pct}%)</span>
                          </div>
                        </div>
                        <span style={{ fontSize: 9, letterSpacing: 2, fontWeight: 600, padding: '3px 10px', borderRadius: 2, textTransform: 'uppercase', background: e.status === 'published' ? 'rgba(26,92,58,.08)' : 'rgba(138,127,114,.08)', color: e.status === 'published' ? '#1a5c3a' : 'var(--text3)', border: `1px solid ${e.status === 'published' ? 'rgba(26,92,58,.2)' : 'var(--border)'}` }}>
                          {e.status === 'published' ? 'Đang xuất bản' : 'Bản nháp'}
                        </span>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-dark btn-sm" onClick={() => setModal(e)}>Sửa</button>
                          <button className="btn btn-dark btn-sm" onClick={() => togglePublish(e.id, e.status)}>{e.status === 'published' ? 'Ẩn' : 'Xuất bản'}</button>
                          <button className="btn btn-danger btn-sm" onClick={() => del(e.id)}>Xóa</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
          </>
        )}

        {/* Tab: Theo dõi vé */}
        {tab === 'tickets' && (
          <div>
            {events.length === 0 ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>Chưa có sự kiện nào</div> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {events.filter(e => e.status === 'published').map(e => {
                  const pct = e.capacity > 0 ? Math.round(e.sold / e.capacity * 100) : 0;
                  return (
                    <div key={e.id} style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 4, padding: '18px 20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 18, fontWeight: 700 }}>{e.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--text3)' }}>📅 {fmtD(e.start_date)}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 28, fontWeight: 300, color: 'var(--gold)' }}>{e.sold}</div>
                          <div style={{ fontSize: 10, color: 'var(--text3)' }}>/ {e.capacity} vé</div>
                        </div>
                      </div>
                      <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: pct + '%', background: pct >= 100 ? '#8b1a1a' : pct >= 70 ? '#8b5e00' : 'var(--gold)', borderRadius: 3, transition: 'width .5s' }} />
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>Tỉ lệ lấp đầy: <strong style={{ color: 'var(--text)' }}>{pct}%</strong> · Còn lại: <strong style={{ color: 'var(--text)' }}>{e.capacity - e.sold}</strong> vé</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab: Đơn hàng */}
        {tab === 'orders' && (
          <div>
            {orders.length === 0 ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>Chưa có đơn hàng nào</div> : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr><th>Mã đơn</th><th>Sự kiện</th><th>Tổng tiền</th><th>Trạng thái</th><th>Ngày</th></tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 50).map(o => (
                      <tr key={o.id}>
                        <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--gold)' }}>{o.order_code}</td>
                        <td style={{ fontSize: 13 }}>{o.event_title}</td>
                        <td style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 16 }}>{fmt(o.total)}đ</td>
                        <td><span className={`status-tag status-${o.status}`}>{o.status === 'paid' ? 'Đã thanh toán' : o.status === 'pending' ? 'Chờ thanh toán' : o.status === 'cancelled' ? 'Đã hủy' : 'Đã hoàn'}</span></td>
                        <td style={{ fontSize: 12, color: 'var(--text3)' }}>{fmtD(o.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
