import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const TICKET_TYPES = [
  { value: 'paid',       label: 'Vé thường',    icon: '🎫', color: '#8a7f72' },
  { value: 'vip',        label: 'VIP',           icon: '💎', color: '#c9a84c' },
  { value: 'early_bird', label: 'Early Bird',    icon: '🐦', color: '#2563eb' },
  { value: 'free',       label: 'Miễn phí',      icon: '🎁', color: '#1a5c3a' },
];

const STEPS = ['Thông tin cơ bản', 'Địa điểm & Thời gian', 'Loại vé', 'Mã giảm giá', 'Xem trước & Xuất bản'];

// ── Image uploader ──────────────────────────────────
function ImageUploader({ value, onChange, label, hint, maxW = 900 }) {
  const ref = useRef();
  const compress = file => new Promise(res => {
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w2 = img.width, h2 = img.height;
        if (w2 > maxW) { h2 = Math.round(h2 * maxW / w2); w2 = maxW; }
        canvas.width = w2; canvas.height = h2;
        canvas.getContext('2d').drawImage(img, 0, 0, w2, h2);
        res(canvas.toDataURL('image/jpeg', 0.78));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
  const handle = async e => { const file = e.target.files[0]; if (!file) return; const data = await compress(file); onChange(data); };
  return (
    <div>
      <label style={{ display: 'block', fontSize: 10, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 6 }}>{label}</label>
      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={handle} />
      <div onClick={() => ref.current.click()} style={{ border: '1px dashed var(--border)', borderRadius: 4, cursor: 'pointer', overflow: 'hidden', background: 'var(--bg2)', transition: 'border-color .2s', minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onMouseOver={e => e.currentTarget.style.borderColor = 'var(--gold)'}
        onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}>
        {value
          ? <img src={value} alt="" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block' }} />
          : <div style={{ textAlign: 'center', padding: 20, pointerEvents: 'none' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📸</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>{hint || 'Nhấn để chọn ảnh'}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>PNG, JPG — Tự động nén</div>
            </div>
        }
      </div>
      {value && (
        <button type="button" onClick={() => onChange('')} style={{ background: 'none', border: 'none', color: '#8b1a1a', fontSize: 11, cursor: 'pointer', marginTop: 5, fontFamily: 'inherit' }}>× Xóa ảnh</button>
      )}
    </div>
  );
}

// ── Seat map uploader ───────────────────────────────
function SeatMapUploader({ value, onChange }) {
  const ref = useRef();
  const handle = e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => onChange(ev.target.result);
    reader.readAsDataURL(file);
  };
  return (
    <div>
      <label style={{ display: 'block', fontSize: 10, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 6 }}>Sơ đồ chỗ ngồi</label>
      <input ref={ref} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={handle} />
      <div onClick={() => ref.current.click()} style={{ border: '1px dashed var(--border)', borderRadius: 4, cursor: 'pointer', overflow: 'hidden', background: 'var(--bg2)', transition: 'border-color .2s', minHeight: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onMouseOver={e => e.currentTarget.style.borderColor = 'var(--gold)'}
        onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}>
        {value
          ? <div style={{ padding: '14px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>🗺</div>
              <div style={{ fontSize: 12, color: '#1a5c3a' }}>✓ Đã tải lên sơ đồ chỗ ngồi</div>
              {value.startsWith('data:image') && <img src={value} alt="" style={{ maxWidth: '100%', maxHeight: 160, marginTop: 10, borderRadius: 3 }} />}
            </div>
          : <div style={{ textAlign: 'center', padding: 20 }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>🗺</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>Upload sơ đồ chỗ ngồi</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>PNG, JPG, PDF · Không bắt buộc</div>
            </div>
        }
      </div>
      {value && <button type="button" onClick={() => onChange('')} style={{ background: 'none', border: 'none', color: '#8b1a1a', fontSize: 11, cursor: 'pointer', marginTop: 5, fontFamily: 'inherit' }}>× Xóa sơ đồ</button>}
    </div>
  );
}

// ── Preview modal ───────────────────────────────────
function PreviewModal({ form, categories, onClose }) {
  const cat = categories.find(c => String(c.id) === String(form.category_id));
  const fmt = n => n === 0 ? 'Miễn phí' : new Intl.NumberFormat('vi-VN').format(n) + 'đ';
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 600, padding: '24px 20px', overflowY: 'auto' }}>
      <div style={{ background: 'var(--bg3)', width: 760, maxWidth: '100%', borderRadius: 4, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,.5)' }}>
        {/* Preview header */}
        <div style={{ background: 'var(--dark)', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, letterSpacing: 2, color: 'var(--gold)', textTransform: 'uppercase' }}>👁 Xem trước sự kiện</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.5)', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        {/* Banner / Thumbnail */}
        <div style={{ height: 220, background: `linear-gradient(135deg,${cat?.color || '#1a1510'},#2a1a08)`, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {form.thumbnail ? <img src={form.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} /> : <div style={{ fontSize: 64, opacity: .4 }}>🎫</div>}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,transparent 40%,rgba(0,0,0,.8))' }} />
          <div style={{ position: 'absolute', bottom: 16, left: 20, right: 20 }}>
            {cat && <span style={{ background: cat.color, color: '#fff', fontSize: 9, letterSpacing: 2, padding: '3px 10px', borderRadius: 2, fontWeight: 600 }}>{cat.name.toUpperCase()}</span>}
            <h2 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 28, color: '#faf7f2', fontWeight: 700, marginTop: 8, lineHeight: 1.2 }}>{form.title || 'Tiêu đề sự kiện'}</h2>
          </div>
        </div>
        <div style={{ padding: '20px 24px' }}>
          {/* Info */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
            {form.start_date && <span style={{ fontSize: 12, color: 'var(--text2)' }}>📅 {new Date(form.start_date).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}</span>}
            {form.venue_name && <span style={{ fontSize: 12, color: 'var(--text2)' }}>📍 {form.venue_name}</span>}
            {form.is_online && <span style={{ fontSize: 12, color: '#3b82f6' }}>💻 Trực tuyến</span>}
          </div>
          {form.description && <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8, marginBottom: 16 }}>{form.description}</p>}
          {/* Video trailer */}
          {form.video_trailer && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 8 }}>Video Trailer</div>
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: 12, fontSize: 12, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>▶️</span> {form.video_trailer}
              </div>
            </div>
          )}
          {/* Ticket types */}
          {form.ticketTypes?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 10 }}>Loại vé</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {form.ticketTypes.map((tt, i) => {
                  const tp = TICKET_TYPES.find(t => t.value === tt.type);
                  return (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 4 }}>
                      <div>
                        <span style={{ fontSize: 12, color: tp?.color || 'var(--text3)', marginRight: 8 }}>{tp?.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{tt.name}</span>
                        {tt.type === 'early_bird' && <span style={{ marginLeft: 8, fontSize: 10, background: 'rgba(37,99,235,.1)', color: '#2563eb', border: '1px solid rgba(37,99,235,.2)', padding: '2px 8px', borderRadius: 2 }}>Early Bird</span>}
                        {tt.type === 'vip' && <span style={{ marginLeft: 8, fontSize: 10, background: 'rgba(201,168,76,.1)', color: 'var(--gold)', border: '1px solid rgba(201,168,76,.2)', padding: '2px 8px', borderRadius: 2 }}>VIP</span>}
                        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{tt.quantity} vé · Tối đa {tt.max_per_order}/đơn{tt.description ? ` · ${tt.description}` : ''}</div>
                        {(tt.sale_start || tt.sale_end) && <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 1 }}>🕐 Bán: {tt.sale_start || '...'} → {tt.sale_end || '...'}</div>}
                      </div>
                      <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 20, fontWeight: 300 }}>{fmt(tt.price)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {/* Seat map */}
          {form.seat_map && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 8 }}>Sơ đồ chỗ ngồi</div>
              {form.seat_map.startsWith('data:image') && <img src={form.seat_map} alt="Sơ đồ chỗ ngồi" style={{ maxWidth: '100%', borderRadius: 4, border: '1px solid var(--border)' }} />}
            </div>
          )}
          {/* Status */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', paddingTop: 16, borderTop: '1px solid var(--border2)' }}>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>Trạng thái:</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: form.status === 'published' ? '#1a5c3a' : '#8a7f72' }}>
              {form.status === 'published' ? '🟢 Xuất bản ngay' : '⚪ Lưu nháp'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────
const defaultTicket = { name: 'Vé thường', type: 'paid', price: 0, quantity: 100, max_per_order: 5, description: '', sale_start: '', sale_end: '', perks: '' };
const defaultCoupon = { code: '', type: 'percent', value: 10, min_order: 0, max_discount: '', usage_limit: 100, expires_at: '' };

export default function CreateEvent() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    // Step 1
    title: '', description: '', category_id: '', thumbnail: '', banner: '',
    video_trailer: '', tags: [],
    // Step 2
    is_online: false, online_url: '', venue_name: '', venue_address: '',
    start_date: '', end_date: '', capacity: 100, refund_policy: 'Hoàn 100% nếu hủy trước 3 ngày. Hoàn 50% nếu hủy trước 1 ngày.',
    agenda: [], faq: [], terms: '', seat_map: '',
    // Step 3
    ticketTypes: [{ ...defaultTicket }],
    // Step 4
    coupons: [],
    // Step 5
    status: 'draft',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => { api.get('/events/categories').then(r => setCategories(r.data.data || [])).catch(() => {}); }, []);

  // ── Ticket helpers ─────────────────────────────────
  const addTicket = (type = 'paid') => {
    const tpl = { ...defaultTicket, type, name: TICKET_TYPES.find(t => t.value === type)?.label || 'Vé mới' };
    if (type === 'vip') { tpl.name = 'Vé VIP'; tpl.price = 500000; }
    if (type === 'early_bird') { tpl.name = 'Early Bird'; tpl.price = 150000; }
    if (type === 'free') { tpl.name = 'Vé miễn phí'; tpl.price = 0; }
    set('ticketTypes', [...form.ticketTypes, tpl]);
  };
  const updateTicket = (i, k, v) => { const t = [...form.ticketTypes]; t[i] = { ...t[i], [k]: v }; set('ticketTypes', t); };
  const removeTicket = i => set('ticketTypes', form.ticketTypes.filter((_, idx) => idx !== i));

  // ── Coupon helpers ─────────────────────────────────
  const addCoupon = () => set('coupons', [...form.coupons, { ...defaultCoupon, code: 'GIAMGIA' + Math.random().toString(36).slice(2,5).toUpperCase() }]);
  const updateCoupon = (i, k, v) => { const c = [...form.coupons]; c[i] = { ...c[i], [k]: v }; set('coupons', c); };
  const removeCoupon = i => set('coupons', form.coupons.filter((_, idx) => idx !== i));

  // ── Agenda helpers ──────────────────────────────────
  const addAgenda = () => set('agenda', [...(form.agenda||[]), { time: '', title: '', desc: '' }]);
  const updateAgenda = (i, k, v) => { const a = [...form.agenda]; a[i] = { ...a[i], [k]: v }; set('agenda', a); };
  const removeAgenda = i => set('agenda', form.agenda.filter((_, idx) => idx !== i));

  // ── Submit ──────────────────────────────────────────
  const submit = async (status = 'draft') => {
    if (!form.title.trim()) { toast.error('Vui lòng nhập tiêu đề sự kiện'); setStep(0); return; }
    if (!form.start_date) { toast.error('Vui lòng chọn ngày bắt đầu'); setStep(1); return; }
    if (!form.ticketTypes.length) { toast.error('Vui lòng thêm ít nhất 1 loại vé'); setStep(2); return; }
    setSaving(true);
    try {
      const payload = { ...form, status };
      const { data } = await api.post('/events', payload);
      // Tạo coupons nếu có
      if (form.coupons.length && data.id) {
        for (const cp of form.coupons) {
          if (cp.code.trim()) {
            await api.post('/coupons', { ...cp, event_id: data.id }).catch(() => {});
          }
        }
      }
      toast.success(status === 'published' ? '🎉 Sự kiện đã xuất bản thành công!' : '💾 Đã lưu bản nháp!');
      nav(status === 'published' ? `/events/${data.slug || data.id}` : '/organizer');
    } catch (e) { toast.error(e.response?.data?.message || 'Lỗi tạo sự kiện'); }
    finally { setSaving(false); }
  };

  const canNext = () => {
    if (step === 0) return form.title.trim().length > 0;
    if (step === 1) return form.start_date;
    return true;
  };

  const inp = { className: 'field-input', style: { marginBottom: 0 } };
  const lbl = (t) => <label style={{ display: 'block', fontSize: 10, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 6 }}>{t}</label>;

  return (
    <div>
      {preview && <PreviewModal form={form} categories={categories} onClose={() => setPreview(false)} />}

      {/* Header */}
      <div style={{ background: 'var(--dark)', padding: '36px 48px', borderBottom: '1px solid rgba(201,168,76,.1)' }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 8 }}>
          {user?.role === 'admin' ? 'Admin' : 'Organizer'} · Quản lý sự kiện
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 32, fontWeight: 700, color: '#faf7f2' }}>Tạo sự kiện mới</h1>
          <button onClick={() => setPreview(true)} style={{ background: 'none', border: '1px solid rgba(201,168,76,.3)', color: 'var(--gold)', padding: '8px 20px', fontSize: 11, letterSpacing: 2, cursor: 'pointer', borderRadius: 4, fontFamily: 'inherit' }}>
            👁 Xem trước
          </button>
        </div>
      </div>

      {/* Stepper */}
      <div style={{ background: 'var(--bg3)', borderBottom: '1px solid var(--border)', padding: '0 48px' }}>
        <div style={{ display: 'flex', overflowX: 'auto' }}>
          {STEPS.map((s, i) => (
            <button key={i} onClick={() => i < step + 1 && setStep(i)}
              style={{ background: 'none', border: 'none', borderBottom: step === i ? '2px solid var(--gold)' : '2px solid transparent', cursor: i <= step ? 'pointer' : 'default', fontFamily: 'inherit', padding: '14px 20px', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: step === i ? 'var(--gold)' : i < step ? 'var(--text)' : 'var(--text3)', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap', marginBottom: -1 }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: step === i ? 'var(--gold)' : i < step ? '#1a5c3a' : 'var(--border)', color: step === i ? '#1a1510' : i < step ? '#fff' : 'var(--text3)', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                {i < step ? '✓' : i + 1}
              </span>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '36px 48px' }}>

        {/* ── STEP 0: Thông tin cơ bản ─────────────── */}
        {step === 0 && (
          <div>
            <div style={{ marginBottom: 20 }}>
              {lbl('Tiêu đề sự kiện *')}
              <input {...inp} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Ví dụ: Workshop Lập trình React 2025..." autoFocus />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
              <div>
                {lbl('Danh mục *')}
                <select className="field-select" value={form.category_id} onChange={e => set('category_id', e.target.value)}>
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div>
                {lbl('Loại hình sự kiện')}
                <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                  {[['offline', '🏛 Trực tiếp'], ['online', '💻 Trực tuyến']].map(([v, l]) => (
                    <button key={v} type="button" onClick={() => set('is_online', v === 'online')}
                      style={{ flex: 1, padding: '10px 8px', background: (form.is_online ? 'online' : 'offline') === v ? 'var(--dark)' : 'none', border: `1px solid ${(form.is_online ? 'online' : 'offline') === v ? 'var(--gold)' : 'var(--border)'}`, color: (form.is_online ? 'online' : 'offline') === v ? 'var(--gold)' : 'var(--text3)', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              {lbl('Mô tả chi tiết')}
              <textarea className="field-textarea" rows={5} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Mô tả nội dung, chủ đề, đối tượng tham dự..." style={{ marginBottom: 0 }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <ImageUploader value={form.thumbnail} onChange={v => set('thumbnail', v)} label="Ảnh thumbnail sự kiện" hint="Ảnh chính hiển thị trong danh sách (16:9)" maxW={900} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <ImageUploader value={form.banner} onChange={v => set('banner', v)} label="Ảnh banner (tùy chọn)" hint="Ảnh nền trang chi tiết sự kiện (tỉ lệ rộng)" maxW={1400} />
            </div>
            <div style={{ marginBottom: 20 }}>
              {lbl('Link video trailer (YouTube / Vimeo)')}
              <input {...inp} value={form.video_trailer} onChange={e => set('video_trailer', e.target.value)} placeholder="https://youtube.com/watch?v=..." />
            </div>
            <div style={{ marginBottom: 20 }}>
              {lbl('Tags (phân cách bằng dấu phẩy)')}
              <input {...inp} value={Array.isArray(form.tags) ? form.tags.join(', ') : form.tags}
                onChange={e => set('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                placeholder="react, workshop, lap-trinh..." />
            </div>
          </div>
        )}

        {/* ── STEP 1: Địa điểm & Thời gian ─────────── */}
        {step === 1 && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
              <div>
                {lbl('Ngày & giờ bắt đầu *')}
                <input {...inp} type="datetime-local" value={form.start_date} onChange={e => set('start_date', e.target.value)} />
              </div>
              <div>
                {lbl('Ngày & giờ kết thúc')}
                <input {...inp} type="datetime-local" value={form.end_date} onChange={e => set('end_date', e.target.value)} />
              </div>
            </div>
            {form.is_online ? (
              <div style={{ marginBottom: 20 }}>
                {lbl('Link tham dự trực tuyến')}
                <input {...inp} value={form.online_url} onChange={e => set('online_url', e.target.value)} placeholder="https://meet.google.com/..." />
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 14 }}>
                  {lbl('Tên địa điểm')}
                  <input {...inp} value={form.venue_name} onChange={e => set('venue_name', e.target.value)} placeholder="Ví dụ: Trung tâm Hội nghị Quốc gia" />
                </div>
                <div style={{ marginBottom: 20 }}>
                  {lbl('Địa chỉ chi tiết')}
                  <input {...inp} value={form.venue_address} onChange={e => set('venue_address', e.target.value)} placeholder="Số nhà, đường, quận/huyện, tỉnh/thành..." />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <SeatMapUploader value={form.seat_map} onChange={v => set('seat_map', v)} />
                </div>
              </>
            )}
            <div style={{ marginBottom: 20 }}>
              {lbl('Sức chứa tối đa')}
              <input {...inp} type="number" min={1} value={form.capacity} onChange={e => set('capacity', +e.target.value)} />
            </div>
            <div style={{ marginBottom: 20 }}>
              {lbl('Chính sách hoàn vé')}
              <textarea className="field-textarea" rows={3} value={form.refund_policy} onChange={e => set('refund_policy', e.target.value)} style={{ marginBottom: 0 }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              {lbl('Điều khoản tham dự (tùy chọn)')}
              <textarea className="field-textarea" rows={3} value={form.terms||''} onChange={e => set('terms', e.target.value)} placeholder="Quy định, điều kiện tham dự..." style={{ marginBottom: 0 }} />
            </div>

            {/* Lịch trình chương trình */}
            <div style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                {lbl('Lịch trình chương trình (Timeline)')}
                <button type="button" onClick={addAgenda} className="btn btn-dark btn-sm">+ Thêm mục</button>
              </div>
              {(form.agenda||[]).length === 0 && <div style={{ fontSize: 12, color: 'var(--text3)', padding: '12px 0' }}>Chưa có lịch trình. Nhấn "+ Thêm mục" để thêm.</div>}
              {(form.agenda||[]).map((a, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 2fr auto', gap: 8, marginBottom: 8, padding: 12, background: 'var(--bg2)', borderRadius: 4 }}>
                  <input {...inp} value={a.time} onChange={e => updateAgenda(i, 'time', e.target.value)} placeholder="08:00" />
                  <input {...inp} value={a.title} onChange={e => updateAgenda(i, 'title', e.target.value)} placeholder="Tiêu đề..." />
                  <input {...inp} value={a.desc||''} onChange={e => updateAgenda(i, 'desc', e.target.value)} placeholder="Mô tả ngắn..." />
                  <button type="button" onClick={() => removeAgenda(i)} style={{ background: 'none', border: 'none', color: '#8b1a1a', cursor: 'pointer', fontSize: 18, padding: '0 4px' }}>×</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 2: Loại vé ───────────────────────── */}
        {step === 2 && (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {TICKET_TYPES.map(t => (
                <button key={t.value} type="button" onClick={() => addTicket(t.value)}
                  style={{ background: 'none', border: `1px solid ${t.color}44`, color: t.color, padding: '8px 16px', fontSize: 12, cursor: 'pointer', borderRadius: 4, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, transition: 'background .15s' }}
                  onMouseOver={e => e.currentTarget.style.background = `${t.color}12`}
                  onMouseOut={e => e.currentTarget.style.background = 'none'}>
                  {t.icon} + Thêm {t.label}
                </button>
              ))}
            </div>

            {form.ticketTypes.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', border: '1px dashed var(--border)', borderRadius: 4, color: 'var(--text3)' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🎫</div>
                <div style={{ fontSize: 13 }}>Chưa có loại vé. Nhấn nút trên để thêm.</div>
              </div>
            )}

            {form.ticketTypes.map((tt, i) => {
              const tp = TICKET_TYPES.find(t => t.value === tt.type);
              return (
                <div key={i} style={{ border: `1px solid ${tp?.color || 'var(--border)'}33`, borderRadius: 4, padding: '16px 18px', marginBottom: 14, background: 'var(--bg3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: tp?.color, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {tp?.icon} {tp?.label}
                      {tt.type === 'early_bird' && <span style={{ fontSize: 10, background: 'rgba(37,99,235,.1)', color: '#2563eb', border: '1px solid rgba(37,99,235,.2)', padding: '2px 8px', borderRadius: 2 }}>Giá ưu đãi sớm</span>}
                      {tt.type === 'vip' && <span style={{ fontSize: 10, background: 'rgba(201,168,76,.1)', color: 'var(--gold)', border: '1px solid rgba(201,168,76,.2)', padding: '2px 8px', borderRadius: 2 }}>Đặc quyền cao cấp</span>}
                    </span>
                    {form.ticketTypes.length > 1 && <button type="button" onClick={() => removeTicket(i)} style={{ background: 'none', border: 'none', color: '#8b1a1a', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <div>{lbl('Tên loại vé')} <input {...inp} value={tt.name} onChange={e => updateTicket(i, 'name', e.target.value)} /></div>
                    <div>{lbl('Giá (VNĐ)')} <input {...inp} type="number" min={0} value={tt.price} onChange={e => updateTicket(i, 'price', +e.target.value)} disabled={tt.type==='free'} style={{ ...inp.style, opacity: tt.type==='free' ? .5 : 1 }} /></div>
                    <div>{lbl('Số lượng')} <input {...inp} type="number" min={1} value={tt.quantity} onChange={e => updateTicket(i, 'quantity', +e.target.value)} /></div>
                    <div>{lbl('Tối đa/đơn')} <input {...inp} type="number" min={1} max={10} value={tt.max_per_order} onChange={e => updateTicket(i, 'max_per_order', +e.target.value)} /></div>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    {lbl('Mô tả quyền lợi')}
                    <input {...inp} value={tt.description} onChange={e => updateTicket(i, 'description', e.target.value)} placeholder={tt.type==='vip'?'Bao gồm: chỗ ngồi VIP, quà tặng, gặp gỡ diễn giả...':tt.type==='early_bird'?'Ưu đãi dành cho 50 người đăng ký đầu tiên...':'Nhập mô tả...'} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>{lbl('Bán từ ngày')} <input {...inp} type="datetime-local" value={tt.sale_start||''} onChange={e => updateTicket(i, 'sale_start', e.target.value)} /></div>
                    <div>{lbl('Bán đến ngày')} <input {...inp} type="datetime-local" value={tt.sale_end||''} onChange={e => updateTicket(i, 'sale_end', e.target.value)} /></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── STEP 3: Mã giảm giá ──────────────────── */}
        {step === 3 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Mã giảm giá cho sự kiện</div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>Tạo mã để tặng khán giả VIP hoặc chạy chiến dịch marketing</div>
              </div>
              <button type="button" onClick={addCoupon} className="btn btn-dark">+ Tạo mã giảm giá</button>
            </div>

            {form.coupons.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 20px', border: '1px dashed var(--border)', borderRadius: 4 }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🏷️</div>
                <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 20, marginBottom: 6 }}>Chưa có mã giảm giá</div>
                <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 16 }}>Bước này không bắt buộc. Bạn có thể bỏ qua hoặc thêm mã sau.</div>
                <button type="button" onClick={addCoupon} className="btn btn-gold btn-sm">+ Tạo mã đầu tiên</button>
              </div>
            )}

            {form.coupons.map((cp, i) => (
              <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 4, padding: '16px 18px', marginBottom: 14, background: 'var(--bg3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'monospace', color: 'var(--gold)', letterSpacing: 2 }}>{cp.code || 'MÃ GIẢM GIÁ'}</span>
                  <button type="button" onClick={() => removeCoupon(i)} style={{ background: 'none', border: 'none', color: '#8b1a1a', cursor: 'pointer', fontSize: 18 }}>×</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
                  <div>{lbl('Mã code')} <input {...inp} value={cp.code} onChange={e => updateCoupon(i, 'code', e.target.value.toUpperCase())} placeholder="VD: GIAMGIA20" style={{ fontFamily: 'monospace', ...inp.style }} /></div>
                  <div>
                    {lbl('Loại giảm')}
                    <select className="field-select" value={cp.type} onChange={e => updateCoupon(i, 'type', e.target.value)}>
                      <option value="percent">% Phần trăm</option>
                      <option value="fixed">đ Số tiền cố định</option>
                    </select>
                  </div>
                  <div>{lbl(cp.type==='percent'?'Giảm (%)':`Giảm (đ)`)} <input {...inp} type="number" min={0} value={cp.value} onChange={e => updateCoupon(i, 'value', +e.target.value)} /></div>
                  <div>{lbl('Giới hạn sử dụng')} <input {...inp} type="number" min={1} value={cp.usage_limit} onChange={e => updateCoupon(i, 'usage_limit', +e.target.value)} /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  <div>{lbl('Đơn tối thiểu (đ)')} <input {...inp} type="number" min={0} value={cp.min_order} onChange={e => updateCoupon(i, 'min_order', +e.target.value)} /></div>
                  <div>{lbl('Giảm tối đa (đ)')} <input {...inp} type="number" min={0} value={cp.max_discount||''} onChange={e => updateCoupon(i, 'max_discount', e.target.value)} placeholder="Không giới hạn" /></div>
                  <div>{lbl('Hết hạn')} <input {...inp} type="datetime-local" value={cp.expires_at||''} onChange={e => updateCoupon(i, 'expires_at', e.target.value)} /></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── STEP 4: Xem trước & Xuất bản ─────────── */}
        {step === 4 && (
          <div>
            <div style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 4, padding: '20px 24px', marginBottom: 20 }}>
              <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 16 }}>Tóm tắt sự kiện</div>
              {[
                ['Tiêu đề', form.title || '(chưa nhập)'],
                ['Danh mục', categories.find(c=>String(c.id)===String(form.category_id))?.name || '(chưa chọn)'],
                ['Hình thức', form.is_online ? 'Trực tuyến' : 'Trực tiếp'],
                ['Địa điểm', form.is_online ? (form.online_url||'(chưa nhập)') : (form.venue_name||'(chưa nhập)')],
                ['Ngày bắt đầu', form.start_date ? new Date(form.start_date).toLocaleString('vi-VN') : '(chưa chọn)'],
                ['Sức chứa', form.capacity + ' người'],
                ['Loại vé', form.ticketTypes.length + ' loại'],
                ['Mã giảm giá', form.coupons.length > 0 ? `${form.coupons.length} mã` : 'Không có'],
                ['Lịch trình', (form.agenda||[]).length > 0 ? `${form.agenda.length} mục` : 'Chưa thêm'],
                ['Ảnh thumbnail', form.thumbnail ? '✓ Đã upload' : '✗ Chưa có'],
                ['Video trailer', form.video_trailer ? '✓ Có' : '— Không có'],
                ['Sơ đồ chỗ ngồi', form.seat_map ? '✓ Đã upload' : '— Không có'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border2)', fontSize: 13 }}>
                  <span style={{ color: 'var(--text3)' }}>{k}</span>
                  <span style={{ fontWeight: 500, color: v.startsWith('(') ? '#8b1a1a' : v.startsWith('✓') ? '#1a5c3a' : 'var(--text)' }}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{ background: 'rgba(201,168,76,.06)', border: '1px solid rgba(201,168,76,.2)', borderRadius: 4, padding: '16px 20px', marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Chọn trạng thái xuất bản</div>
              <div style={{ display: 'flex', gap: 12 }}>
                {[['draft','⚪ Lưu nháp','Tạo xong chỉnh sửa thêm, chưa công khai'],['published','🟢 Xuất bản ngay','Người dùng có thể tìm thấy và đặt vé ngay']].map(([v,l,sub]) => (
                  <label key={v} style={{ flex: 1, cursor: 'pointer', display: 'flex', gap: 10, padding: '12px 14px', border: `1px solid ${form.status===v?'var(--gold)':'var(--border)'}`, borderRadius: 4, background: form.status===v?'rgba(201,168,76,.04)':'var(--bg3)' }}>
                    <input type="radio" name="status" value={v} checked={form.status===v} onChange={()=>set('status',v)} style={{ marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{l}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{sub}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button onClick={() => setPreview(true)} style={{ width: '100%', background: 'none', border: '1px solid var(--border)', color: 'var(--text)', padding: 13, fontSize: 12, letterSpacing: 2, cursor: 'pointer', fontFamily: 'inherit', borderRadius: 4, marginBottom: 10 }}>
              👁 Xem trước sự kiện
            </button>
          </div>
        )}

        {/* Navigation buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border2)' }}>
          <button type="button" onClick={() => step > 0 ? setStep(step-1) : nav(-1)}
            style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text)', padding: '11px 24px', fontSize: 11, letterSpacing: 2, cursor: 'pointer', fontFamily: 'inherit', borderRadius: 4 }}>
            ← {step === 0 ? 'Hủy' : 'Quay lại'}
          </button>

          <div style={{ display: 'flex', gap: 10 }}>
            {step === 4 ? (
              <>
                <button type="button" onClick={() => submit('draft')} disabled={saving}
                  style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text)', padding: '11px 24px', fontSize: 11, letterSpacing: 2, cursor: 'pointer', fontFamily: 'inherit', borderRadius: 4, opacity: saving ? .5 : 1 }}>
                  💾 Lưu nháp
                </button>
                <button type="button" onClick={() => submit('published')} disabled={saving}
                  style={{ background: 'var(--gold)', border: 'none', color: '#1a1510', padding: '11px 32px', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', borderRadius: 4, opacity: saving ? .5 : 1 }}>
                  {saving ? 'Đang lưu...' : '🚀 Xuất bản sự kiện'}
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setStep(step+1)} disabled={!canNext()}
                style={{ background: 'var(--gold)', border: 'none', color: '#1a1510', padding: '11px 28px', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, cursor: canNext() ? 'pointer' : 'not-allowed', fontFamily: 'inherit', borderRadius: 4, opacity: canNext() ? 1 : .4 }}>
                Tiếp theo →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
