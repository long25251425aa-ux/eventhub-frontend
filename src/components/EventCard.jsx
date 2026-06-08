import React from 'react';
import { useNavigate } from 'react-router-dom';
import './EventCard.css';
const fmt = (n) => n === 0 ? 'Free' : new Intl.NumberFormat('vi-VN').format(n) + 'd';
const fmtD = (d) => new Date(d).toLocaleDateString('en-US', { day:'2-digit', month:'2-digit', year:'numeric' });
export default function EventCard({ event: e }) {
  const navigate = useNavigate();
  const left = e.capacity - e.sold;
  const pct = Math.round(e.sold / e.capacity * 100);
  const leftCls = left <= 0 ? 'none' : left < 20 ? 'low' : '';
  return (
    <div className="ecard" onClick={() => navigate('/events/' + (e.slug || e.id))}>
      <div className="ecard-img" style={{ background: e.bg_color || '#1a1510', padding: 0 }}>
        {e.image_url ? (
          <img src={e.image_url} alt={e.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
        ) : (
          <span className="ecard-emoji">{e.emoji || '🎫'}</span>
        )}
        <span className="ecard-type">{e.type}</span>
      </div>
      <div className="ecard-body">
        <h3 className="ecard-name serif">{e.name}</h3>
        <div className="ecard-meta">
          <span>📅 {fmtD(e.date)} · {(e.time||'').slice(0,5)}</span>
          <span>📍 {e.location}</span>
        </div>
      </div>
      <div className="ecard-foot">
        <div>
          <div className={'ecard-price' + (e.price===0?' free':'')}>{fmt(e.price)}</div>
          <div className={'ecard-left ' + leftCls}>{left<=0 ? 'Sold Out' : left < 20 ? left+' tickets left' : left+' tickets left'}</div>
          <div className="prog-bar" style={{width:90}}><div className="prog-fill" style={{width:pct+'%',background:pct>90?'#8b1a1a':pct>70?'#8b5e00':'#c9a84c'}}/></div>
        </div>
        <button className="btn btn-dark btn-sm" onClick={ev=>{ev.stopPropagation();navigate('/events/'+(e.slug||e.id));}}>View</button>
      </div>
    </div>
  );
}