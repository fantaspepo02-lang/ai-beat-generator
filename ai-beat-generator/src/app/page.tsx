'use client';
import React from 'react';
import Link from 'next/link';
import Taskbar from '@/components/Taskbar';
import RetroWindow from '@/components/RetroWindow';

export default function LandingPage() {
  return (
    <div className="min-h-screen retro-grid" style={{ background: 'linear-gradient(135deg, #008080 0%, #004040 50%, #006060 100%)' }}>
      {/* Desktop Icons */}
      <div className="hidden md:flex p-4 flex-col gap-4" style={{ position: 'fixed', left: 8, top: 8, zIndex: 10 }}>
        <Link href="/dashboard" className="desktop-icon">
          <div className="desktop-icon-img">🎵</div>
          <span className="desktop-icon-label">AI Beat Generator</span>
        </Link>
        <Link href="/library" className="desktop-icon">
          <div className="desktop-icon-img">📁</div>
          <span className="desktop-icon-label">My Beats</span>
        </Link>
        <Link href="/login" className="desktop-icon">
          <div className="desktop-icon-img">🌐</div>
          <span className="desktop-icon-label">Login</span>
        </Link>
        <div className="desktop-icon">
          <div className="desktop-icon-img">🗑️</div>
          <span className="desktop-icon-label">Recycle Bin</span>
        </div>
      </div>

      {/* Main Content area */}
      <div className="flex flex-col items-center justify-center min-h-screen p-4 pb-16 md:ml-[100px]">
        
        {/* Hero - Notepad Window */}
        <div className="w-full max-w-3xl mb-6">
          <RetroWindow title="Notepad - Welcome.txt" icon="📝" menuItems={['File', 'Edit', 'Format', 'View', 'Help']}>
            <div style={{ 
              background: 'white', 
              padding: '20px', 
              fontFamily: "'VT323', 'Lucida Console', monospace",
              fontSize: '18px',
              minHeight: '200px',
              lineHeight: '1.6'
            }}>
              <h1 className="text-2xl sm:text-4xl" style={{ 
                fontFamily: "'Press Start 2P', cursive",
                color: '#0055E5',
                marginBottom: '16px',
                lineHeight: '1.4'
              }}>
                AI BEAT GENERATOR
              </h1>
              <div className="space-y-2 mb-6">
                <p style={{ color: '#333' }}>
                  {'>'} Create incredible beats using artificial intelligence_
                </p>
                <p style={{ color: '#333' }}>
                  {'>'} Choose your genre: Trap, Hip-Hop, Lo-Fi, House, Techno, Reggaeton
                </p>
                <p style={{ color: '#333' }}>
                  {'>'} Customize BPM, mood, instruments and complexity
                </p>
                <p style={{ color: '#333' }}>
                  {'>'} Preview, play, and download your beats in WAV format
                </p>
              </div>
              <p style={{ color: '#666', marginTop: '16px' }}>
                <span style={{ animation: 'blink 1s infinite' }}>|</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Link href="/generator" className="w-full sm:w-auto">
                  <button className="xp-button xp-button-primary w-full" style={{ fontSize: '18px', padding: '8px 24px' }}>
                    🎹 Start Creating
                  </button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <button className="xp-button w-full" style={{ fontSize: '18px', padding: '8px 24px' }}>
                    🔑 Sign In
                  </button>
                </Link>
              </div>
            </div>
          </RetroWindow>
        </div>

        {/* Features Row */}
        <div className="flex gap-4 w-full max-w-3xl flex-wrap justify-center">
          {/* Paint Window - Features */}
          <div className="flex-1 min-w-[280px]">
            <RetroWindow title="untitled - Paint" icon="🎨" menuItems={['File', 'Edit', 'View', 'Image', 'Options', 'Help']}>
              <div style={{ 
                background: 'white', 
                padding: '16px',
                minHeight: '220px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <h2 style={{ 
                  fontFamily: "'Press Start 2P', cursive",
                  fontSize: '14px',
                  color: '#0055E5',
                  marginBottom: '8px'
                }}>
                  ✨ Features
                </h2>
                <div className="flex items-start gap-3" style={{ fontFamily: 'VT323, monospace', fontSize: '16px' }}>
                  <span style={{ fontSize: '24px' }}>🎵</span>
                  <div>
                    <strong>AI Beat Generation</strong>
                    <p style={{ color: '#666', fontSize: '14px' }}>Multiple genres & styles</p>
                  </div>
                </div>
                <div className="flex items-start gap-3" style={{ fontFamily: 'VT323, monospace', fontSize: '16px' }}>
                  <span style={{ fontSize: '24px' }}>🎛️</span>
                  <div>
                    <strong>Custom Controls</strong>
                    <p style={{ color: '#666', fontSize: '14px' }}>BPM, mood, instruments</p>
                  </div>
                </div>
                <div className="flex items-start gap-3" style={{ fontFamily: 'VT323, monospace', fontSize: '16px' }}>
                  <span style={{ fontSize: '24px' }}>👁️</span>
                  <div>
                    <strong>Real-time Preview</strong>
                    <p style={{ color: '#666', fontSize: '14px' }}>Instant playback & visualization</p>
                  </div>
                </div>
                <div className="flex items-start gap-3" style={{ fontFamily: 'VT323, monospace', fontSize: '16px' }}>
                  <span style={{ fontSize: '24px' }}>💾</span>
                  <div>
                    <strong>Export & Download</strong>
                    <p style={{ color: '#666', fontSize: '14px' }}>WAV, MP3, MIDI formats</p>
                  </div>
                </div>
              </div>
            </RetroWindow>
          </div>

          {/* Explorer Window - Sample Beats */}
          <div className="flex-1 min-w-[280px]">
            <RetroWindow title="Sample Beats" icon="📂" statusBar="3 object(s)">
              <div style={{ background: 'white', padding: '8px' }}>
                <h2 style={{ 
                  fontFamily: "'Press Start 2P', cursive",
                  fontSize: '14px',
                  color: '#0055E5',
                  marginBottom: '12px'
                }}>
                  🔥 Example Beats
                </h2>
                {[
                  { name: 'Midnight_Trap.wav', genre: 'Trap', bpm: 140, icon: '🎵' },
                  { name: 'Summer_Vibes.wav', genre: 'Reggaeton', bpm: 95, icon: '🎶' },
                  { name: 'Chill_Session.wav', genre: 'Lo-Fi', bpm: 80, icon: '🎵' },
                ].map((beat, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 hover:bg-blue-100 cursor-pointer" style={{
                    borderBottom: '1px solid #eee',
                    fontFamily: 'VT323, monospace',
                    fontSize: '15px'
                  }}>
                    <span style={{ fontSize: '20px' }}>{beat.icon}</span>
                    <div className="flex-1">
                      <div style={{ fontWeight: 'bold' }}>{beat.name}</div>
                      <div style={{ color: '#666', fontSize: '13px' }}>{beat.genre} • {beat.bpm} BPM</div>
                    </div>
                    <span style={{ color: '#0055E5' }}>▶</span>
                  </div>
                ))}
                <div className="mt-4 text-center">
                  <Link href="/generator">
                    <button className="xp-button xp-button-primary" style={{ fontSize: '16px' }}>
                      Create Your Own →
                    </button>
                  </Link>
                </div>
              </div>
            </RetroWindow>
          </div>
        </div>

        {/* Bottom info dialog */}
        <div className="w-full max-w-3xl mt-6">
          <div className="xp-window window-animate" style={{ maxWidth: '400px', margin: '0 auto' }}>
            <div className="xp-titlebar" style={{ background: 'linear-gradient(180deg, #D4D4D4 0%, #C0C0C0 100%)' }}>
              <div className="xp-titlebar-text" style={{ color: '#333' }}>
                <span>ℹ️</span>
                <span>About AI Beat Generator</span>
              </div>
            </div>
            <div className="xp-window-body text-center" style={{ padding: '16px' }}>
              <p style={{ fontFamily: 'VT323, monospace', fontSize: '18px', marginBottom: '12px' }}>
                🎵 Powered by Web Audio API & AI
              </p>
              <p style={{ fontFamily: 'VT323, monospace', fontSize: '14px', color: '#666' }}>
                Version 1.0 • Created 2026
              </p>
              <Link href="/dashboard">
                <button className="xp-button mt-3" style={{ minWidth: '100px' }}>OK</button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Taskbar />
    </div>
  );
}
