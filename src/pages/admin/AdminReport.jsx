import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const fmt = n => new Intl.NumberFormat('vi-VN').format(n || 0);
const fmtD = d => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

// Mini bar chart thuần CSS
function BarChart({ data, valueKey, labelKey, color = 'var(--gold)' }) {
  if (!data?.length) return <div style={{ textAlign: 'center', padding: 32, color: 'var(--text3)', fontSize: 13 }}>Chưa có dữ liệu</div>;
  const max = Math.max(...data.map(d => d[valueKey] || 0)) || 1;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, padding: '0 4px' }}>
      {data.map((d, i) => {
        const pct = Math.round((d[valueKey] || 0) / max * 100);
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
            title={`${d[labelKey]}: ${fmt(d[valueKey])}`}>
            <div style={{ fontSize: 9, color: 'var(--text3)', fontWeight: 600, textAlign: 'center' }}>
              {d[valueKey] > 0 ? (d[valueKey] > 999 ? Math.round(d[valueKey]/1000)+'k' : d[valueKey]) : ''}
            </div>
            <div style={{ width: '100%', height: 90, display: 'flex', alignItems: 'flex-end' }}>
              <div style={{ width: '100%', height: pct + '%', background: color, borderRadius: '2px 2px 0 0', minHeight: pct > 0 ? 4 : 0, transition: 'height .5s ease' }} />
            </div>
            <div style={{ fontSize: 9, color: 'var(--text3)', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
              {String(d[labelKey]).slice(0, 8)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Donut chart thuần CSS
function DonutChart({ data }) {
  if (!data?.length) return null;
  const total = data.reduce((s, d) => s + (d.count || 0), 0) || 1;
  let offset = 0;
  const COLORS = ['#c9a84c','#2563eb','#db2777','#16a34a','#ea580c','#0891b2','#d97706','#9333ea'];
  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
      <svg viewBox="0 0 36 36" style={{ width: 110, height: 110, flexShrink: 0 }}>
        <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--border)" strokeWidth="3"/>
        {data.map((d, i) => {
          const pct = (d.count || 0) / total * 100;
          const c = (
            <circle key={i} cx="18" cy="18" r="15.9" fill="none"
              stroke={COLORS[i % COLORS.length]} strokeWidth="3"
              strokeDasharray={`${pct} ${100 - pct}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 18 18)"
            />
          );
          offset += pct;
          return c;
        })}
        <text x="18" y="20" textAnchor="middle" style={{ fontSize: '6px', fill: 'var(--text3)' }}>{total} SK</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
            <span style={{ color: 'var(--text2)' }}>{d.name}</span>
            <span style={{ color: 'var(--text3)', marginLeft: 4 }}>{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminReport({ stats }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders').then(r => setOrders(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Tổng hợp doanh thu theo ngày (7 ngày gần nhất)
  const revenueByDay = (() => {
    const map = {};
    const days = [...Array(7)].map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      return d.toISOString().slice(0, 10);
    });
    days.forEach(d => { map[d] = 0; });
    orders.filter(o => o.status === 'paid').forEach(o => {
      const d = (o.paid_at || o.created_at || '').slice(0, 10);
      if (map[d] !== undefined) map[d] += Number(o.total || 0);
    });
    return days.map(d => ({ label: d.slice(5), revenue: map[d] }));
  })();

  // Đơn theo trạng thái
  const orderStatus = (() => {
    const map = { paid: 0, pending: 0, cancelled: 0, refunded: 0 };
    orders.forEach(o => { if (map[o.status] !== undefined) map[o.status]++; });
    return [
      { label: 'Đã thanh toán', count: map.paid, color: '#1a5c3a' },
      { label: 'Chờ thanh toán', count: map.pending, color: '#8b5e00' },
      { label: 'Đã hủy', count: map.cancelled, color: '#8b1a1a' },
      { label: 'Hoàn vé', count: map.refunded, color: '#2563eb' },
    ];
  })();

  // Top 5 sự kiện doanh thu cao
  const topEvents = stats?.topEvents || [];

  // Export CSV
  const exportCSV = () => {
    if (!orders.length) { toast.error('Không có dữ liệu để xuất'); return; }
    const rows = [
      ['Mã đơn', 'Khách hàng', 'Email', 'Sự kiện', 'Tổng tiền', 'Trạng thái', 'Thanh toán', 'Ngày tạo'],
      ...orders.map(o => [
        o.order_code, o.user_name, o.user_email, o.event_title,
        o.total, o.status, o.payment_status,
        new Date(o.created_at).toLocaleDateString('vi-VN'),
      ])
    ];
    const csv = rows.map(r => r.map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const bom = '\uFEFF';
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `eventhub-baocao-${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast.success('Xuất báo cáo CSV thành công!');
  };

  const totalRevenue = orders.filter(o => o.status === 'paid').reduce((s, o) => s + Number(o.total || 0), 0);
  const totalPaid = orders.filter(o => o.status === 'paid').length;
  const totalPending = orders.filter(o => o.status === 'pending').length;

  return (
    <div>
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 1, background: 'var(--border)', marginBottom: 28 }}>
        {[
          { label: 'Tổng doanh thu', value: fmt(stats?.totalRevenue || totalRevenue) + 'đ', color: '#c9a84c', icon: '💰' },
          { label: 'Vé đã bán', value: fmt(stats?.totalTickets || 0), color: '#1a5c3a', icon: '🎫' },
          { label: 'Sự kiện hoạt động', value: stats?.totalEvents || 0, color: '#2563eb', icon: '📅' },
          { label: 'Người dùng', value: stats?.totalUsers || 0, color: '#7c3aed', icon: '👥' },
          { label: 'Tỉ lệ check-in', value: (stats?.checkinRate || 0) + '%', color: '#db2777', icon: '✅' },
          { label: 'Đơn chờ duyệt', value: totalPending, color: '#8b5e00', icon: '⏳' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg3)', padding: '20px 18px' }}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 300, color: s.color, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button className="btn btn-gold" onClick={exportCSV}>
          📊 Xuất báo cáo CSV
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Doanh thu 7 ngày */}
        <div style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 4, padding: '20px 20px 16px' }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 16 }}>Doanh thu 7 ngày gần nhất</div>
          <BarChart data={revenueByDay} valueKey="revenue" labelKey="label" color="var(--gold)" />
        </div>

        {/* Trạng thái đơn hàng */}
        <div style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 4, padding: '20px' }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 16 }}>Phân bổ đơn hàng</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {orderStatus.map(s => {
              const total = orders.length || 1;
              const pct = Math.round(s.count / total * 100);
              return (
                <div key={s.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: 'var(--text2)' }}>{s.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: s.color }}>{s.count} ({pct}%)</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: pct + '%', height: '100%', background: s.color, borderRadius: 3, transition: 'width .5s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Danh mục sự kiện */}
      {stats?.byCategory?.length > 0 && (
        <div style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 4, padding: '20px', marginBottom: 24 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 16 }}>Phân bổ theo danh mục</div>
          <DonutChart data={stats.byCategory} />
        </div>
      )}

      {/* Top sự kiện */}
      {topEvents.length > 0 && (
        <div style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 4, padding: '20px', marginBottom: 24 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 16 }}>Top 5 sự kiện doanh thu cao nhất</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--border)' }}>
            {topEvents.map((e, i) => {
              const pct = e.capacity > 0 ? Math.round(e.sold / e.capacity * 100) : 0;
              return (
                <div key={e.id} style={{ background: 'var(--bg3)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: i === 0 ? 'rgba(201,168,76,.15)' : 'var(--bg2)', border: `1px solid ${i === 0 ? 'rgba(201,168,76,.3)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: i === 0 ? 'var(--gold)' : 'var(--text3)', flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div style={{ width: 36, height: 36, borderRadius: 3, overflow: 'hidden', flexShrink: 0, background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                    {e.thumbnail ? <img src={e.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🎫'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontFamily: 'Cormorant Garamond, serif', fontWeight: 600 }}>{e.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                      {fmtD(e.start_date)} · {e.sold}/{e.capacity} vé ({pct}%)
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, color: 'var(--gold)' }}>{fmt(e.revenue)}đ</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)' }}>Doanh thu</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Đơn hàng gần nhất */}
      <div style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 4, padding: '20px' }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 16 }}>Đơn hàng gần nhất</div>
        {loading ? <div className="loader"><div className="spinner" /></div> : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Mã đơn</th><th>Khách hàng</th><th>Sự kiện</th><th>Tổng tiền</th><th>Thanh toán</th><th>Ngày</th></tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map(o => (
                  <tr key={o.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--gold)' }}>{o.order_code}</td>
                    <td>
                      <div style={{ fontSize: 13 }}>{o.user_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{o.user_email}</div>
                    </td>
                    <td style={{ fontSize: 12, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.event_title}</td>
                    <td style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16 }}>{fmt(o.total)}đ</td>
                    <td><span className={`status-tag status-${o.payment_status}`}>{o.payment_status === 'paid' ? 'Đã thanh toán' : o.payment_status === 'pending' ? 'Chờ' : o.payment_status === 'refunded' ? 'Hoàn' : 'Thất bại'}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--text3)' }}>{fmtD(o.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
