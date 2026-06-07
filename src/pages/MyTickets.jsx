import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import './MyTickets.css';

const fmt = (n) => n===0?'Mien Phi':new Intl.NumberFormat('vi-VN').format(n)+'d';
const fmtD = (d) => new Date(d).toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric'});

const REFUND_REASONS = [
  'Ban lich dot xuat, khong the tham du',
  'Su kien bi huy hoac thay doi lich',
  'Mua nham su kien / so luong ve',
  'Van de suc khoe ca nhan',
  'Ly do cong viec dot xuat',
  'Khac (vui long mo ta)',
];

function exportTicketPDF(order) {
  const imgSrc = order.imageUrl || null;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(order.ticket_code)}&bgcolor=ffffff&color=000000&margin=4`;
  const evDate = new Date(order.event_date);
  const dayName = evDate.toLocaleDateString('vi-VN',{weekday:'long'});
  const dateStr = evDate.toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric'});
  const timeStr = (order.event_time||'').slice(0,5);
  const imgHtml = imgSrc
    ? `<img src="${imgSrc}" style="width:100%;height:260px;object-fit:cover;display:block;" crossorigin="anonymous"/>`
    : `<div style="width:100%;height:260px;background:linear-gradient(160deg,#1a0a3e 0%,#3d1875 40%,#6b2fa0 70%,#c9a84c 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;"><div style="font-size:72px;filter:drop-shadow(0 4px 16px rgba(0,0,0,.4))">${order.emoji||'🎫'}</div></div>`;

  const win = window.open('','_blank','width:480,height:780');
  win.document.write(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Ve - ${order.ticket_code}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap');
body{font-family:'Montserrat',Arial,sans-serif;background:#f0eeff;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px}
.ticket{width:380px;border-radius:12px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.35);background:#fff}
.img-wrap{position:relative;overflow:hidden}
.img-overlay{position:absolute;inset:0;background:linear-gradient(180deg,transparent 30%,rgba(0,0,0,.85) 100%)}
.img-label{position:absolute;top:16px;left:16px;background:#c9a84c;color:#1a1510;font-size:11px;font-weight:800;letter-spacing:3px;padding:5px 14px;border-radius:2px}
.img-title{position:absolute;bottom:0;left:0;right:0;padding:20px 20px 16px;color:#fff}
.img-event{font-size:20px;font-weight:800;line-height:1.2;margin-bottom:4px;text-shadow:0 2px 8px rgba(0,0,0,.5)}
.img-type{font-size:10px;letter-spacing:3px;color:rgba(255,255,255,.7);text-transform:uppercase}
.body{background:#1a1510;padding:20px 22px 16px}
.info-row{display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid rgba(201,168,76,.12)}
.info-row:last-of-type{border-bottom:none}
.info-icon{font-size:16px;width:22px;text-align:center;flex-shrink:0}
.info-label{font-size:9px;color:rgba(201,168,76,.5);letter-spacing:2px;text-transform:uppercase;margin-bottom:2px}
.info-value{font-size:13px;color:#faf7f2;font-weight:600;letter-spacing:.3px}
.footer{background:#13100a;padding:14px 20px;display:flex;align-items:center;justify-content:space-between;gap:12px}
.code{font-family:monospace;font-size:15px;font-weight:700;color:#c9a84c;letter-spacing:3px}
.status-pill{background:rgba(201,168,76,.12);border:1px solid rgba(201,168,76,.3);color:#c9a84c;font-size:9px;font-weight:600;letter-spacing:2px;text-transform:uppercase;padding:4px 10px;border-radius:20px;margin-top:6px;display:inline-block}
.qr-img{border-radius:4px;border:2px solid rgba(201,168,76,.2)}
.qr-label{font-size:8px;color:rgba(201,168,76,.4);letter-spacing:1.5px;text-transform:uppercase;text-align:center;margin-top:4px}
.sep{height:12px;background:#1a1510;display:flex;align-items:center;padding:0 8px}
.sep-c{width:20px;height:20px;background:#13100a;border-radius:50%;flex-shrink:0}
.sep-d{flex:1;border-bottom:2px dashed rgba(201,168,76,.2);margin:0 4px}
@media print{body{background:#fff;padding:0}.ticket{box-shadow:none;border-radius:0;width:100%}}
</style></head>
<body>
<div class="ticket">
  <div class="img-wrap">
    ${imgHtml}
    <div class="img-overlay"></div>
    <div class="img-label">TICKET</div>
    <div class="img-title">
      <div class="img-event">${order.event_name}</div>
      <div class="img-type">${order.event_type||''}</div>
    </div>
  </div>
  <div class="body">
    <div class="info-row"><div class="info-icon">📅</div><div><div class="info-label">Ngay dien ra</div><div class="info-value">${dayName}, ${dateStr}</div></div></div>
    <div class="info-row"><div class="info-icon">⏰</div><div><div class="info-label">Gio bat dau</div><div class="info-value">${timeStr}</div></div></div>
    <div class="info-row"><div class="info-icon">📍</div><div><div class="info-label">Dia diem</div><div class="info-value">${order.location||''}</div></div></div>
    <div class="info-row"><div class="info-icon">🎫</div><div><div class="info-label">So luong & Gia ve</div><div class="info-value">${order.quantity} ve · ${fmt(order.total || order.price || 0)}</div></div></div>
  </div>
  <div class="sep"><div class="sep-c"></div><div class="sep-d"></div><div class="sep-c"></div></div>
  <div class="footer">
    <div>
      <div style="font-size:9px;color:rgba(201,168,76,.45);letter-spacing:2px;text-transform:uppercase;margin-bottom:5px">Ma ve</div>
      <div class="code">${order.ticket_code}</div>
      <div class="status-pill">✓ Hop le</div>
    </div>
    <div><img class="qr-img" src="${qrUrl}" width="80" height="80" alt="QR"/><div class="qr-label">Quet check-in</div></div>
  </div>
</div>
<script>
window.onload=function(){
  var imgs=document.images,loaded=0,total=imgs.length;
  if(!total){setTimeout(window.print,400);return;}
  function done(){loaded++;if(loaded>=total)setTimeout(window.print,400);}
  for(var i=0;i<imgs.length;i++){if(imgs[i].complete)done();else{imgs[i].onload=done;imgs[i].onerror=done;}}
};
</script>
</body></html>`);
  win.document.close();
}

