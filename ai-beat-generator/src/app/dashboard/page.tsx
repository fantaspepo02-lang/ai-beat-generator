'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Taskbar from '@/components/Taskbar';
import RetroWindow from '@/components/RetroWindow';
import { getBeats, getStats, Profile, getCurrentUser } from '@/lib/supabaseData';

export default function DashboardPage() {
  const router = useRouter();
  const [recentBeats, setRecentBeats] = React.useState<any[]>([]);
  const [stats, setStats] = React.useState<any>({ totalBeats: 0, totalPlaytime: '0:00', favoriteGenre: '-', thisWeek: 0 });
  const [user, setUser] = React.useState<Profile | null>(null);

  React.useEffect(() => {
    async function loadData() {
      try {
        const profile = await getCurrentUser();
        if (profile) {
          setUser(profile);
          const beats = await getBeats();
          setRecentBeats(beats.slice(0, 4));
          const statsData = await getStats();
          setStats(statsData);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    }
    loadData();
  }, [router]);

  return (
    <div className="min-h-screen retro-grid p-4 pb-16" style={{ background: 'linear-gradient(135deg, #008080 0%, #004040 50%, #006060 100%)' }}>
      
      {/* Desktop Icons */}
      <div className="hidden md:flex flex-col gap-4" style={{ position: 'fixed', left: 8, top: 8, zIndex: 10 }}>
        <Link href="/generator" className="desktop-icon">
          <div className="desktop-icon-img">🎹</div>
          <span className="desktop-icon-label">Beat Generator</span>
        </Link>
        <Link href="/library" className="desktop-icon">
          <div className="desktop-icon-img">📁</div>
          <span className="desktop-icon-label">My Beats</span>
        </Link>
        <div className="desktop-icon">
          <div className="desktop-icon-img">🗑️</div>
          <span className="desktop-icon-label">Recycle Bin</span>
        </div>
      </div>

      <div className="md:ml-[100px]">
        {/* Welcome Bar */}
        <div className="mb-4">
          <div className="xp-window window-animate" style={{ maxWidth: '700px' }}>
            <div className="xp-titlebar" style={{ background: 'linear-gradient(180deg, #3C9A3C 0%, #2A7A2A 100%)' }}>
              <div className="xp-titlebar-text">
                <span>🏠</span>
                <span>Dashboard - Welcome {user?.name || 'Producer'}</span>
              </div>
              <div className="xp-titlebar-buttons">
                <button className="xp-btn-minimize">─</button>
                <button className="xp-btn-maximize">□</button>
                <button className="xp-btn-close">✕</button>
              </div>
            </div>
            <div className="xp-toolbar">
              <Link href="/generator"><button className="xp-toolbar-btn">🎹 New Beat</button></Link>
              <button className="xp-toolbar-btn">📊 Stats</button>
              <button className="xp-toolbar-btn">⚙️ Settings</button>
              <div style={{ flex: 1 }} />
              <span style={{ fontFamily: 'VT323, monospace', fontSize: '14px', color: '#666' }}>
                Plan: <strong style={{ color: '#2A7A2A' }}>{(user?.plan || 'free').toUpperCase()}</strong>
              </span>
            </div>
            <div className="xp-window-body" style={{ padding: '12px' }}>
              <div className="flex items-center gap-4">
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  border: '2px solid #ccc'
                }}>
                  🎵
                </div>
                <div>
                  <h1 style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '16px', color: '#0055E5' }}>
                    AI BEAT STUDIO
                  </h1>
                  <p style={{ fontFamily: 'VT323, monospace', fontSize: '16px', color: '#666' }}>
                    Welcome back, {user?.name || 'Producer'}! Ready to create some beats?
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex gap-4 mb-4 flex-wrap">
          {[
            { label: 'Total Beats', value: stats.totalBeats, icon: '🎵', color: '#0055E5' },
            { label: 'Total Playtime', value: stats.totalPlaytime, icon: '⏱️', color: '#2A7A2A' },
            { label: 'Favorite Genre', value: stats.favoriteGenre, icon: '🔥', color: '#C42B1C' },
            { label: 'This Week', value: stats.thisWeek, icon: '📅', color: '#9A5C00' },
          ].map((stat, i) => (
            <div key={i} className="xp-window window-animate" style={{ minWidth: '140px', flex: 1 }}>
              <div className="xp-titlebar" style={{ height: '24px', padding: '2px 6px' }}>
                <div className="xp-titlebar-text" style={{ fontSize: '12px' }}>
                  <span>{stat.icon}</span>
                  <span>{stat.label}</span>
                </div>
              </div>
              <div className="xp-window-body text-center" style={{ padding: '12px' }}>
                <div style={{ 
                  fontFamily: "'Press Start 2P', cursive", 
                  fontSize: '20px', 
                  color: stat.color,
                  marginBottom: '4px'
                }}>
                  {stat.value}
                </div>
                <div style={{ fontFamily: 'VT323, monospace', fontSize: '14px', color: '#666' }}>
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main content row */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Recent Beats */}
          <div className="flex-1">
            <RetroWindow title="Recent Beats - Explorer" icon="📂" menuItems={['File', 'Edit', 'View', 'Help']} statusBar={`${recentBeats.length} object(s)`}>
              <div style={{ background: 'white', minHeight: '200px' }}>
                {/* Column headers */}
                <div className="flex items-center gap-3 p-2" style={{ 
                  background: '#F0F0F0', 
                  borderBottom: '2px solid #ccc',
                  fontFamily: 'VT323, monospace',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  <span style={{ width: '24px' }}></span>
                  <span style={{ flex: 1 }}>Name</span>
                  <span style={{ width: '70px' }}>Genre</span>
                  <span style={{ width: '50px' }}>BPM</span>
                  <span style={{ width: '60px' }}>Duration</span>
                </div>
                {recentBeats.map((beat, i) => (
                  <div key={beat.id} className="flex items-center gap-3 p-2 cursor-pointer" style={{
                    background: i % 2 === 0 ? 'white' : '#F8F8F8',
                    fontFamily: 'VT323, monospace',
                    fontSize: '15px'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = '#CCE5FF')}
                  onMouseOut={(e) => (e.currentTarget.style.background = i % 2 === 0 ? 'white' : '#F8F8F8')}
                  >
                    <span style={{ width: '24px', fontSize: '18px' }}>🎵</span>
                    <span style={{ flex: 1, fontWeight: 'bold' }}>{beat.title}</span>
                    <span style={{ width: '70px', color: '#666' }}>{beat.genre}</span>
                    <span style={{ width: '50px', color: '#666' }}>{beat.bpm}</span>
                    <span style={{ width: '60px', color: '#666' }}>{beat.duration}</span>
                  </div>
                ))}
                <div className="p-3 text-center">
                  <Link href="/library">
                    <button className="xp-button" style={{ fontSize: '14px' }}>
                      📂 View All Beats →
                    </button>
                  </Link>
                </div>
              </div>
            </RetroWindow>
          </div>

          {/* Quick Actions */}
          <div className="w-full lg:w-[260px]">
            <RetroWindow title="Quick Actions" icon="⚡">
              <div style={{ padding: '8px' }}>
                <Link href="/generator" className="block mb-3">
                  <button className="xp-button xp-button-primary w-full" style={{ 
                    fontSize: '18px', 
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    justifyContent: 'center'
                  }}>
                    🎹 New Beat
                  </button>
                </Link>
                <Link href="/library" className="block mb-3">
                  <button className="xp-button w-full" style={{ 
                    fontSize: '16px', 
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    justifyContent: 'center'
                  }}>
                    📚 My Library
                  </button>
                </Link>
                <button className="xp-button w-full mb-3" style={{ 
                  fontSize: '16px', 
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  justifyContent: 'center'
                }}>
                  📊 View Stats
                </button>
                <button className="xp-button w-full" style={{ 
                  fontSize: '16px', 
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  justifyContent: 'center'
                }}>
                  ⚙️ Settings
                </button>
              </div>
            </RetroWindow>

            {/* System Info */}
            <div className="mt-4">
              <RetroWindow title="System Info" icon="💻">
                <div style={{ padding: '8px', fontFamily: 'VT323, monospace', fontSize: '14px' }}>
                  <div className="flex justify-between mb-1">
                    <span>User:</span>
                    <span style={{ color: '#0055E5' }}>{user?.name || 'Producer'}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>Plan:</span>
                    <span style={{ color: '#2A7A2A' }}>{(user?.plan || 'free').toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>Beats:</span>
                    <span>{stats.totalBeats}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>Storage:</span>
                    <span>142 MB / 1 GB</span>
                  </div>
                  <div className="mt-2">
                    <div style={{ fontSize: '12px', marginBottom: '2px' }}>Storage Usage:</div>
                    <div className="xp-progress">
                      <div className="xp-progress-bar" style={{ width: '14%' }} />
                    </div>
                  </div>
                </div>
              </RetroWindow>
            </div>
          </div>
        </div>
      </div>

      <Taskbar />
    </div>
  );
}
