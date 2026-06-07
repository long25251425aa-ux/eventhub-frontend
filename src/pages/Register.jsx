import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Register() {
  const [f, setF] = useState({name:'',email:'',password:''});
  const { register, loading } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    const res = await register(f.name, f.email, f.password);
    if (res.success) { toast.success('Dang ky thanh cong!'); nav('/'); }
    else toast.error(res.message);
  };

  return (
    <div className="auth-scene">
      <div className="auth-bg"/>
      <div className="auth-card">
        <h1 className="auth-title serif">Tao tai khoan</h1>
        <p className="auth-sub">Tham gia cong dong EventHub</p>
        <form onSubmit={submit}>
          {[['Ho ten','name','text'],['Email','email','email'],['Mat khau','password','password']].map(([l,k,t])=>(
            <div key={k} className="field"><label className="field-label">{l}</label>
              <input className="field-input" type={t} value={f[k]} onChange={e=>setF({...f,[k]:e.target.value})} required minLength={k==='password'?6:undefined}/>
            </div>
          ))}
          <button className="btn btn-gold btn-full" type="submit" disabled={loading}>{loading?'Dang xu ly...':'Dang ky'}</button>
        </form>
        <p className="auth-foot">Da co tai khoan? <Link to="/login" className="auth-lnk">Dang nhap</Link></p>
      </div>
    </div>
  );
}
