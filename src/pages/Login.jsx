import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const { login, loading } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    const res = await login(email, pw);
    if (res.success) { toast.success('Chao mung tro lai!'); nav('/'); }
    else toast.error(res.message);
  };

  return (
    <div className="auth-scene">
      <div className="auth-bg"/>
      <div className="auth-card">
        <div className="auth-orn">
          <svg viewBox="0 0 60 20" width="60" height="20">
            <line x1="0" y1="10" x2="20" y2="10" stroke="#c9a84c" strokeWidth=".5"/>
            <circle cx="30" cy="10" r="5" fill="none" stroke="#c9a84c" strokeWidth=".5"/>
            <circle cx="30" cy="10" r="2" fill="#c9a84c"/>
            <line x1="40" y1="10" x2="60" y2="10" stroke="#c9a84c" strokeWidth=".5"/>
          </svg>
        </div>
        <h1 className="auth-title serif">EventHub</h1>
        <p className="auth-sub">Dang nhap tai khoan</p>
        <form onSubmit={submit}>
          <div className="field"><label className="field-label">Email</label>
            <input className="field-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" required/>
          </div>
          <div className="field"><label className="field-label">Mat khau</label>
            <input className="field-input" type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="..." required/>
          </div>
          <button className="btn btn-gold btn-full" type="submit" disabled={loading}>{loading?'Dang xu ly...':'Dang nhap'}</button>
        </form>
        <p className="auth-foot">Chua co tai khoan? <Link to="/register" className="auth-lnk">Dang ky ngay</Link></p>
        <div className="auth-hint">
          <strong>Demo:</strong><br/>
          Admin: admin@eventhub.vn / admin123<br/>
          User: user@eventhub.vn / user123
        </div>
      </div>
    </div>
  );
}
