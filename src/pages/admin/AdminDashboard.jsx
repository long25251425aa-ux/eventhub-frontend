import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import api from '../../services/api';
import AdminEvents from './AdminEvents';
import AdminOrders from './AdminOrders';
import AdminRefunds from './AdminRefunds';
import AdminUsers from './AdminUsers';
import AdminReport from './AdminReport';
import AdminCoupons from './AdminCoupons';
import './Admin.css';

const fmtMoney = n => new Intl.NumberFormat('vi-VN').format(n || 0) + 'đ';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingRefunds, setPendingRefunds] = useState(0);
  const { pathname } = useLocation();

  const loadStats = () => {
    api.get('/events/stats').then(r => setStats(r.data.data)).catch(() => {});
    api.get('/refunds').then(r => {
      setPendingRefunds((r.data.data || []).filter(x => x.status === 'pending').length);
    }).catch(() => {});
  };
  useEffect(() => { loadStats(); }, []);

  const tabs = [
    { to: '/admin', label: 'Sự kiện' },
    { to: '/admin/orders', label: 'Đơn đặt vé' },
    { to: '/admin/refunds', label: pendingRefunds > 0 ? `Hoàn vé (${pendingRefunds})` : 'Hoàn vé' },
    { to: '/admin/users', label: 'Người dùng' },
    { to: '/admin/coupons', label: '🏷️ Mã giảm giá' },
    { to: '/admin/report', label: 'Báo cáo' },
  ];
  const act = p => p === '/admin' ? pathname === p : pathname.startsWith(p);

  return (
    <div>
      <div className="admin-hero">
        <div className="ah-eye">Bảng điều khiển</div>
        <h1 className="section-title serif" style={{ color: '#faf7f2' }}>Quản trị hệ thống</h1>
      </div>
      <div className="section">
        {stats && (
          <div className="astats">
            {[
              { n: stats.totalEvents, l: 'Sự kiện', c: 'var(--gold)' },
              { n: stats.totalTickets, l: 'Vé đã bán', c: '#1a5c3a' },
              { n: fmtMoney(stats.totalRevenue), l: 'Doanh thu', c: '#8b5e00' },
              { n: (stats.checkinRate || 0) + '%', l: 'Tỉ lệ Check-in', c: '#993556' },
              { n: stats.totalUsers || 0, l: 'Người dùng', c: '#2563eb' },
            ].map(s => (
              <div key={s.l} className="astat-card">
                <div className="astat-n serif" style={{ color: s.c }}>{s.n}</div>
                <div className="astat-l">{s.l}</div>
              </div>
            ))}
          </div>
        )}

        <div className="admin-tabs">
          {tabs.map(t => (
            <Link key={t.to} to={t.to}
              className={'atab' + (act(t.to) ? ' active' : '')}
              style={{
                color: t.to === '/admin/refunds' && pendingRefunds > 0 && !act('/admin/refunds') ? 'var(--gold)' : undefined,
                fontWeight: t.to === '/admin/refunds' && pendingRefunds > 0 ? 600 : undefined,
              }}>
              {t.label}
            </Link>
          ))}
        </div>

        {pendingRefunds > 0 && !pathname.startsWith('/admin/refunds') && (
          <div style={{ background: 'rgba(139,94,0,.06)', border: '1px solid rgba(139,94,0,.2)', borderRadius: 4, padding: '10px 16px', marginBottom: 20, fontSize: 13, color: '#7a5010', display: 'flex', alignItems: 'center', gap: 10 }}>
            ⚠️ Có <strong>{pendingRefunds}</strong> yêu cầu hoàn vé đang chờ duyệt.
            <Link to="/admin/refunds" style={{ color: 'var(--gold)', marginLeft: 4, fontSize: 11, letterSpacing: 1 }}>Xử lý ngay →</Link>
          </div>
        )}

        <Routes>
          <Route index element={<AdminEvents onRefresh={loadStats} />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="refunds" element={<AdminRefunds onRefresh={loadStats} />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="report" element={<AdminReport stats={stats} />} />
        </Routes>
      </div>
    </div>
  );
}