function RefundModal({ order, onClose, onSuccess }) {
  const [reason, setReason] = useState('');
  const [custom, setCustom] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const evDate = new Date(order.event_date);
  const now = new Date();
  // Tinh so ngay con lai (am neu da qua)
  const daysLeft = Math.ceil((evDate - now) / (1000*60*60*24));
  // Tinh so ngay da qua sau su kien
  const daysSince = Math.ceil((now - evDate) / (1000*60*60*24));

  // Chinh sach hoan tien:
  // - Truoc 3 ngay: 100%
  // - Truoc 1 ngay: 50%
  // - Trong ngay / sau su kien den 7 ngay: 0% (van cho gui yeu cau)
  // - Sau 7 ngay: khong cho hoan
  const refundPct = daysLeft >= 3 ? 100 : daysLeft >= 1 ? 50 : 0;
  const withinWindow = daysLeft >= 0 || daysSince <= 30;

  const handleSubmit = async () => {
    const finalReason = reason === 'Khac (vui long mo ta)' ? custom.trim() : reason;
    if (!finalReason) { toast.error('Vui long chon ly do hoan ve'); return; }
    setSubmitting(true);
    try {
      await api.post('/refunds', { order_id: order.order_id || order.id, reason: finalReason });
      toast.success('Gui yeu cau hoan ve thanh cong!');
      onSuccess();
    } catch(e) {
      toast.error(e.response?.data?.message || 'Loi khi gui yeu cau');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="rf-overlay" onClick={onClose}>
      <div className="rf-modal" onClick={e=>e.stopPropagation()}>
        <div className="rf-header">
          <div className="rf-title">Yeu cau hoan ve</div>
          <button className="rf-close" onClick={onClose}>×</button>
        </div>
        <div className="rf-body">

          <div className="rf-ticket-info">
            <div className="rf-ticket-name">{order.event_name}</div>
            <div className="rf-ticket-meta">{fmtD(order.event_date)} · {order.quantity} ve · {fmt(order.total || order.price || 0)}</div>
            <div className="rf-ticket-code">{order.ticket_code}</div>
          </div>

          <div className="rf-policy">
            <div className="rf-policy-title">Chinh sach hoan ve</div>
            <div className="rf-policy-rows">
              <div className={'rf-policy-row'+(daysLeft>=3?' active':'')}>
                <span className="rf-policy-check">{daysLeft>=3?'✓':'○'}</span>
                <span>Huy truoc 3 ngay su kien</span>
                <span className="rf-policy-pct" style={{color:daysLeft>=3?'#1a5c3a':'#8a7f72'}}>Hoan 100%</span>
              </div>
              <div className={'rf-policy-row'+(daysLeft>=1&&daysLeft<3?' active':'')}>
                <span className="rf-policy-check">{daysLeft>=1&&daysLeft<3?'✓':'○'}</span>
                <span>Huy truoc 1 ngay su kien</span>
                <span className="rf-policy-pct" style={{color:daysLeft>=1&&daysLeft<3?'#8b5e00':'#8a7f72'}}>Hoan 50%</span>
              </div>
              <div className={'rf-policy-row'+(daysLeft<1&&daysSince<=30?' active':'')}>
                <span className="rf-policy-check">{daysLeft<1&&daysSince<=30?'✓':'○'}</span>
                <span>Trong 30 ngay sau su kien</span>
                <span className="rf-policy-pct" style={{color:daysLeft<1&&daysSince<=30?'#8b1a1a':'#8a7f72'}}>Khong hoan</span>
              </div>
            </div>

            {refundPct > 0 ? (
              <div className="rf-refund-amt" style={{
                background:refundPct===100?'rgba(26,92,58,.08)':'rgba(139,94,0,.08)',
                borderColor:refundPct===100?'rgba(26,92,58,.2)':'rgba(139,94,0,.2)'
              }}>
                <span style={{color:'#8a7f72',fontSize:12}}>So tien duoc hoan:</span>
                <span style={{fontFamily:'Cormorant Garamond,serif',fontSize:20,color:refundPct===100?'#1a5c3a':'#8b5e00',fontWeight:400}}>
                  {fmt(Math.round((order.total || order.price || 0) * refundPct / 100))}
                  <span style={{fontSize:12,color:'#8a7f72',fontFamily:'inherit'}}> ({refundPct}%)</span>
                </span>
              </div>
            ) : withinWindow ? (
              <div className="rf-no-refund">
                ⚠ Su kien da dien ra — khong duoc hoan tien nhung ban van co the gui yeu cau de admin xem xet
              </div>
            ) : null}
          </div>

          <div className="rf-reason">
            <div className="rf-reason-label">Ly do hoan ve <span style={{color:'#8b1a1a'}}>*</span></div>
            <div className="rf-reason-list">
              {REFUND_REASONS.map(r=>(
                <label key={r} className={'rf-reason-item'+(reason===r?' selected':'')}>
                  <input type="radio" name="reason" value={r} checked={reason===r} onChange={()=>setReason(r)} style={{display:'none'}}/>
                  <span className="rf-radio">{reason===r?'◆':'◇'}</span>
                  <span>{r}</span>
                </label>
              ))}
            </div>
            {reason==='Khac (vui long mo ta)' && (
              <textarea
                className="rf-custom"
                placeholder="Mo ta ly do cua ban..."
                value={custom}
                onChange={e=>setCustom(e.target.value)}
                rows={3}
              />
            )}
          </div>
        </div>

        <div className="rf-footer">
          <button className="rf-btn-cancel" onClick={onClose}>Huy bo</button>
          <button
            className="rf-btn-submit"
            onClick={handleSubmit}
            disabled={submitting || !reason || (reason==='Khac (vui long mo ta)'&&!custom.trim())}
          >
            {submitting ? 'Dang gui...' : 'Gui yeu cau hoan ve'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReminderBanner({ orders }) {
  const [dismissed, setDismissed] = useState(()=>{
    try{return JSON.parse(localStorage.getItem('eh_dismissed')||'[]');}catch{return[];}
  });
  const reminders = useMemo(()=>{
    const now=new Date();
    return orders.filter(o=>{
      if(o.status==='cancelled'||dismissed.includes(o.ticket_code))return false;
      const d=new Date(o.event_date);
      if(o.event_time){const[h,m]=o.event_time.split(':');d.setHours(+h,+m);}
      const diff=d-now;
      return diff>0&&diff<24*60*60*1000;
    });
  },[orders,dismissed]);
  const dismiss=(code)=>{
    const n=[...dismissed,code];
    setDismissed(n);
    localStorage.setItem('eh_dismissed',JSON.stringify(n));
  };
  if(!reminders.length)return null;
  return(
    <div className="reminder-bar">
      <span style={{fontSize:20,flexShrink:0}}>🔔</span>
      <div style={{flex:1,display:'flex',flexDirection:'column',gap:6}}>
        {reminders.map(o=>{
          const d=new Date(o.event_date);
          if(o.event_time){const[h,m]=o.event_time.split(':');d.setHours(+h,+m);}
          const h=Math.round((d-new Date())/3600000);
          return(
            <div key={o.ticket_code} style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12}}>
              <span style={{fontSize:13,color:'#e8c96d',lineHeight:1.5}}>
                <strong>{o.event_name}</strong> dien ra sau <strong>{h<1?'duoi 1 gio':h+' gio'} nua!</strong>
                <span style={{fontFamily:'monospace',fontSize:11,background:'rgba(201,168,76,.15)',padding:'1px 6px',borderRadius:2,marginLeft:6}}>{o.ticket_code}</span>
              </span>
              <button onClick={()=>dismiss(o.ticket_code)} style={{background:'none',border:'none',color:'rgba(201,168,76,.5)',fontSize:18,cursor:'pointer',padding:'0 4px',lineHeight:1,flexShrink:0}}>×</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const FILTERS=['Tat ca','Hop le','Da vao','Da huy'];


// ── Review Modal ──────────────────────────────────
function ReviewModal({ order, onClose, onSubmit }) {
  const [rating, setRating] = React.useState(5);
  const [comment, setComment] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async () => {
    if (!comment.trim()) { alert('Vui lòng nhập nhận xét'); return; }
    setSubmitting(true);
    try {
      await onSubmit(order.event_id, rating, comment);
      onClose();
    } finally { setSubmitting(false); }
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:600, padding:20 }}>
      <div style={{ background:'#fff', width:480, maxWidth:'100%', borderRadius:8, overflow:'hidden', boxShadow:'0 20px 60px rgba(0,0,0,.3)' }}>
        <div style={{ background:'#1a1510', padding:'14px 20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:13, color:'#c9a84c', fontWeight:600 }}>⭐ Đánh giá sự kiện</span>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(255,255,255,.5)', fontSize:22, cursor:'pointer' }}>×</button>
        </div>
        <div style={{ padding:'20px 24px' }}>
          <div style={{ fontWeight:700, fontSize:16, marginBottom:4, color:'#1a1510' }}>{order.event_name}</div>
          <div style={{ fontSize:12, color:'#8a7f72', marginBottom:16 }}>{order.ticket_code}</div>

          {/* Stars */}
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:12, color:'#1a1510', fontWeight:600, marginBottom:8 }}>Đánh giá của bạn *</div>
            <div style={{ display:'flex', gap:6, alignItems:'center' }}>
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setRating(s)}
                  style={{ background:'none', border:'none', fontSize:32, cursor:'pointer', color: s <= rating ? '#f59e0b' : '#d4c8b0', transition:'color .15s', padding:0 }}>★</button>
              ))}
              <span style={{ fontSize:13, color:'#8a7f72', marginLeft:8 }}>
                {['','Rất tệ','Tệ','Bình thường','Tốt','Xuất sắc'][rating]}
              </span>
            </div>
          </div>

          {/* Comment */}
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:12, color:'#1a1510', fontWeight:600, marginBottom:8 }}>Nhận xét của bạn *</div>
            <textarea
              value={comment} onChange={e => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về sự kiện này..."
              style={{ width:'100%', minHeight:100, padding:'10px 14px', border:'1px solid #d4c8b0', borderRadius:4, fontSize:13, fontFamily:'inherit', resize:'vertical', outline:'none', color:'#1a1510', background:'#faf7f2', boxSizing:'border-box' }}
            />
          </div>
        </div>
        <div style={{ padding:'12px 20px', borderTop:'1px solid #e0d8cc', display:'flex', gap:10, justifyContent:'flex-end', background:'#f5f0e8' }}>
          <button onClick={onClose} style={{ background:'none', border:'1px solid #d4c8b0', color:'#8a7f72', padding:'9px 20px', fontSize:12, cursor:'pointer', fontFamily:'inherit', borderRadius:4 }}>Hủy bỏ</button>
          <button onClick={handleSubmit} disabled={submitting}
            style={{ background:'#c9a84c', border:'none', color:'#1a1510', padding:'9px 24px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', borderRadius:4, opacity: submitting ? .6 : 1 }}>
            {submitting ? 'Đang gửi...' : '⭐ Gửi đánh giá'}
          </button>
        </div>
      </div>
    </div>
  );
}

const TicketRow = React.memo(function TicketRow({ order:o, onPDF, onRefund, onReview, refundStatus }) {
  const evDate = new Date(o.event_date);
  if(o.event_time){const[h,m]=(o.event_time||'').split(':');evDate.setHours(+h||0,+m||0);}

  const now = new Date();
  const isToday = evDate > now && (evDate - now) < 24*60*60*1000;
  const daysSince = Math.ceil((now - evDate) / (1000*60*60*24));

  // Cho phep hoan ve: ve hop le + trong vong 30 ngay sau su kien
  const canRefund = o.status==='active' && daysSince <= 30;

  return (
    <div className={'tk-item'+(evDate < now && daysSince > 30 ?' tk-past':'')}>
      <div className="tk-qr-box">
        {o.imageUrl
          ? <img src={o.imageUrl} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:3}}/>
          : <div style={{fontSize:22}}>{isToday?'🔔':o.emoji||'🎫'}</div>
        }
      </div>
      <div className="tk-info">
        <div className="tk-event-name serif">{o.event_name}</div>
        <div className="tk-meta">{fmtD(o.event_date)} · {(o.event_time||'').slice(0,5)} · {o.location}</div>
        <div className="tk-detail">{o.quantity} ve · {fmt(o.total || o.price || 0)}</div>
        {isToday && (
          <div style={{fontSize:11,color:'#c9a84c',marginTop:3,fontWeight:600}}>
            🔔 Su kien dien ra hom nay!
          </div>
        )}
        {refundStatus && (
          <div style={{
            marginTop:5,display:'inline-flex',alignItems:'center',gap:5,
            fontSize:11,padding:'3px 10px',borderRadius:20,
            background: refundStatus==='approved'?'rgba(26,92,58,.08)':refundStatus==='rejected'?'rgba(139,26,26,.08)':'rgba(139,94,0,.08)',
            border:`1px solid ${refundStatus==='approved'?'rgba(26,92,58,.2)':refundStatus==='rejected'?'rgba(139,26,26,.2)':'rgba(139,94,0,.2)'}`,
            color: refundStatus==='approved'?'#1a5c3a':refundStatus==='rejected'?'#8b1a1a':'#8b5e00',
          }}>
            {refundStatus==='pending'?'⏳ Cho duyet hoan ve':refundStatus==='approved'?'✅ Da duyet hoan ve':'❌ Tu choi hoan ve'}
          </div>
        )}
        <div className="tk-code">{o.ticket_code}</div>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:6,alignItems:'flex-end'}}>
        <span className={'status-tag status-'+o.status}>
          {o.status==='active'?'Hop le':o.status==='checked'?'Da vao':'Da huy'}
        </span>

        {o.status !== 'cancelled' && (
          <button
            onClick={()=>onPDF(o)}
            style={{background:'none',border:'1px solid #d4c8b0',color:'#8a7f72',padding:'5px 12px',fontSize:10,letterSpacing:1.5,textTransform:'uppercase',cursor:'pointer',fontFamily:'inherit',borderRadius:2,transition:'all .2s',display:'flex',alignItems:'center',gap:4}}
            onMouseOver={e=>{e.currentTarget.style.borderColor='#c9a84c';e.currentTarget.style.color='#c9a84c'}}
            onMouseOut={e=>{e.currentTarget.style.borderColor='#d4c8b0';e.currentTarget.style.color='#8a7f72'}}
          >
            🖨 Xuat PDF
          </button>
        )}

        {canRefund && !refundStatus && (
          <button
            onClick={()=>onRefund(o)}
            style={{background:'none',border:'1px solid rgba(139,26,26,.35)',color:'#8b1a1a',padding:'5px 12px',fontSize:10,letterSpacing:1.5,textTransform:'uppercase',cursor:'pointer',fontFamily:'inherit',borderRadius:2,transition:'all .2s',display:'flex',alignItems:'center',gap:4}}
            onMouseOver={e=>{e.currentTarget.style.background='rgba(139,26,26,.06)'}}
            onMouseOut={e=>{e.currentTarget.style.background='none'}}
          >
            ↩ Hoan ve
          </button>
        )}
        {o.status === 'active' && (
          <button
            onClick={()=>onReview(o)}
            style={{background:'none',border:'1px solid rgba(201,168,76,.4)',color:'#c9a84c',padding:'5px 12px',fontSize:10,letterSpacing:1.5,textTransform:'uppercase',cursor:'pointer',fontFamily:'inherit',borderRadius:2,transition:'all .2s',display:'flex',alignItems:'center',gap:4}}
            onMouseOver={e=>{e.currentTarget.style.background='rgba(201,168,76,.08)'}}
            onMouseOut={e=>{e.currentTarget.style.background='none'}}
          >
            ⭐ Danh gia
          </button>
        )}
      </div>
    </div>
  );
});

