import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

export default function Navbar() {
  const { user, logout, isAdmin, isOrganizer } = useAuth();
  const { dark, toggle } = useTheme();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef();

  const act = p => pathname === p || (p !== '/' && pathname.startsWith(p));

  useEffect(() => {
    if (!user) return;
    const load = () => api.get('/users/notifications').then(r => { setNotifs(r.data.data || []); setUnread(r.data.unread || 0); }).catch(() => {});
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [user]);

  useEffect(() => {
    const h = e => { if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const markRead = async id => {
    await api.patch(`/users/notifications/${id}/read`).catch(() => {});
    setNotifs(n => n.map(x => x.id === id ? { ...x, is_read: 1 } : x));
    setUnread(u => Math.max(0, u - 1));
  };

  const nColor = t => ({ success: '#1a5c3a', error: '#8b1a1a', warning: '#8b5e00', payment: '#2563eb', ticket: '#7c3aed' }[t] || '#8a7f72');

  return (
    <header style={{ height: 64, background: 'var(--dark)', borderBottom: '1px solid rgba(201,168,76,.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)' }}>
      <Link to="/" style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 22, fontWeight: 700, color: '#faf7f2', textDecoration: 'none', letterSpacing: .5 }}>
        Event<em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Hub</em>
      </Link>

      <nav style={{ display: 'flex', gap: 4 }}>
        {[['/', 'Home'], ['/events', 'Sự ki�?n']].map(([to, label]) => (
          <Link key={to} to={to} style={{ color: act(to) ? '#fff' : 'rgba(255,255,255,.55)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', padding: '8px 14px', textDecoration: 'none', borderBottom: act(to) ? '1px solid var(--gold)' : '1px solid transparent', transition: 'color .2s' }}>
            {label}
          </Link>
        ))}
        {user && !isAdmin && (
          <Link to="/my-tickets" style={{ color: act('/my-tickets') ? '#fff' : 'rgba(255,255,255,.55)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', padding: '8px 14px', textDecoration: 'none', borderBottom: act('/my-tickets') ? '1px solid var(--gold)' : '1px solid transparent', transition: 'color .2s' }}>
            My Tickets
          </Link>
        )}
        {user?.role === 'support' && (
          <Link to="/support" style={{ position:'relative', color: act('/support') ? '#fff' : 'rgba(255,255,255,.55)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', padding: '8px 14px', textDecoration: 'none', borderBottom: act('/support') ? '1px solid var(--gold)' : '1px solid transparent', transition: 'color .2s' }}>
            Support

          </Link>
        )}
        {isOrganizer && !isAdmin && (
          <Link to="/organizer" style={{ color: act('/organizer') ? '#fff' : 'rgba(255,255,255,.55)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', padding: '8px 14px', textDecoration: 'none', borderBottom: act('/organizer') ? '1px solid var(--gold)' : '1px solid transparent', transition: 'color .2s' }}>
            Organizer
          </Link>
        )}
        {isAdmin && (
          <>
            <Link to="/admin" style={{ color: act('/admin') ? '#fff' : 'rgba(255,255,255,.55)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', padding: '8px 14px', textDecoration: 'none', borderBottom: act('/admin') ? '1px solid var(--gold)' : '1px solid transparent', transition: 'color .2s' }}>
              Admin<
            </Link>
            <Link to="/checkin" style={{ color: act('/checkin') ? 'var(--gold)' : 'rgba(255,255,255,.55)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', padding: '8px 14px', textDecoration: 'none', borderBottom: act('/checkin') ? '1px solid var(--gold)' : '1px solid transparent', transition: 'color .2s' }}>
              Check-in
            </Link>
          </>
        )}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Dark mode toggle */}
        <button onClick={toggle} style={{ background: 'none', border: '1px solid rgba(255,255,255,.15)', borderRadius: 4, color: 'var(--gold)', fontSize: 16, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'border-color .2s' }}
          onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,.4)'}
          onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,.15)'}
          title={dark ? 'Chế �'�T sáng' : 'Chế �'�T t�'i'}>
          {dark ? '�~?️' : '�YOT'}
        </button>

        {user ? (
          <>
            {/* Notifications */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button onClick={() => setShowNotif(s => !s)} style={{ background: 'none', border: '1px solid rgba(255,255,255,.15)', borderRadius: 4, color: 'rgba(255,255,255,.7)', fontSize: 16, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
                �Y""
                {unread > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: '#e8453c', color: '#fff', width: 16, height: 16, borderRadius: '50%', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{unread > 9 ? '9+' : unread}</span>}
              </button>
              {showNotif && (
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 340, background: '#ffffff', color: '#1a1510', border: '1px solid #e0e0e0', borderRadius: 4, boxShadow: '0 8px 40px rgba(0,0,0,.25)', zIndex: 200, maxHeight: 400, overflowY: 'auto' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Notifications</span>
                    {unread > 0 && <button onClick={() => api.patch('/users/notifications/read-all').then(() => { setNotifs(n => n.map(x => ({ ...x, is_read: 1 }))); setUnread(0); })} style={{ background: 'none', border: 'none', fontSize: 11, color: 'var(--gold)', cursor: 'pointer', letterSpacing: 1, fontFamily: 'inherit' }}>Đọc tất cả</button>}
                  </div>
                  {notifs.length === 0
                    ? <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>Không có thông báo m�>i</div>
                    : notifs.map(n => (
                      <div key={n.id} onClick={() => markRead(n.id)} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border2)', cursor: 'pointer', background: n.is_read ? '#ffffff' : '#f9f6f0', transition: 'background .15s' }}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: nColor(n.type), flexShrink: 0, marginTop: 5 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: n.is_read ? 400 : 600, marginBottom: 2 }}>{n.title}</div>
                            {n.message && <div style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.5 }}>{n.message}</div>}
                            <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>{new Date(n.created_at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>

            {/* Avatar */}
            <Link to="/profile" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
              {user.avatar
                ? <img src={user.avatar} alt="" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(201,168,76,.3)' }} />
                : <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(201,168,76,.15)', border: '1px solid rgba(201,168,76,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'var(--gold)', fontWeight: 700 }}>
                    {user.name?.[0]?.toUpperCase()}
                  </div>
              }
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,.7)' }}>{user.name}</span>
            </Link>

            <span style={{ fontSize: 9, letterSpacing: 1.5, padding: '3px 10px', borderRadius: 2, textTransform: 'uppercase', fontWeight: 600, ...(user.role === 'admin' ? { background: 'rgba(201,168,76,.15)', color: 'var(--gold)', border: '1px solid rgba(201,168,76,.3)' } : user.role === 'organizer' ? { background: 'rgba(37,99,235,.15)', color: '#60a5fa', border: '1px solid rgba(37,99,235,.3)' } : { background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.5)', border: '1px solid rgba(255,255,255,.1)' }) }}>
              {user.role === 'admin' ? 'Admin' : user.role === 'organizer' ? 'Organizer' : user.role === 'support' ? 'Support' : 'Member'}
            </span>

            <button onClick={() => { logout(); navigate('/login'); }} style={{ background: 'none', border: '1px solid rgba(255,255,255,.2)', color: 'rgba(255,255,255,.65)', padding: '6px 14px', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 4, transition: 'all .2s' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.5)'; e.currentTarget.style.color = '#fff'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.2)'; e.currentTarget.style.color = 'rgba(255,255,255,.65)'; }}>
              Đ�fng xuất
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ background: 'none', border: '1px solid rgba(255,255,255,.2)', color: 'rgba(255,255,255,.7)', padding: '7px 18px', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', textDecoration: 'none', borderRadius: 4 }}>Đ�fng nhập</Link>
            <Link to="/register" style={{ background: 'var(--gold)', border: 'none', color: '#1a1510', padding: '7px 18px', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', textDecoration: 'none', borderRadius: 4, fontWeight: 600 }}>Đ�fng ký</Link>
          </>
        )}
      </div>
    </header>
  );
}



