import React, { createContext, useContext, useState, useEffect } from 'react';
const Ctx = createContext(null);
export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => localStorage.getItem('eh_dark') === '1');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('eh_dark', dark ? '1' : '0');
  }, [dark]);
  return <Ctx.Provider value={{ dark, toggle: () => setDark(d => !d) }}>{children}</Ctx.Provider>;
}
export const useTheme = () => useContext(Ctx);
