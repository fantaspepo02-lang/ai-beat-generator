'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Taskbar() {
  const [time, setTime] = useState('');
  const [showStart, setShowStart] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {showStart && (
        <div className="xp-start-menu">
          <div className="xp-start-menu-header">
            <div className="avatar">🎵</div>
            <div className="username">AI Beat Producer</div>
          </div>
          <div className="xp-start-menu-body">
            <div className="xp-start-menu-left">
              <Link href="/dashboard" className="xp-start-menu-item" onClick={() => setShowStart(false)}>
                <span className="item-icon">🏠</span>
                <div>
                  <div style={{ fontWeight: 'bold' }}>Dashboard</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Vista general</div>
                </div>
              </Link>
              <Link href="/generator" className="xp-start-menu-item" onClick={() => setShowStart(false)}>
                <span className="item-icon">🎹</span>
                <div>
                  <div style={{ fontWeight: 'bold' }}>Beat Generator</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Crear nuevos beats</div>
                </div>
              </Link>
              <Link href="/profile" className="xp-start-menu-item" onClick={() => setShowStart(false)}>
                <span className="item-icon">👤</span>
                <div>
                  <div style={{ fontWeight: 'bold' }}>My Profile</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Editar perfil y publicar</div>
                </div>
              </Link>
              <Link href="/library" className="xp-start-menu-item" onClick={() => setShowStart(false)}>
                <span className="item-icon">📚</span>
                <div>
                  <div style={{ fontWeight: 'bold' }}>My Library</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Tus beats guardados</div>
                </div>
              </Link>
              <div style={{ borderTop: '1px solid #ccc', margin: '4px 12px' }} />
              <Link href="/" className="xp-start-menu-item" onClick={() => setShowStart(false)}>
                <span className="item-icon">🌐</span>
                <div>
                  <div style={{ fontWeight: 'bold' }}>Landing Page</div>
                </div>
              </Link>
              <Link href="/login" className="xp-start-menu-item" onClick={() => setShowStart(false)}>
                <span className="item-icon">🔑</span>
                <div>
                  <div style={{ fontWeight: 'bold' }}>Login</div>
                </div>
              </Link>
            </div>
            <div className="xp-start-menu-right">
              <Link href="/profile" className="xp-start-menu-item" onClick={() => setShowStart(false)}>
                <span className="item-icon">👤</span>
                Profile
              </Link>
              <Link href="/library" className="xp-start-menu-item" onClick={() => setShowStart(false)}>
                <span className="item-icon">📂</span>
                My Beats
              </Link>
              <Link href="/generator" className="xp-start-menu-item" onClick={() => setShowStart(false)}>
                <span className="item-icon">🎵</span>
                New Beat
              </Link>
              <Link href="/dashboard" className="xp-start-menu-item" onClick={() => setShowStart(false)}>
                <span className="item-icon">📊</span>
                Stats
              </Link>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.3)', margin: '4px 0' }} />
              <Link href="/login" className="xp-start-menu-item" onClick={() => setShowStart(false)}>
                <span className="item-icon">⚙️</span>
                Settings
              </Link>
            </div>
          </div>
          <div className="xp-start-menu-footer">
            <button>
              🔌 Log Off
            </button>
            <button>
              🔴 Shut Down
            </button>
          </div>
        </div>
      )}

      <div className="xp-taskbar">
        <button className="xp-start-button" onClick={() => setShowStart(!showStart)}>
          <span className="start-icon">🪟</span>
          start
        </button>

        <Link href="/dashboard">
          <button className="xp-taskbar-button">🏠 Dashboard</button>
        </Link>
        <Link href="/generator">
          <button className="xp-taskbar-button">🎹 Generator</button>
        </Link>
        <Link href="/library">
          <button className="xp-taskbar-button">📚 Library</button>
        </Link>
        <Link href="/profile">
          <button className="xp-taskbar-button">👤 Profile</button>
        </Link>

        <div className="xp-systray">
          <span>🔊</span>
          <span>🛡️</span>
          <span>{time}</span>
        </div>
      </div>

      {showStart && (
        <div 
          style={{ position: 'fixed', inset: 0, zIndex: 999 }} 
          onClick={() => setShowStart(false)} 
        />
      )}
    </>
  );
}
