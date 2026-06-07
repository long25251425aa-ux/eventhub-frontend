import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';



const ROLES = ['user', 'organizer', 'admin', 'support'];
const ROLE_COLORS = { admin: '#c9a84c', organizer: '#2563eb', user: '#8a7f72', support: '#7c3aed' };
const ROLE_LABELS = { user: 'User', organizer: 'Organizer', admin: 'Admin', support: 'Support' };
const ROLE_DESC = {
  user: 'Người dùng thông thường, đặt vé và xem sự kiện',
  organizer: 'Tạo và quản lý sự kiện',
  admin: 'Toàn quyền quản trị hệ thống',
  support: 'Trả lời tin nhắn khách hàng qua Live Chat',
};

function RoleModal({ user: u, onClose, onSave }) {
  const [selected, setSelected] = React.useState(u.role);
  const [saving, setSaving] = React.useState(false);

  const save = async () => {
    if (selected === u.role) { onClose(); return; }
    setSaving(true);
    await onSave(u.id, selected);
    setSaving(false);
    onClose();
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999, padding:20 }}>
      <div style={{ background:'#fff', width:420, maxWidth:'100%', borderRadius:8, overflow:'hidden', boxShadow:'0 20px 60px rgba(0,0,0,.3)' }}>
        <div style={{ background:'#1a1510', padding:'14px 20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ color:'#c9a84c', fontSize:12, fontWeight:600 }}>Đổi vai trò</div>
            <div style={{ color:'rgba(255,255,255,.6)', fontSize:11, marginTop:2 }}>{u.name} · {u.email}</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(255,255,255,.5)', fontSize:20, cursor:'pointer' }}>×</button>
        </div>
        <div style={{ padding:'20px' }}>
          <div style={{ fontSize:11, color:'#8a7f72', marginBottom:12, letterSpacing:1, textTransform:'uppercase' }}>Chọn vai trò mới</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {ROLES.map(r => (
              <div key={r} onClick={() => setSelected(r)}
                style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', border:`2px solid ${selected===r ? ROLE_COLORS[r] : '#e8dfc8'}`, borderRadius:6, cursor:'pointer', background: selected===r ? `${ROLE_COLORS[r]}10` : '#faf7f2', transition:'all .2s' }}>
                <div style={{ width:18, height:18, borderRadius:'50%', border:`2px solid ${ROLE_COLORS[r]}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {selected===r && <div style={{ width:8, height:8, borderRadius:'50%', background:ROLE_COLORS[r] }} />}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'#1a1510', display:'flex', alignItems:'center', gap:8 }}>
                    {ROLE_LABELS[r]}
                    {r === u.role && <span style={{ fontSize:9, background:'#e8dfc8', color:'#8a7f72', padding:'1px 6px', borderRadius:10 }}>Hiện tại</span>}
                  </div>
                  <div style={{ fontSize:11, color:'#8a7f72', marginTop:2 }}>{ROLE_DESC[r]}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding:'12px 20px', borderTop:'1px solid #e8dfc8', display:'flex', gap:10, justifyContent:'flex-end', background:'#f5f0e8' }}>
          <button onClick={onClose} style={{ background:'none', border:'1px solid #d4c8b0', color:'#8a7f72', padding:'9px 20px', fontSize:12, cursor:'pointer', fontFamily:'inherit', borderRadius:4 }}>Hủy</button>
          <button onClick={save} disabled={saving || selected===u.role}
            style={{ background:'#1a1510', border:'none', color:'#c9a84c', padding:'9px 24px', fontSize:12, fontWeight:700, cursor: selected===u.role?'default':'pointer', fontFamily:'inherit', borderRadius:4, opacity: selected===u.role?.5:1 }}>
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleUser, setRoleUser] = useState(null);

  const saveRole = async (id, newRole) => {
    try {
      await api.patch('/users/' + id + '/role', { role: newRole });
      toast.success('Da doi vai tro thanh ' + ROLE_LABELS[newRole]);
      load();
    } catch (e) { toast.error(e.response?.data?.message || 'Loi'); }
  };
  const [roleFilter, setRoleFilter] = useState('');
  const [total, setTotal] = useState(0);

  const load = () => {
    setLoading(true);
    const q = new URLSearchParams({ limit: 50 });
    if (search) q.set('search', search);
    if (roleFilter) q.set('role', roleFilter);
    api.get('/users?' + q).then(r => { setUsers(r.data.data || []); setTotal(r.data.total || 0); })
      .catch(() => toast.error('Không thể tải danh sách người dùng'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, roleFilter]);

  const toggleLock = async (id, isLocked, name) => {
    const msg = isLocked ? `Mở khóa tài khoản ${name}?` : `Khóa tài khoản ${name}?`;
    if (!window.confirm(msg)) return;
    try {
      const { data } = await api.patch(`/users/${id}/lock`);
      toast.success(data.message);
      load();
    } catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
  };

  const changeRole = async (id, currentRole, name) => {
    const roles = ['user', 'organizer', 'admin', 'support'];
    const labels = { user: 'User', organizer: 'Organizer', admin: 'Admin', support: 'Support' };
    const options = roles.filter(r => r !== currentRole);
    // Hiện dialog chọn vai trò
    // Tạo dialog chọn role
    const roleList = roles.filter(r => r !== currentRole);
    const roleText = roleList.map((r, i) => `${i+1}. ${labels[r]}`).join('\n');
    const choice = window.prompt(
      `Đổi vai trò cho "${name}"?\nVai trò hiện tại: ${labels[currentRole]}\n\nChọn vai trò mới (nhập số):\n${roleText}`
    );
    if (!choice) return;
    const idx2 = parseInt(choice.trim()) - 1;
    if (idx2 < 0 || idx2 >= roleList.length) { toast.error('Lựa chọn không hợp lệ'); return; }
    const newRole = roleList[idx2];
    try {
      const { data } = await api.patch(`/users/${id}/role`, { role: newRole });
      toast.success(`✅ Đã đổi vai trò thành ${labels[newRole]}`);
      load();
    } catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
  };

  const fmtDate = d => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div>
      {roleUser && <RoleModal user={roleUser} onClose={() => setRoleUser(null)} onSave={saveRole} />}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          style={{ flex: 1, minWidth: 200, background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', padding: '9px 14px', fontSize: 12, fontFamily: 'inherit', outline: 'none', borderRadius: 4, transition: 'border-color .2s' }}
          placeholder="Tìm theo tên, email..."
          value={search} onChange={e => setSearch(e.target.value)}
          onFocus={e => e.target.style.borderColor = 'var(--gold)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        <select
          style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', padding: '9px 14px', fontSize: 12, fontFamily: 'inherit', outline: 'none', borderRadius: 4 }}
          value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">Tất cả vai trò</option>
          <option value="admin">Admin</option>
          <option value="organizer">Ban tổ chức</option>
          <option value="user">Người dùng</option>
        </select>
        <span style={{ fontSize: 12, color: 'var(--text3)' }}>Tổng: <strong style={{ color: 'var(--text)' }}>{total}</strong> tài khoản</span>
      </div>

      {loading ? (
        <div className="loader"><div className="spinner" /></div>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👤</div>
          <div className="empty-title">Không tìm thấy người dùng</div>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Vai trò</th>
                <th>Ngày tham gia</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {u.avatar
                        ? <img src={u.avatar} alt="" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }} />
                        : <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(201,168,76,.1)', border: '1px solid rgba(201,168,76,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--gold)', fontWeight: 700, flexShrink: 0 }}>
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                      }
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{u.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--text3)' }}>ID #{u.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 12 }}>{u.email}</td>
                  <td style={{ fontSize: 12, color: 'var(--text3)' }}>{u.phone || '—'}</td>
                  <td>
                    <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, color: ROLE_COLORS[u.role], background: `${ROLE_COLORS[u.role]}18`, border: `1px solid ${ROLE_COLORS[u.role]}30`, padding: '3px 10px', borderRadius: 2, textTransform: 'uppercase' }}>
                      {ROLES[u.role]}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text3)' }}>{fmtDate(u.created_at)}</td>
                  <td>
                    <span className={`status-tag ${u.is_locked ? 'status-cancelled' : 'status-active'}`}>
                      {u.is_locked ? 'Đã khóa' : 'Hoạt động'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button
                        className={`btn btn-sm ${u.is_locked ? 'btn-success' : 'btn-danger'}`}
                        onClick={() => toggleLock(u.id, u.is_locked, u.name)}>
                        {u.is_locked ? '🔓 Mở khóa' : '🔒 Khóa'}
                      </button>
                      <button className="btn btn-dark btn-sm" onClick={() => setRoleUser(u)}>
                        ⚙ Đổi vai trò
                      </button>
                    </div>
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
