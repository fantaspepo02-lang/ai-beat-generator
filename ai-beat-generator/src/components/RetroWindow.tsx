'use client';
import React from 'react';

interface RetroWindowProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
  className?: string;
  menuItems?: string[];
  statusBar?: string;
  onClose?: () => void;
  width?: string;
  maxWidth?: string;
  compact?: boolean;
}

export default function RetroWindow({ 
  title, 
  icon = '📁', 
  children, 
  className = '', 
  menuItems,
  statusBar,
  onClose,
  width,
  maxWidth = '100%',
  compact = false
}: RetroWindowProps) {
  return (
    <div className={`xp-window window-animate ${className}`} style={{ width, maxWidth: maxWidth || '100%' }}>
      <div className="xp-titlebar">
        <div className="xp-titlebar-text">
          <span>{icon}</span>
          <span>{title}</span>
        </div>
        <div className="xp-titlebar-buttons">
          <button className="xp-btn-minimize" title="Minimize">─</button>
          <button className="xp-btn-maximize" title="Maximize">□</button>
          <button className="xp-btn-close" title="Close" onClick={onClose}>✕</button>
        </div>
      </div>
      {menuItems && (
        <div className="xp-menubar">
          {menuItems.map((item, i) => (
            <span key={i}>{item}</span>
          ))}
        </div>
      )}
      <div className={`xp-window-body ${compact ? 'p-1' : ''}`}>
        {children}
      </div>
      {statusBar && (
        <div className="xp-statusbar">
          <div className="xp-statusbar-section flex-1">{statusBar}</div>
        </div>
      )}
    </div>
  );
}
