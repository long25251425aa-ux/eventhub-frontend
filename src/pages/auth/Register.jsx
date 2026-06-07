import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [f, setF] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const nav = useNavigate();

  const submit = async e => {
    e.preventDefault(); setLoading(true);
    const r = await register(f.name, f.email, f.password, f.phone);
    setLoading(false);
    if (r.success) { toast.success('Đăng ký thành công! Chào mừng bạn!'); nav('/'); }
    else toast.error(r.message);
  };

  const inp = { width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '10px 14px', fontFamily: 'inherit', fontSize: 13, outline: 'none', borderRadius: 4 };
  const lbl = { display: 'block', fontSize: 10, letterSpacing: 2, color: '#8a7f72', textTransform: 'uppercase', marginBottom: 6 };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: 440, background: 'var(--bg3)', border: '1px solid rgba(201,168,76,.15)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ background: '#13100a', padding: '28px 32px', textAlign: 'center', borderBottom: '1px solid rgba(201,168,76,.12)' }}>
          <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 26, color: '#faf7f2', fontWeight: 700 }}>
            Event<em style={{ color: '#c9a84c', fontStyle: 'italic' }}>Hub</em>
          </div>
          <div style={{ fontSize: 11, letterSpacing: 3, color: 'rgba(201,168,76,.5)', textTransform: 'uppercase', marginTop: 6 }}>Tạo tài khoản mới</div>
        </div>
        <form onSubmit={submit} style={{ padding: '28px 32px' }}>
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>Họ và tên</label>
            <input style={inp} value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="Nguyễn Văn An" required autoFocus />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>Email</label>
            <input style={inp} type="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} placeholder="email@example.com" required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div>
              <label style={lbl}>Mật khẩu</label>
              <input style={inp} type="password" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} placeholder="Tối thiểu 6 ký tự" required />
            </div>
            <div>
              <label style={lbl}>Số điện thoại</label>
              <input style={inp} type="tel" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} placeholder="0901 234 567" />
            </div>
          </div>
          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: 13, background: '#c9a84c', border: 'none', color: '#1a1510', fontFamily: 'inherit', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer', borderRadius: 4, opacity: loading ? .6 : 1 }}>
            {loading ? 'Đang xử lý...' : 'Tạo tài khoản'}
          </button>
          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--text3)' }}>
            Đã có tài khoản? <Link to="/login" style={{ color: '#c9a84c' }}>Đăng nhập</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