export default function MyTickets() {
  const [orders, setOrders] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Tat ca');
  const [search, setSearch] = useState('');
  const [refundOrder, setRefundOrder] = useState(null);
  const [reviewOrder, setReviewOrder] = useState(null);
  const nav = useNavigate();

  const load = () => {
    Promise.all([
      api.get('/orders/my/tickets'),
      api.get('/refunds/my').catch(()=>({data:{data:[]}}))
    ]).then(([or,rr])=>{
      setOrders(or.data.data);
      setRefunds(rr.data.data||[]);
    }).catch(()=>{}).finally(()=>setLoading(false));
  };
  useEffect(()=>{load();},[]);

  const submitReview = async (eventId, rating, comment) => {
    await api.post(`/events/${eventId}/review`, { rating, comment });
    toast.success('Cảm ơn bạn đã đánh giá! ⭐');
  };

  const refundMap = useMemo(()=>{
    const m={};
    refunds.forEach(r=>{m[r.order_id]=r.status;});
    return m;
  },[refunds]);

  const filtered = useMemo(()=>{
    let list=orders;
    if(filter==='Hop le') list=list.filter(o=>o.status==='active');
    else if(filter==='Da vao') list=list.filter(o=>o.status==='checked');
    else if(filter==='Da huy') list=list.filter(o=>o.status==='cancelled');
    if(search.trim()){
      const q=search.toLowerCase();
      list=list.filter(o=>
        o.event_name?.toLowerCase().includes(q)||
        o.ticket_code?.toLowerCase().includes(q)||
        o.location?.toLowerCase().includes(q)
      );
    }
    return list;
  },[orders,filter,search]);

  if(loading) return <div className="loader"><div className="spinner"/></div>;

  return (
    <div>
      {reviewOrder && (
        <ReviewModal
          order={reviewOrder}
          onClose={() => setReviewOrder(null)}
          onSubmit={submitReview}
        />
      )}
      {refundOrder && (
        <RefundModal
          order={refundOrder}
          onClose={()=>setRefundOrder(null)}
          onSuccess={()=>{setRefundOrder(null);load();}}
        />
      )}

      <ReminderBanner orders={orders}/>

      <div className="tk-hero">
        <p className="tk-eye">Bo suu tap cua ban</p>
        <h1 className="section-title serif" style={{color:'#faf7f2'}}>Ve cua toi</h1>
        <p className="section-sub" style={{color:'#8a7f72'}}>
          {orders.length} ve · {orders.filter(o=>o.status==='active').length} hop le
        </p>
      </div>

      <div className="section">
        <div style={{display:'flex',gap:10,marginBottom:24,flexWrap:'wrap',alignItems:'center'}}>
          <input
            className="tk-search"
            placeholder="Tim kiem theo ten, ma ve, dia diem..."
            value={search}
            onChange={e=>setSearch(e.target.value)}
          />
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {FILTERS.map(f=>(
              <button key={f} onClick={()=>setFilter(f)} style={{
                background:filter===f?'#1a1510':'none',
                color:filter===f?'#c9a84c':'#8a7f72',
                border:'1px solid '+(filter===f?'#c9a84c':'#d4c8b0'),
                padding:'6px 14px',fontSize:11,letterSpacing:1.5,
                textTransform:'uppercase',cursor:'pointer',
                fontFamily:'inherit',borderRadius:2,transition:'all .2s'
              }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◇</div>
            <div className="empty-title">{search?'Khong tim thay':'Chua co ve nao'}</div>
            <div className="empty-sub">{search?'Thu tu khoa khac':'Hay kham pha va dat ve su kien yeu thich'}</div>
            {!search && (
              <button className="btn btn-dark" style={{marginTop:16}} onClick={()=>nav('/events')}>
                Kham pha su kien
              </button>
            )}
          </div>
        ) : (
          <div className="tk-list">
            {filtered.map(o=>(
              <TicketRow
                key={o.id}
                order={o}
                onPDF={exportTicketPDF}
                onRefund={setRefundOrder}
                onReview={setReviewOrder}
                refundStatus={refundMap[o.id]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
