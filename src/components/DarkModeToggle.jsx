import React, { useState, useEffect } from 'react';

export default function DarkModeToggle() {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('eh_dark') === '1'; } catch { return false; }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('eh_dark', dark ? '1' : '0');
  }, [dark]);

  return (
    <button
      onClick={() => setDark(d => !d)}
      title={dark ? 'Sang' : 'Toi'}
      style={{
        background: 'none',
        border: '1px solid rgba(201,168,76,.3)',
        color: '#c9a84c',
        width: 34, height: 34,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', fontSize: 16,
        borderRadius: 2, transition: 'all .25s', flexShrink: 0,
      }}
      onMouseOver={e => e.currentTarget.style.background='rgba(201,168,76,.1)'}
      onMouseOut={e => e.currentTarget.style.background='none'}
    >
      {dark ? '☀️' : '🌙'}
    </button>
  );
}
