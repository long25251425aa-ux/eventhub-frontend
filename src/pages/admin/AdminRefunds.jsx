import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const fmt = (n) => n===0?'Mien Phi':new Intl.NumberFormat('vi-VN').format(n)+'d';

function ReviewModal({ rr, onClose, onDone }) {
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const refundAmt100 = rr.total || rr.total_price || 0;
  const refundAmt50 = Math.round(rr.total || rr.total_price || 0 * 0.5);
  const evDate = new Date(rr.event_date || rr.created_at);
  const daysLeft = Math.ceil((evDate - new Date()) / (1000*60*60*24));
  const suggestedPct = daysLeft >= 3 ? 100 : daysLeft >= 1 ? 50 : 0;

  const submit = async (status) => {
    setSubmitting(true);
    try {
      await api.patch('/refunds/'+rr.id, { status, admin_note: note.trim()||null });
      toast.success(status==='approved'?'Da duyet hoan ve!':'Da tu choi yeu cau');
      onDone();
    } catch(e) { toast.error(e.response?.data?.message||'Loi'); }
    finally { setSubmitting(false); }
  };

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.65)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:300,padding:20}} onClick={onClose}>
      <div style={{background:'#fff',width:480,maxWidth:'100%',borderRadius:4,overflow:'hidden',boxShadow:'0 20px 60px rgba(0,0,0,.25)'}} onClick={e=>e.stopPropagation()}>
        <div style={{background:'#1a1510',padding:'16px 20px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{fontSize:14,letterSpacing:2,color:'#c9a84c',textTransform:'uppercase',fontFamily:'Montserrat,sans-serif',fontWeight:500}}>Duyet yeu cau hoan ve</div>
          <button onClick={onClose} style={{background:'none',border:'none',color:'#8a7f72',fontSize:22,cursor:'pointer'}}>×</button>
        </div>
        <div style={{padding:20,display:'flex',flexDirection:'column',gap:14}}>
          <div style={{background:'#f3ede3',border:'1px solid #e8dfc8',borderRadius:4,padding:'14px 16px'}}>
            <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:16,fontWeight:700,marginBottom:4}}>{rr.event_name}</div>
            <div style={{fontSize:12,color:'#8a7f72',marginBottom:4}}>{rr.user_name} · {rr.user_email}</div>
            <div style={{fontSize:12,color:'#3a3530',marginBottom:6}}>Ma ve: <span style={{fontFamily:'monospace',color:'#c9a84c'}}>{rr.ticket_code}</span></div>
            <div style={{fontSize:13,color:'#1a1510'}}>{rr.quantity} ve · Gia tri: <strong>{fmt(rr.total || rr.total_price || 0)}</strong></div>
          </div>
          <div style={{background:'#faf7f2',border:'1px solid #e8dfc8',borderRadius:4,padding:'12px 14px'}}>
            <div style={{fontSize:10,letterSpacing:2,color:'#8a7f72',textTransform:'uppercase',marginBottom:8}}>Ly do khach hang</div>
            <div style={{fontSize:13,color:'#1a1510',lineHeight:1.6}}>{rr.reason}</div>
          </div>
          <div style={{background:suggestedPct===100?'rgba(26,92,58,.06)':suggestedPct===50?'rgba(139,94,0,.06)':'rgba(139,26,26,.06)',border:`1px solid ${suggestedPct===100?'rgba(26,92,58,.2)':suggestedPct===50?'rgba(139,94,0,.2)':'rgba(139,26,26,.2)'}`,borderRadius:4,padding:'10px 14px'}}>
            <div style={{fontSize:11,color:'#8a7f72',marginBottom:4}}>De xuat theo chinh sach:</div>
            <div style={{fontSize:14,fontWeight:600,color:suggestedPct===100?'#1a5c3a':suggestedPct===50?'#8b5e00':'#8b1a1a'}}>
              {suggestedPct===100?`Hoan 100% — ${fmt(refundAmt100)}`:suggestedPct===50?`Hoan 50% — ${fmt(refundAmt50)}`:'Khong du dieu kien hoan tien'}
            </div>
          </div>
          <div>
            <div style={{fontSize:10,letterSpacing:2,color:'#8a7f72',textTransform:'uppercase',marginBottom:6}}>Ghi chu admin (tuy chon)</div>
            <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Ghi chu them cho khach hang..." rows={2}
              style={{width:'100%',border:'1px solid #d4c8b0',borderRadius:4,padding:'9px 12px',fontSize:13,fontFamily:'inherit',resize:'none',outline:'none',background:'#faf7f2'}}/>
          </div>
        </div>
        <div style={{padding:'14px 20px',borderTop:'1px solid #e8dfc8',display:'flex',gap:10,justifyContent:'flex-end',background:'#faf7f2'}}>
          <button onClick={onClose} style={{background:'none',border:'1px solid #d4c8b0',color:'#8a7f72',padding:'9px 18px',fontSize:11,letterSpacing:1.5,textTransform:'uppercase',cursor:'pointer',fontFamily:'inherit',borderRadius:2}}>Huy</button>
          <button onClick={()=>submit('rejected')} disabled={submitting}
            style={{background:'none',border:'1px solid rgba(139,26,26,.4)',color:'#8b1a1a',padding:'9px 18px',fontSize:11,letterSpacing:1.5,textTransform:'uppercase',cursor:'pointer',fontFamily:'inherit',borderRadius:2,transition:'all .2s'}}>
            Tu choi
          </button>
          <button onClick={()=>submit('approved')} disabled={submitting}
            style={{background:'#1a5c3a',border:'none',color:'#fff',padding:'9px 20px',fontSize:11,letterSpacing:1.5,textTransform:'uppercase',cursor:'pointer',fontFamily:'inherit',borderRadius:2,fontWeight:500,opacity:submitting?.6:1}}>
            {submitting?'Dang xu ly...':'Duyet hoan ve'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminRefunds() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [reviewing, setReviewing] = useState(null);

  const load = () => {
    api.get('/refunds').then(r=>setRefunds(r.data.data||[])).finally(()=>setLoading(false));
  };
  useEffect(load, []);

  const filtered = filter==='all' ? refunds : refunds.filter(r=>r.status===filter);
  const pendingCount = refunds.filter(r=>r.status==='pending').length;

  if (loading) return <div className="loader"><div className="spinner"/></div>;

  return (
    <div>
      {reviewing && <ReviewModal rr={reviewing} onClose={()=>setReviewing(null)} onDone={()=>{setReviewing(null);load();}}/>}

      <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap',alignItems:'center'}}>
        {[
          {key:'all',label:'Tat ca ('+refunds.length+')'},
          {key:'pending',label:'⏳ Cho duyet'+(pendingCount>0?' ('+pendingCount+')':'')},
          {key:'approved',label:'✅ Da duyet'},
          {key:'rejected',label:'❌ Tu choi'},
        ].map(f=>(
          <button key={f.key} onClick={()=>setFilter(f.key)}
            style={{background:filter===f.key?'#1a1510':'none',color:filter===f.key?'#c9a84c':'#8a7f72',border:'1px solid '+(filter===f.key?'#c9a84c':'#d4c8b0'),padding:'6px 16px',fontSize:11,letterSpacing:1.5,textTransform:'uppercase',cursor:'pointer',fontFamily:'inherit',borderRadius:2,transition:'all .2s',fontWeight:f.key==='pending'&&pendingCount>0?600:400}}>
            {f.label}
          </button>
        ))}
      </div>

      {pendingCount>0&&(
        <div style={{background:'rgba(139,94,0,.08)',border:'1px solid rgba(139,94,0,.25)',borderRadius:4,padding:'12px 16px',marginBottom:20,fontSize:13,color:'#7a5010',display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:18}}>⚠️</span>
          <span>Co <strong>{pendingCount}</strong> yeu cau hoan ve dang cho duyet. Kiem tra va xu ly som!</span>
        </div>
      )}

      {filtered.length===0 ? (
        <div className="empty-state"><div className="empty-icon">◇</div><div className="empty-title">Khong co yeu cau nao</div></div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Ma ve</th><th>Su kien</th><th>Khach hang</th><th>Gia tri</th><th>Ly do</th><th>Ngay gui</th><th>Trang thai</th><th>Xu ly</th></tr></thead>
            <tbody>
              {filtered.map(r=>(
                <tr key={r.id}>
                  <td style={{fontFamily:'monospace',fontSize:11,letterSpacing:1.5,color:'#c9a84c'}}>{r.ticket_code}</td>
                  <td style={{fontSize:13}}>{r.event_name}</td>
                  <td><div style={{fontSize:13}}>{r.user_name}</div><div style={{fontSize:11,color:'#8a7f72'}}>{r.user_email}</div></td>
                  <td style={{fontFamily:'Cormorant Garamond,serif',fontSize:16,fontWeight:300}}>{fmt(r.total || r.total_price || 0)}</td>
                  <td style={{fontSize:12,color:'#3a3530',maxWidth:160}}><div style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:160}} title={r.reason}>{r.reason}</div></td>
                  <td style={{fontSize:12}}>{new Date(r.created_at).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <span style={{padding:'4px 12px',fontSize:9,letterSpacing:2,textTransform:'uppercase',fontFamily:'Montserrat,sans-serif',fontWeight:500,
                      background:r.status==='pending'?'rgba(139,94,0,.08)':r.status==='approved'?'rgba(26,92,58,.08)':'rgba(139,26,26,.08)',
                      color:r.status==='pending'?'#8b5e00':r.status==='approved'?'#1a5c3a':'#8b1a1a',
                      border:`1px solid ${r.status==='pending'?'rgba(139,94,0,.2)':r.status==='approved'?'rgba(26,92,58,.2)':'rgba(139,26,26,.2)'}`
                    }}>
                      {r.status==='pending'?'Cho duyet':r.status==='approved'?'Da duyet':'Tu choi'}
                    </span>
                    {r.admin_note&&<div style={{fontSize:11,color:'#8a7f72',marginTop:3,fontStyle:'italic'}}>{r.admin_note}</div>}
                  </td>
                  <td>
                    {r.status==='pending'&&(
                      <button onClick={()=>setReviewing(r)}
                        style={{background:'#1a1510',border:'1px solid #c9a84c',color:'#c9a84c',padding:'5px 14px',fontSize:10,letterSpacing:1.5,textTransform:'uppercase',cursor:'pointer',fontFamily:'inherit',borderRadius:2,transition:'all .2s'}}>
                        Xu ly
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
