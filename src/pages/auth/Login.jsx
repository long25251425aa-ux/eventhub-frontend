import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    const r = await login(email, password);
    setLoading(false);
    if (r.success) {
      if (remember) localStorage.setItem('eh_remember', email);
      toast.success('Đăng nhập thành công!');
      nav('/');
    } else toast.error(r.message);
  };

  const submitForgot = async e => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    // Simulate sending reset email
    setForgotSent(true);
    toast.success('Đã gửi link đặt lại mật khẩu về email!');
  };

  React.useEffect(() => {
    const saved = localStorage.getItem('eh_remember');
    if (saved) { setEmail(saved); setRemember(true); }
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#0d0a05', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: 440, background: '#1a1510', border: '1px solid rgba(201,168,76,.15)', borderRadius: 8, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,.5)' }}>
        {/* Logo */}
        <div style={{ background: '#13100a', padding: '28px 32px', textAlign: 'center', borderBottom: '1px solid rgba(201,168,76,.12)' }}>
          <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 28, color: '#faf7f2', fontWeight: 700 }}>
            Event<em style={{ color: '#c9a84c', fontStyle: 'italic' }}>Hub</em>
          </div>
          <div style={{ fontSize: 10, letterSpacing: 3, color: 'rgba(201,168,76,.5)', textTransform: 'uppercase', marginTop: 6 }}>
            {showForgot ? 'Quên mật khẩu' : 'Đăng nhập tài khoản'}
          </div>
        </div>

        <div style={{ padding: '28px 32px' }}>
          {!showForgot ? (
            <>
              <form onSubmit={submit}>
                {/* Email */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 10, letterSpacing: 2, color: '#8a7f72', textTransform: 'uppercase', marginBottom: 6 }}>Email *</label>
                  <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="email@example.com" required autoFocus
                    style={{ width: '100%', background: '#13100a', border: '1px solid rgba(201,168,76,.2)', color: '#faf7f2', padding: '11px 14px', fontFamily: 'inherit', fontSize: 13, outline: 'none', borderRadius: 4, boxSizing: 'border-box', transition: 'border-color .2s' }}
                    onFocus={e => e.target.style.borderColor = '#c9a84c'}
                    onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,.2)'} />
                </div>

                {/* Password */}
                <div style={{ marginBottom: 8 }}>
                  <label style={{ display: 'block', fontSize: 10, letterSpacing: 2, color: '#8a7f72', textTransform: 'uppercase', marginBottom: 6 }}>Mật khẩu *</label>
                  <div style={{ position: 'relative' }}>
                    <input value={password} onChange={e => setPassword(e.target.value)} type={showPw ? 'text' : 'password'} placeholder="••••••••" required
                      style={{ width: '100%', background: '#13100a', border: '1px solid rgba(201,168,76,.2)', color: '#faf7f2', padding: '11px 44px 11px 14px', fontFamily: 'inherit', fontSize: 13, outline: 'none', borderRadius: 4, boxSizing: 'border-box', transition: 'border-color .2s' }}
                      onFocus={e => e.target.style.borderColor = '#c9a84c'}
                      onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,.2)'} />
                    <button type="button" onClick={() => setShowPw(p => !p)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#8a7f72', cursor: 'pointer', fontSize: 16 }}>
                      {showPw ? '🙈' : '👁'}
                    </button>
                  </div>
                </div>

                {/* Remember + Forgot */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, color: '#8a7f72' }}>
                    <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} style={{ accentColor: '#c9a84c' }} />
                    Ghi nhớ đăng nhập
                  </label>
                  <button type="button" onClick={() => setShowForgot(true)}
                    style={{ background: 'none', border: 'none', color: '#c9a84c', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Quên mật khẩu?
                  </button>
                </div>

                {/* Submit */}
                <button type="submit" disabled={loading}
                  style={{ width: '100%', padding: 13, background: '#c9a84c', border: 'none', color: '#1a1510', fontFamily: 'inherit', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 4, opacity: loading ? .6 : 1, marginBottom: 16 }}>
                  {loading ? 'Đang xử lý...' : '🔐 Đăng nhập'}
                </button>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.08)' }} />
                  <span style={{ fontSize: 11, color: '#8a7f72' }}>hoặc đăng nhập với</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.08)' }} />
                </div>

                {/* Social login */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                  <button type="button" onClick={() => toast('🔄 Google login đang phát triển!')}
                    style={{ padding: '10px', background: '#13100a', border: '1px solid rgba(255,255,255,.1)', color: '#faf7f2', fontFamily: 'inherit', fontSize: 12, cursor: 'pointer', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'border-color .2s' }}
                    onMouseOver={e => e.currentTarget.style.borderColor = '#ea4335'}
                    onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,.1)'}>
                    <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#ea4335" d="M5.26 9.77A7.24 7.24 0 0 1 12 4.75c1.74 0 3.3.62 4.53 1.63l3.37-3.37A12 12 0 0 0 0 12c0 1.99.49 3.86 1.35 5.5l3.91-3.05A7.19 7.19 0 0 1 5.26 9.77z"/><path fill="#fbbc05" d="M12 4.75c1.74 0 3.3.62 4.53 1.63l3.37-3.37A12 12 0 0 0 12 0C7.45 0 3.53 2.52 1.35 6.25l3.91 3.05A7.23 7.23 0 0 1 12 4.75z"/><path fill="#34a853" d="M12 19.25a7.23 7.23 0 0 1-6.74-4.55l-3.91 3.05A12 12 0 0 0 12 24c3.21 0 6.13-1.17 8.38-3.1l-3.7-2.88A7.22 7.22 0 0 1 12 19.25z"/><path fill="#4285f4" d="M23.75 12c0-.74-.07-1.46-.19-2.15H12v4.57h6.6a5.65 5.65 0 0 1-2.43 3.71l3.7 2.88C21.94 18.95 23.75 15.73 23.75 12z"/></svg>
                    Google
                  </button>
                  <button type="button" onClick={() => toast('🔄 Facebook login đang phát triển!')}
                    style={{ padding: '10px', background: '#13100a', border: '1px solid rgba(255,255,255,.1)', color: '#faf7f2', fontFamily: 'inherit', fontSize: 12, cursor: 'pointer', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'border-color .2s' }}
                    onMouseOver={e => e.currentTarget.style.borderColor = '#1877f2'}
                    onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,.1)'}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877f2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    Facebook
                  </button>
                </div>
              </form>

              <div style={{ textAlign: 'center', fontSize: 12, color: '#8a7f72' }}>
                Chưa có tài khoản? <Link to="/register" style={{ color: '#c9a84c', fontWeight: 600 }}>Đăng ký ngay →</Link>
              </div>

              {/* Demo accounts */}
              <div style={{ marginTop: 16, padding: '12px 14px', background: '#13100a', borderRadius: 4, fontSize: 11, color: '#8a7f72', lineHeight: 2, border: '1px solid rgba(201,168,76,.08)' }}>
                <div style={{ color: '#c9a84c', fontWeight: 600, marginBottom: 4 }}>Tài khoản demo:</div>
                Admin: long25251425Aa@gmail.com / Admin123!<br />
                User: user@eventhub.vn / Admin123!
              </div>
            </>
          ) : (
            /* Forgot password form */
            <div>
              {!forgotSent ? (
                <form onSubmit={submitForgot}>
                  <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>📧</div>
                    <div style={{ fontSize: 13, color: '#d4c9b8', lineHeight: 1.6 }}>Nhập email của bạn, chúng tôi sẽ gửi link đặt lại mật khẩu.</div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 10, letterSpacing: 2, color: '#8a7f72', textTransform: 'uppercase', marginBottom: 6 }}>Email *</label>
                    <input value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} type="email" placeholder="email@example.com" required autoFocus
                      style={{ width: '100%', background: '#13100a', border: '1px solid rgba(201,168,76,.2)', color: '#faf7f2', padding: '11px 14px', fontFamily: 'inherit', fontSize: 13, outline: 'none', borderRadius: 4, boxSizing: 'border-box' }} />
                  </div>
                  <button type="submit"
                    style={{ width: '100%', padding: 13, background: '#c9a84c', border: 'none', color: '#1a1510', fontFamily: 'inherit', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 4, marginBottom: 12 }}>
                    📨 Gửi link đặt lại mật khẩu
                  </button>
                  <button type="button" onClick={() => setShowForgot(false)}
                    style={{ width: '100%', padding: 10, background: 'none', border: '1px solid rgba(255,255,255,.1)', color: '#8a7f72', fontFamily: 'inherit', fontSize: 12, cursor: 'pointer', borderRadius: 4 }}>
                    ← Quay lại đăng nhập
                  </button>
                </form>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                  <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 20, color: '#faf7f2', marginBottom: 8 }}>Đã gửi email!</div>
                  <div style={{ fontSize: 13, color: '#8a7f72', lineHeight: 1.6, marginBottom: 20 }}>
                    Kiểm tra hộp thư <strong style={{ color: '#c9a84c' }}>{forgotEmail}</strong> để đặt lại mật khẩu.
                  </div>
                  <button onClick={() => { setShowForgot(false); setForgotSent(false); }}
                    style={{ padding: '10px 24px', background: '#c9a84c', border: 'none', color: '#1a1510', fontFamily: 'inherit', fontSize: 12, cursor: 'pointer', borderRadius: 4, fontWeight: 700 }}>
                    ← Quay lại đăng nhập
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
