import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const fmt = n => new Intl.NumberFormat('vi-VN').format(n||0) + 'Ä‘';
const fmtD = d => new Date(new Date(d).getTime() - 9*60*60*1000).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

const STATUS_MAP = {
  pending:   { label: 'Chá» thanh toÃ¡n', color: '#8b5e00', bg: 'rgba(139,94,0,.1)',   border: 'rgba(139,94,0,.3)'   },
  paid:      { label: 'ÄÃ£ xÃ¡c nháº­n',    color: '#1a5c3a', bg: 'rgba(26,92,58,.1)',   border: 'rgba(26,92,58,.3)'   },
  cancelled: { label: 'ÄÃ£ há»§y',         color: '#8b1a1a', bg: 'rgba(139,26,26,.1)',  border: 'rgba(139,26,26,.3)'  },
  refunded:  { label: 'ÄÃ£ hoÃ n tiá»n',   color: '#2563eb', bg: 'rgba(37,99,235,.1)',  border: 'rgba(37,99,235,.3)'  },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/orders').then(r => setOrders(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const confirm = async (id, name) => {
    if (!window.confirm(`XÃ¡c nháº­n thanh toÃ¡n Ä‘Æ¡n hÃ ng cá»§a ${name}?`)) return;
    try {
      await api.patch(`/orders/${id}/confirm-payment`);
      toast.success('âœ… ÄÃ£ xÃ¡c nháº­n! VÃ© sáº½ hiá»‡n trong má»¥c "VÃ© cá»§a tÃ´i" cá»§a ngÆ°á»i dÃ¹ng.');
      load();
    } catch (e) { toast.error(e.response?.data?.message || 'Lá»—i'); }
  };

  const cancel = async (id) => {
    if (!window.confirm('Há»§y Ä‘Æ¡n hÃ ng nÃ y?')) return;
    try {
      await api.delete(`/orders/${id}`);
      toast.success('ÄÃ£ há»§y Ä‘Æ¡n hÃ ng');
      load();
    } catch (e) { toast.error(e.response?.data?.message || 'Lá»—i'); }
  };

  const filtered = orders.filter(o => {
    const matchStatus = filter === 'all' || o.status === filter;
    const matchSearch = !search || o.order_code?.toLowerCase().includes(search.toLowerCase()) || o.user_name?.toLowerCase().includes(search.toLowerCase()) || o.event_title?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const pendingCount = orders.filter(o => o.status === 'pending').length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Quáº£n lÃ½ Ä‘Æ¡n hÃ ng</h2>
          <p style={{ fontSize: 12, color: 'var(--text3)' }}>Admin xÃ¡c nháº­n thanh toÃ¡n Ä‘á»ƒ vÃ© xuáº¥t hiá»‡n trong tÃ i khoáº£n ngÆ°á»i dÃ¹ng</p>
        </div>
        {pendingCount > 0 && (
          <div style={{ background: 'rgba(139,94,0,.1)', border: '1px solid rgba(139,94,0,.3)', borderRadius: 4, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>âš ï¸</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#8b5e00' }}>{pendingCount} Ä‘Æ¡n chá» xÃ¡c nháº­n</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>Cáº§n admin duyá»‡t Ä‘á»ƒ ngÆ°á»i dÃ¹ng nháº­n vÃ©</div>
            </div>
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ðŸ” TÃ¬m mÃ£ Ä‘Æ¡n, tÃªn ngÆ°á»i dÃ¹ng..."
          style={{ flex: 1, minWidth: 200, background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 12px', fontSize: 12, fontFamily: 'inherit', outline: 'none', borderRadius: 4 }} />
        {[['all','Táº¥t cáº£'], ['pending','â³ Chá» duyá»‡t'], ['paid','âœ… ÄÃ£ duyá»‡t'], ['cancelled','âŒ ÄÃ£ há»§y']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)}
            style={{ padding: '8px 16px', background: filter === v ? 'var(--dark)' : 'none', border: `1px solid ${filter === v ? 'var(--gold)' : 'var(--border)'}`, color: filter === v ? 'var(--gold)' : 'var(--text3)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, letterSpacing: 1, borderRadius: 4, position: 'relative' }}>
            {l}
            {v === 'pending' && pendingCount > 0 && <span style={{ position: 'absolute', top: -6, right: -6, background: '#e8453c', color: '#fff', width: 16, height: 16, borderRadius: '50%', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{pendingCount}</span>}
          </button>
        ))}
      </div>

      {/* Orders table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text3)' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>ðŸ“‹</div>
          <div style={{ fontSize: 14 }}>{filter === 'pending' ? 'KhÃ´ng cÃ³ Ä‘Æ¡n nÃ o chá» xÃ¡c nháº­n' : 'KhÃ´ng cÃ³ Ä‘Æ¡n hÃ ng nÃ o'}</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--border)' }}>
          {filtered.map(o => {
            const st = STATUS_MAP[o.status] || STATUS_MAP.pending;
            return (
              <div key={o.id} style={{ background: 'var(--bg3)', padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                  {/* Thumbnail */}
                  {o.thumbnail && <img src={o.thumbnail} alt="" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} />}

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--gold)', fontWeight: 700, letterSpacing: 1 }}>{o.order_code}</span>
                      <span style={{ fontSize: 10, letterSpacing: 1.5, padding: '2px 8px', borderRadius: 2, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>{st.label}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{o.event_title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                      ðŸ‘¤ <strong style={{ color: 'var(--text)' }}>{o.user_name}</strong> Â· {o.user_email}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                      ðŸŽ« {o.ticket_count} vÃ© Â· ðŸ• {fmtD(o.created_at)}
                    </div>
                  </div>

                  {/* Amount */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 22, fontWeight: 300, color: 'var(--gold)' }}>{fmt(o.total || o.total_price)}</div>
                    {o.paid_at && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>ÄÃ£ thanh toÃ¡n: {fmtD(o.paid_at)}</div>}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                    {o.status === 'pending' && (
                      <button onClick={() => confirm(o.id, o.user_name)}
                        style={{ background: '#1a5c3a', border: 'none', color: '#fff', padding: '8px 16px', fontSize: 11, letterSpacing: 1, cursor: 'pointer', fontFamily: 'inherit', borderRadius: 4, fontWeight: 600 }}>
                        âœ… XÃ¡c nháº­n thanh toÃ¡n
                      </button>
                    )}
                    {o.status === 'paid' && (
                      <div style={{ fontSize: 11, color: '#1a5c3a', background: 'rgba(26,92,58,.08)', border: '1px solid rgba(26,92,58,.2)', padding: '6px 12px', borderRadius: 4, textAlign: 'center' }}>
                        âœ“ ÄÃ£ gá»­i vÃ© cho ngÆ°á»i dÃ¹ng
                      </div>
                    )}
                    {o.status === 'pending' && (
                      <button onClick={() => cancel(o.id)}
                        style={{ background: 'none', border: '1px solid rgba(139,26,26,.3)', color: '#8b1a1a', padding: '6px 16px', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', borderRadius: 4 }}>
                        âœ• Há»§y Ä‘Æ¡n
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text3)', padding: '8px 12px', background: 'rgba(201,168,76,.06)', border: '1px solid rgba(201,168,76,.15)', borderRadius: 4 }}>
        ðŸ’¡ Sau khi nháº¥n <strong>"XÃ¡c nháº­n thanh toÃ¡n"</strong>, vÃ© sáº½ tá»± Ä‘á»™ng xuáº¥t hiá»‡n trong má»¥c <strong>"VÃ© cá»§a tÃ´i"</strong> cá»§a ngÆ°á»i dÃ¹ng.
      </div>
    </div>
  );
}




