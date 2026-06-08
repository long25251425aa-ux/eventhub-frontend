import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggleDark } = useTheme();
  const loc = useLocation();
  const nav = useNavigate();
  const [notifs, setNotifs] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const notifRef = useRef();
  const userRef = useRef();

  const act = path => loc.pathname === path || loc.pathname.startsWith(path + '/');
  const isAdmin = user?.role === 'admin';
  const isOrganizer = user?.role === 'organizer';
  const isSupport = user?.role === 'support';

  useEffect(() => {
    if (!user) return;
    api.get('/notifications').then(r => setNotifs(r.data.data || [])).catch(() => {});
  }, [user]);

  useEffect(() => {
    const handler = e => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUser(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unread = notifs.filter(n => !n.is_read).length;

  const linkStyle = path => ({
    color: act(path) ? '#fff' : 'rgba(255,255,255,.55)',
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    padding: '8px 14px',
    textDecoration: 'none',
    borderBottom: act(path) ? '1px solid var(--gold)' : '1px solid transparent',
    transition: 'color .2s'
  });

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(13,10,5,.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(201,168,76,.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 56 }}>
      <Link to="/" style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 20, color: '#faf7f2', textDecoration: 'none', fontWeight: 700, letterSpacing: 1 }}>
        Event<em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Hub</em>
      </Link>

      <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Link to="/" style={linkStyle('/')}>Home</Link>
        <Link to="/events" style={linkStyle('/events')}>Events</Link>
        {user && (
          <Link to="/my-tickets" style={linkStyle('/my-tickets')}>My Tickets</Link>
        )}
        {isSupport && (
          <Link to="/support" style={linkStyle('/support')}>Support</Link>
        )}
        {(isAdmin || isOrganizer) && (
          <>
            <Link to="/admin" style={linkStyle('/admin')}>Admin</Link>
            <Link to="/checkin" style={linkStyle('/checkin')}>Check-in</Link>
          </>
        )}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={toggleDark}
          style={{ background: 'none', border: '1px solid rgba(255,255,255,.15)', color: 'rgba(255,255,255,.6)', width: 32, height: 32, borderRadius: 4, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color .2s' }}
          onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,.4)'}
          onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,.15)'}
          title={dark ? 'Light mode' : 'Dark mode'}>
          {dark ? 'Light' : 'Dark'}
        </button>

        {user ? (
          <>
            {/* Notifications */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button onClick={() => setShowNotifs(!showNotifs)}
                style={{ background: 'none', border: '1px solid rgba(255,255,255,.15)', color: 'rgba(255,255,255,.6)', width: 32, height: 32, borderRadius: 4, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                🔔
                {unread > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--gold)', color: '#000', fontSize: 9, width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{unread}</span>}
              </button>
              {showNotifs && (
                <div style={{ position: 'absolute', right: 0, top: 40, width: 300, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, zIndex: 200, maxHeight: 400, overflowY: 'auto' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 11, letterSpacing: 2, color: 'var(--gold)', textTransform: 'uppercase' }}>Notifications</div>
                  {notifs.length === 0 ? (
                    <div style={{ padding: '20px 16px', fontSize: 12, color: 'var(--text3)', textAlign: 'center' }}>No notifications</div>
                  ) : notifs.slice(0, 10).map(n => (
                    <div key={n.id} onClick={() => { if (n.action_url) nav(n.action_url); setShowNotifs(false); }}
                      style={{ padding: '10px 16px', borderBottom: '1px solid var(--border2)', cursor: n.action_url ? 'pointer' : 'default', background: n.is_read ? 'transparent' : 'rgba(201,168,76,.05)' }}>
                      <div style={{ fontSize: 12, color: 'var(--text)', marginBottom: 2 }}>{n.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{n.message}</div>
                    </div>
                  ))}
                  <div style={{ padding: '10px 16px', textAlign: 'center' }}>
                    <button onClick={() => { nav('/notifications'); setShowNotifs(false); }} style={{ fontSize: 11, color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer' }}>All Notifications</button>
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div ref={userRef} style={{ position: 'relative' }}>
              <button onClick={() => setShowUser(!showUser)}
                style={{ background: 'rgba(201,168,76,.1)', border: '1px solid rgba(201,168,76,.3)', color: 'var(--gold)', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {user.name?.[0]?.toUpperCase() || 'U'}
              </button>
              {showUser && (
                <div style={{ position: 'absolute', right: 0, top: 40, width: 200, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, zIndex: 200 }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{user.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: 1 }}>{user.role}</div>
                  </div>
                  <div onClick={() => { nav('/profile'); setShowUser(false); }} style={{ padding: '10px 16px', fontSize: 12, color: 'var(--text)', cursor: 'pointer', borderBottom: '1px solid var(--border2)' }}>Profile</div>
                  <div onClick={() => { logout(); setShowUser(false); nav('/'); }} style={{ padding: '10px 16px', fontSize: 12, color: '#ef4444', cursor: 'pointer' }}>Logout</div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', textDecoration: 'none', padding: '6px 14px', border: '1px solid rgba(255,255,255,.15)', borderRadius: 3, letterSpacing: 1, textTransform: 'uppercase', transition: 'all .2s' }}>Login</Link>
            <Link to="/register" style={{ fontSize: 11, color: '#000', textDecoration: 'none', padding: '6px 14px', background: 'var(--gold)', borderRadius: 3, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>Register</Link>
          </>
        )}
      </div>
    </header>
  );
}