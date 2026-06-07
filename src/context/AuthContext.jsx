import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';
const Ctx = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('eh_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('eh_token', data.token);
      localStorage.setItem('eh_user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (e) {
      return { success: false, message: e.response?.data?.message || 'Login failed' };
    } finally { setLoading(false); }
  };

  const register = async (name, email, password, phone) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { name, email, password, phone });
      localStorage.setItem('eh_token', data.token);
      localStorage.setItem('eh_user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (e) {
      return { success: false, message: e.response?.data?.message || 'Register failed' };
    } finally { setLoading(false); }
  };

  const logout = () => {
    localStorage.removeItem('eh_token');
    localStorage.removeItem('eh_user');
    setUser(null);
  };

  // Cập nhật user sau khi sửa profile
  const updateUser = (newUser) => {
    const merged = { ...user, ...newUser };
    localStorage.setItem('eh_user', JSON.stringify(merged));
    setUser(merged);
  };

  return (
    <Ctx.Provider value={{
      user, loading, login, register, logout, updateUser,
      isAdmin: user?.role === 'admin',
      isOrganizer: user?.role === 'organizer' || user?.role === 'admin',
    }}>
      {children}
    </Ctx.Provider>
  );
}
export const useAuth = () => useContext(Ctx);
