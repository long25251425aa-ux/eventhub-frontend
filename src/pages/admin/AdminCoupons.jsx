import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const fmt = n => new Intl.NumberFormat('vi-VN').format(n||0);
const fmtD = d => d ? new Date(d).toLocaleDateString('vi-VN') : '∞';

const defaultForm = {
  code: '', type: 'percent', value: 10,
  min_order: 0, max_discount: '', usage_limit: 100,
  event_id: '', expires_at: '', is_active: 1
};

function genCode() {
  return 'EVH' + Math.random().toString(36).slice(2,5).toUpperCase() + Math.floor(Math.random()*100);
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/coupons'),
      api.get('/events?limit=100')
    ]).then(([cr, er]) => {
      setCoupons(cr.data.data || []);
      setEvents(er.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.code.trim()) { toast.error('Vui lòng nhập mã code'); return; }
    if (!form.value || form.value <= 0) { toast.error('Giá trị giảm phải lớn hơn 0'); return; }
    if (form.type === 'percent' && form.value > 100) { toast.error('Phần trăm không được vượt quá 100%'); return; }
    setSaving(true);
    try {
      await api.post('/coupons', {
        ...form,
        code: form.code.toUpperCase(),
        max_discount: form.max_discount || null,
        event_id: form.event_id || null,
        expires_at: form.expires_at || null,
      });
      toast.success('✅ Tạo mã giảm giá thành công!');
      setShowForm(false);
      setForm(defaultForm);
      load();
    } catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
    finally { setSaving(false); }
  };

  const del = async (id, code) => {
    if (!window.confirm(`Xóa mã "${code}"?`)) return;
    try {
      await api.delete(`/coupons/${id}`);
      toast.success('Đã xóa mã giảm giá');
      load();
    } catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Mã giảm giá</h2>
          <p style={{ fontSize: 12, color: 'var(--text3)' }}>Tạo và quản lý mã giảm giá cho các sự kiện</p>
        </div>
        <button className="btn btn-gold" onClick={() => { setForm({ ...defaultForm, code: genCode() }); setShowForm(true); }}>
          + Tạo mã giảm giá
        </button>
      </div>

      {/* Form tạo mã */}
      {showForm && (
        <div style={{ background: 'var(--bg3)', border: '1px solid rgba(201,168,76,.3)', borderRadius: 4, padding: '20px 24px', marginBottom: 24 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 16 }}>Tạo mã giảm giá mới</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 10, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 6 }}>Mã code *</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input className="field-input" value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} placeholder="VD: GIAM20" style={{ flex: 1, marginBottom: 0, fontFamily: 'monospace', letterSpacing: 2 }} />
                <button type="button" onClick={() => set('code', genCode())} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text3)', padding: '0 10px', cursor: 'pointer', borderRadius: 4, fontSize: 12, whiteSpace: 'nowrap' }}>🎲</button>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 6 }}>Loại giảm *</label>
              <select className="field-select" value={form.type} onChange={e => set('type', e.target.value)} style={{ marginBottom: 0 }}>
                <option value="percent">% Phần trăm</option>
                <option value="fixed">đ Số tiền cố định</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 6 }}>
                {form.type === 'percent' ? 'Giảm (%)' : 'Giảm (đ)'} *
              </label>
              <input className="field-input" type="number" min={1} max={form.type==='percent'?100:undefined} value={form.value} onChange={e => set('value', +e.target.value)} style={{ marginBottom: 0 }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 10, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 6 }}>Đơn tối thiểu (đ)</label>
              <input className="field-input" type="number" min={0} value={form.min_order} onChange={e => set('min_order', +e.target.value)} style={{ marginBottom: 0 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 6 }}>Giảm tối đa (đ)</label>
              <input className="field-input" type="number" min={0} value={form.max_discount} onChange={e => set('max_discount', e.target.value)} placeholder="Không giới hạn" style={{ marginBottom: 0 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 6 }}>Giới hạn dùng</label>
              <input className="field-input" type="number" min={1} value={form.usage_limit} onChange={e => set('usage_limit', +e.target.value)} style={{ marginBottom: 0 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 6 }}>Hết hạn</label>
              <input className="field-input" type="datetime-local" value={form.expires_at} onChange={e => set('expires_at', e.target.value)} style={{ marginBottom: 0 }} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 10, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 6 }}>Áp dụng cho sự kiện (để trống = tất cả)</label>
            <select className="field-select" value={form.event_id} onChange={e => set('event_id', e.target.value)} style={{ marginBottom: 0 }}>
              <option value="">Tất cả sự kiện</option>
              {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title || ev.name}</option>)}
            </select>
          </div>

          {/* Preview */}
          <div style={{ background: 'rgba(201,168,76,.06)', border: '1px solid rgba(201,168,76,.2)', borderRadius: 4, padding: '12px 16px', marginBottom: 16, fontSize: 13 }}>
            <strong style={{ color: 'var(--gold)' }}>Preview:</strong> Mã <code style={{ background: 'var(--bg2)', padding: '2px 6px', borderRadius: 3, fontFamily: 'monospace' }}>{form.code || 'CODE'}</code> giảm{' '}
            <strong>{form.type === 'percent' ? `${form.value}%` : `${fmt(form.value)}đ`}</strong>
            {form.min_order > 0 && ` cho đơn từ ${fmt(form.min_order)}đ`}
            {form.max_discount && `, tối đa ${fmt(form.max_discount)}đ`}
            {form.expires_at && ` · Hết hạn ${new Date(form.expires_at).toLocaleDateString('vi-VN')}`}
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-dark" onClick={() => setShowForm(false)}>Hủy</button>
            <button className="btn btn-gold" onClick={save} disabled={saving}>{saving ? 'Đang lưu...' : 'Tạo mã giảm giá'}</button>
          </div>
        </div>
      )}

      {/* Danh sách */}
      {loading ? <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        : coupons.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏷️</div>
            <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 20, marginBottom: 8 }}>Chưa có mã giảm giá nào</div>
            <button className="btn btn-gold btn-sm" onClick={() => { setForm({ ...defaultForm, code: genCode() }); setShowForm(true); }}>Tạo mã đầu tiên</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--border)' }}>
            {coupons.map(cp => {
              const isExpired = cp.expires_at && new Date(cp.expires_at) < new Date();
              const isFull = cp.usage_limit && cp.used_count >= cp.usage_limit;
              const status = !cp.is_active ? 'inactive' : isExpired ? 'expired' : isFull ? 'full' : 'active';
              const statusMap = {
                active:   { l: '🟢 Đang hoạt động', c: '#1a5c3a' },
                inactive: { l: '⚫ Đã tắt',         c: '#8a7f72' },
                expired:  { l: '🔴 Hết hạn',         c: '#8b1a1a' },
                full:     { l: '🟠 Đã hết lượt',     c: '#8b5e00' },
              };
              return (
                <div key={cp.id} style={{ background: 'var(--bg3)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 700, color: 'var(--gold)', letterSpacing: 2 }}>{cp.code}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: statusMap[status].c }}>{statusMap[status].l}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                      Giảm <strong>{cp.type === 'percent' ? `${cp.value}%` : `${fmt(cp.value)}đ`}</strong>
                      {cp.min_order > 0 && ` · Đơn tối thiểu ${fmt(cp.min_order)}đ`}
                      {cp.max_discount && ` · Tối đa ${fmt(cp.max_discount)}đ`}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                      Đã dùng: {cp.used_count}/{cp.usage_limit || '∞'} · Hết hạn: {fmtD(cp.expires_at)}
                      {cp.event_id && ` · Sự kiện #${cp.event_id}`}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => { navigator.clipboard.writeText(cp.code); toast.success('Đã copy mã!'); }}
                      style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text3)', padding: '6px 12px', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', borderRadius: 4 }}>
                      📋 Copy
                    </button>
                    <button onClick={() => del(cp.id, cp.code)}
                      style={{ background: 'none', border: '1px solid rgba(139,26,26,.3)', color: '#8b1a1a', padding: '6px 12px', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', borderRadius: 4 }}>
                      Xóa
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}
