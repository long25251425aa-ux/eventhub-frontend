import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const fmt = (n) => n===0?'Mien Phi':new Intl.NumberFormat('vi-VN').format(n)+'d';

function EventModal({ event, onClose, onSaved }) {
  const isEdit = !!event;
  const [f, setF] = useState(event || {
    name:'', type:'Hoi thao', description:'', date:'', time:'09:00',
    location:'', capacity:100, price:0, emoji:'🎪', bg_color:'#1a1510',
    speakers:'', status:'active'
  });
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(event?.imageUrl || null);
  const fileRef = useRef();

  const handleImg = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 800;
        let w = img.width, h = img.height;
        if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
        if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL('image/jpeg', 0.72);
        setPreview(compressed);
        setF(prev => ({ ...prev, imageUrl: compressed }));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const save = async () => {
    if (!f.name || !f.date || !f.location) {
      toast.error('Vui long dien day du thong tin');
      return;
    }
    setSaving(true);
    try {
      const body = {
        ...f,
        speakers: typeof f.speakers === 'string'
          ? f.speakers.split('\n').filter(Boolean)
          : (Array.isArray(f.speakers) ? f.speakers : [])
      };
      if (isEdit) await api.put('/events/' + event.id, body);
      else await api.post('/events', body);
      toast.success(isEdit ? 'Cap nhat thanh cong' : 'Them su kien moi!');
      onSaved();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Loi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target.classList.contains('modal-overlay')) onClose(); }}>
      <div className="modal-box">
        <div className="modal-title serif">{isEdit ? 'Chinh sua' : 'Them moi'} su kien</div>
        <div className="modal-sub">{isEdit ? 'Cap nhat thong tin' : 'Dien thong tin su kien moi'}</div>

        {[['Ten su kien','name','text'],['Dia diem','location','text'],['Ngay','date','date'],['Gio','time','time']].map(([l,k,t]) => (
          <div key={k} className="field">
            <label className="field-label">{l}</label>
            <input className="field-input" type={t} value={f[k]||''} onChange={e => setF({...f,[k]:e.target.value})}/>
          </div>
        ))}

        <div className="form-row">
          <div className="field">
            <label className="field-label">Loai</label>
            <select className="field-select" value={f.type} onChange={e => setF({...f, type:e.target.value})}>
              <option value="Hoi thao">Hoi thao</option>
              <option value="Workshop">Workshop</option>
              <option value="Concert">Concert</option>
            </select>
          </div>
          <div className="field">
            <label className="field-label">Emoji bieu tuong</label>
            <input className="field-input" value={f.emoji||''} onChange={e => setF({...f, emoji:e.target.value})} placeholder="🎪" maxLength={2}/>
          </div>
        </div>

        <div className="field">
          <label className="field-label">Anh su kien</label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{display:'none'}}
            onChange={handleImg}
          />
          <div
            onClick={() => fileRef.current.click()}
            style={{
              border:'1px dashed #d4c8b0',
              borderRadius:4,
              cursor:'pointer',
              textAlign:'center',
              background: preview ? 'transparent' : '#faf7f2',
              transition:'border-color .2s',
              position:'relative',
              minHeight:120,
              display:'flex',
              alignItems:'center',
              justifyContent:'center',
              overflow:'hidden',
            }}
            onMouseOver={e => e.currentTarget.style.borderColor='#c9a84c'}
            onMouseOut={e => e.currentTarget.style.borderColor='#d4c8b0'}
          >
            {preview ? (
              <>
                <img
                  src={preview}
                  alt="preview"
                  style={{width:'100%', height:160, objectFit:'cover', borderRadius:3, display:'block'}}
                />
                <div
                  style={{
                    position:'absolute', inset:0, background:'rgba(0,0,0,.5)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    opacity:0, transition:'opacity .2s', borderRadius:3,
                    flexDirection:'column', gap:6,
                  }}
                  onMouseOver={e => e.currentTarget.style.opacity=1}
                  onMouseOut={e => e.currentTarget.style.opacity=0}
                >
                  <span style={{fontSize:20}}>📷</span>
                  <span style={{color:'#fff', fontSize:11, letterSpacing:2, textTransform:'uppercase'}}>Doi anh khac</span>
                </div>
              </>
            ) : (
              <div style={{padding:20}}>
                <div style={{fontSize:28, marginBottom:8}}>📸</div>
                <div style={{fontSize:12, color:'#8a7f72', letterSpacing:.5}}>Nhan de chon anh</div>
                <div style={{fontSize:11, color:'#b8ae9e', marginTop:4}}>PNG · JPG · WEBP — Tu dong nen anh</div>
              </div>
            )}
          </div>
          {preview && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPreview(null);
                setF(prev => ({...prev, imageUrl: null}));
                fileRef.current.value = '';
              }}
              style={{
                marginTop:6, background:'none', border:'none',
                color:'#8b1a1a', fontSize:11, letterSpacing:.5,
                cursor:'pointer', padding:0, fontFamily:'inherit',
              }}
            >
              × Xoa anh
            </button>
          )}
        </div>

        <div className="form-row">
          <div className="field">
            <label className="field-label">Suc chua</label>
            <input className="field-input" type="number" value={f.capacity} onChange={e => setF({...f, capacity:+e.target.value})}/>
          </div>
          <div className="field">
            <label className="field-label">Gia ve (VND)</label>
            <input className="field-input" type="number" value={f.price} onChange={e => setF({...f, price:+e.target.value})}/>
          </div>
        </div>

        <div className="field">
          <label className="field-label">Mo ta</label>
          <textarea className="field-textarea" value={f.description||''} onChange={e => setF({...f, description:e.target.value})}/>
        </div>

        <div className="field">
          <label className="field-label">Dien gia (moi dong mot nguoi)</label>
          <textarea
            className="field-textarea"
            value={Array.isArray(f.speakers) ? f.speakers.join('\n') : (f.speakers||'')}
            onChange={e => setF({...f, speakers:e.target.value})}
            placeholder="Nguyen Van A - CEO Company&#10;Tran Thi B - CTO Startup"
          />
        </div>

        <div className="modal-foot">
          <button className="btn-cancel" onClick={onClose}>Huy bo</button>
          <button className="btn btn-gold" onClick={save} disabled={saving}>
            {saving ? 'Dang luu...' : 'Luu su kien'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminEvents({ onRefresh }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    api.get('/events')
      .then(r => {
        const data = (r.data.data || []).map(e => ({
          ...e,
          speakers: Array.isArray(e.speakers) ? e.speakers : [],
          sold: e.sold || 0,
          capacity: e.capacity || 1,
          price: e.price || 0,
        }));
        setEvents(data);
      })
      .catch(e => {
        setError('Khong the tai danh sach su kien');
        toast.error('Loi tai du lieu: ' + (e.response?.data?.message || e.message));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="loader"><div className="spinner"/></div>;

  if (error) return (
    <div style={{textAlign:'center', padding:40}}>
      <div style={{color:'var(--red)', marginBottom:12}}>{error}</div>
      <button className="btn btn-dark" onClick={load}>Thu lai</button>
    </div>
  );

  return (
    <div>
      {modal && (
        <EventModal
          event={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); onRefresh && onRefresh(); }}
        />
      )}

      <div style={{display:'flex', justifyContent:'flex-end', marginBottom:16}}>
        <button className="btn btn-dark" onClick={() => setModal('new')}>+ Them su kien</button>
      </div>

      {events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">◇</div>
          <div className="empty-title">Chua co su kien nao</div>
          <div className="empty-sub">Nhan "+ Them su kien" de tao moi</div>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Su kien</th>
                <th>Loai</th>
                <th>Ngay</th>
                <th>Ve ban</th>
                <th>Gia ve</th>
                <th>Trang thai</th>
                <th>Thao tac</th>
              </tr>
            </thead>
            <tbody>
              {events.map(e => {
                const pct = e.capacity > 0 ? Math.round((e.sold / e.capacity) * 100) : 0;
                return (
                  <tr key={e.id}>
                    <td>
                      <div style={{display:'flex', alignItems:'center', gap:10}}>
                        {e.imageUrl ? (
                          <img
                            src={e.imageUrl}
                            alt=""
                            style={{width:40, height:40, objectFit:'cover', borderRadius:3, flexShrink:0}}
                          />
                        ) : (
                          <div style={{
                            width:40, height:40, background:'#f3ede3', borderRadius:3,
                            display:'flex', alignItems:'center', justifyContent:'center',
                            fontSize:20, flexShrink:0,
                          }}>
                            {e.emoji}
                          </div>
                        )}
                        <div>
                          <div style={{fontFamily:'Cormorant Garamond,serif', fontSize:15, fontWeight:400}}>{e.name}</div>
                          <div style={{fontSize:11, color:'#8a7f72'}}>{e.location}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{fontSize:11, letterSpacing:1, color:'#8a7f72', textTransform:'uppercase'}}>{e.type}</td>
                    <td style={{fontSize:12}}>{e.date ? new Date(e.date).toLocaleDateString('vi-VN') : ''}</td>
                    <td>
                      <div style={{fontWeight:600}}>{e.sold}/{e.capacity}</div>
                      <div className="prog-bar" style={{width:70}}>
                        <div className="prog-fill" style={{
                          width:pct+'%',
                          background:pct>90?'#8b1a1a':pct>70?'#8b5e00':'#c9a84c'
                        }}/>
                      </div>
                    </td>
                    <td style={{fontFamily:'Cormorant Garamond,serif', fontSize:16, fontWeight:300}}>{fmt(e.price)}</td>
                    <td>
                      <span className={'status-tag status-'+(e.status==='active'?'active':'checked')}>
                        {e.status==='active' ? 'Dang mo' : 'Het ve'}
                      </span>
                    </td>
                    <td>
                      <div style={{display:'flex', gap:6}}>
                        <button className="btn-success btn-sm" onClick={() => setModal(e)}>Sua</button>
                        <button className="btn-danger btn-sm" onClick={async () => {
                          if (!window.confirm('Xoa su kien nay?')) return;
                          await api.delete('/events/'+e.id);
                          toast.success('Da xoa');
                          load();
                          onRefresh && onRefresh();
                        }}>Xoa</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
