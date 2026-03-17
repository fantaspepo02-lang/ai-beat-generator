'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Taskbar from '@/components/Taskbar';
import RetroWindow from '@/components/RetroWindow';
import AudioPlayer from '@/components/AudioPlayer';
import { getCurrentUser, updateProfile, getBeats, updateBeat, Beat, Profile } from '@/lib/supabaseData';
import { generateBeat, BeatParams } from '@/lib/beatEngine';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [beats, setBeats] = useState<Beat[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

  // Audio Playback State
  const [playingBuffer, setPlayingBuffer] = useState<AudioBuffer | null>(null);
  const [playingTitle, setPlayingTitle] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const profile = await getCurrentUser();
        if (profile) {
          setUser(profile);
          setEditName(profile.name || '');
          setEditBio(profile.bio || '');
          setEditAvatar(profile.profile_picture || '');
          
          const userBeats = await getBeats();
          setBeats(userBeats);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      const updated = await updateProfile({
        name: editName,
        bio: editBio,
        profile_picture: editAvatar || null
      });
      setUser(updated);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const togglePublicStatus = async (beat: Beat) => {
    try {
      await updateBeat(beat.id, { is_public: !beat.is_public });
      const userBeats = await getBeats();
      setBeats(userBeats);
    } catch (error) {
      console.error('Error toggling beat status:', error);
    }
  };

  const handleShare = (beat: Beat) => {
    const url = `${window.location.origin}/beat/${beat.id}`;
    navigator.clipboard.writeText(url);
    alert('Share link copied to clipboard!');
  };

  const handlePlay = async (beat: Beat) => {
    setLoadingId(beat.id);
    setPlayingTitle(beat.title);
    
    try {
      const params: BeatParams = {
        genre: beat.genre,
        bpm: beat.bpm,
        mood: beat.mood,
        instruments: beat.instruments,
        bars: beat.bars,
        complexity: 5,
      };
      const buffer = await generateBeat(params);
      setPlayingBuffer(buffer);
    } catch (error) {
      console.error('Error generating playback:', error);
    } finally {
      setLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen retro-grid flex items-center justify-center p-4" style={{ background: '#008080' }}>
        <div className="xp-window w-full m-4" style={{ maxWidth: '300px' }}>
          <div className="xp-titlebar">
            <div className="xp-titlebar-text"><span>⏳</span><span>Loading Profile</span></div>
          </div>
          <div className="xp-window-body text-center p-8">
            <p className="font-vt323 text-xl mb-4">Reading User Data...</p>
            <div className="xp-progress"><div className="xp-loading-bar" /></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const publicBeats = beats.filter(b => b.is_public);
  const privateBeats = beats.filter(b => !b.is_public);

  const statusText = "Public: " + publicBeats.length + " | Private: " + privateBeats.length;

  return (
    <div className="min-h-screen retro-grid p-4 pb-16" style={{ background: 'linear-gradient(135deg, #008080 0%, #004040 50%, #006060 100%)' }}>
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-4">
        
        {/* Left Column - Profile Info */}
        <div className="w-full md:w-[320px]">
          <RetroWindow title="User Profile" icon="👤">
            <div className="p-4 text-center" style={{ background: 'white' }}>
              <div 
                style={{ 
                  width: '120px', 
                  height: '120px', 
                  margin: '0 auto 16px',
                  borderRadius: '50%',
                  border: '3px solid #0055E5',
                  overflow: 'hidden',
                  background: '#F0F0F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px'
                }}
              >
                {user.profile_picture ? (
                  <img src={user.profile_picture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  '👨‍🎤'
                )}
              </div>
              
              {!isEditing ? (
                <>
                  <h2 style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '14px', color: '#0055E5', marginBottom: '8px' }}>
                    {user.name}
                  </h2>
                  <p style={{ fontFamily: 'VT323, monospace', fontSize: '16px', color: '#666', marginBottom: '16px' }}>
                    {user.email}
                  </p>
                  <div className="xp-groupbox mb-4 text-left">
                    <span className="xp-groupbox-label">About Me</span>
                    <p style={{ fontFamily: 'VT323, monospace', fontSize: '16px', marginTop: '8px' }}>
                      {user.bio || 'No bio yet.'}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mb-4" style={{ fontFamily: 'VT323, monospace', fontSize: '16px' }}>
                    <span>Plan: <strong style={{ color: '#2A7A2A' }}>{user.plan.toUpperCase()}</strong></span>
                    <span>Total Beats: <strong>{beats.length}</strong></span>
                  </div>
                  <button className="xp-button w-full" onClick={() => setIsEditing(true)}>
                    ✏️ Edit Profile
                  </button>
                </>
              ) : (
                <div className="text-left" style={{ fontFamily: 'VT323, monospace' }}>
                  <div className="mb-3">
                    <label className="block mb-1">Display Name:</label>
                    <input className="xp-input w-full" value={editName} onChange={e => setEditName(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label className="block mb-1">Bio:</label>
                    <textarea className="xp-input w-full" rows={3} value={editBio} onChange={e => setEditBio(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label className="block mb-1">Avatar Image URL (optional):</label>
                    <input className="xp-input w-full" value={editAvatar} onChange={e => setEditAvatar(e.target.value)} placeholder="https://..." />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button className="xp-button flex-1" onClick={() => setIsEditing(false)}>Cancel</button>
                    <button className="xp-button xp-button-primary flex-1" onClick={handleSaveProfile}>💾 Save</button>
                  </div>
                </div>
              )}
            </div>
          </RetroWindow>
          
          <div className="mt-4">
            <AudioPlayer audioBuffer={playingBuffer} title={playingTitle || 'Select a beat to play'} />
          </div>
        </div>

        {/* Right Column - Music Library Control */}
        <div className="flex-1 w-full overflow-hidden">
          <RetroWindow 
            title="My Published & Private Beats" 
            icon="🌐"
            statusBar={statusText}
          >
            <div style={{ background: '#F8F8F8', padding: '12px', minHeight: '400px' }}>
              
              <h3 style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '10px', color: '#2A7A2A', marginBottom: '12px' }}>
                🌐 PUBLIC BEATS ({" " + publicBeats.length + " "})
              </h3>
              <p style={{ fontFamily: 'VT323, monospace', fontSize: '14px', color: '#666', marginBottom: '12px' }}>
                These beats can be seen and played by anyone.
              </p>
              
              <div className="mb-6">
                {publicBeats.length === 0 ? (
                  <div className="p-4 text-center" style={{ background: 'white', border: '1px solid #ccc', fontFamily: 'VT323, monospace', color: '#999' }}>
                    You have no public beats.
                  </div>
                ) : (
                  <div style={{ background: 'white', border: '1px solid #ccc' }}>
                    {publicBeats.map((beat, i) => (
                      <div key={beat.id} className="flex items-center justify-between p-2" style={{ borderBottom: '1px solid #eee', background: i % 2 === 0 ? 'white' : '#FAFAFA', fontFamily: 'VT323, monospace', fontSize: '16px' }}>
                        <div className="flex items-center gap-2">
                          <button className="xp-button" style={{ padding: '0 6px', minWidth: 'auto' }} onClick={() => handlePlay(beat)}>
                            {loadingId === beat.id ? '⏳' : '▶'}
                          </button>
                          <strong style={{ width: '150px' }}>{beat.title}</strong>
                          <span style={{ color: '#666' }}>{beat.genre}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span style={{ color: '#C42B1C' }}>❤️ {beat.likes}</span>
                          <button className="xp-button" style={{ padding: '2px 8px', fontSize: '12px' }} onClick={() => handleShare(beat)}>
                            Share Link 🔗
                          </button>
                          <button className="xp-button" style={{ padding: '2px 8px', fontSize: '12px' }} onClick={() => togglePublicStatus(beat)}>
                            Make Private 🔒
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <h3 style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '10px', color: '#C42B1C', marginBottom: '12px' }}>
                🔒 PRIVATE BEATS ({" " + privateBeats.length + " "})
              </h3>
              
              <div>
                {privateBeats.length === 0 ? (
                  <div className="p-4 text-center" style={{ background: 'white', border: '1px solid #ccc', fontFamily: 'VT323, monospace', color: '#999' }}>
                    You have no private beats.
                  </div>
                ) : (
                  <div style={{ background: 'white', border: '1px solid #ccc' }}>
                    {privateBeats.map((beat, i) => (
                      <div key={beat.id} className="flex items-center justify-between p-2" style={{ borderBottom: '1px solid #eee', background: i % 2 === 0 ? 'white' : '#FAFAFA', fontFamily: 'VT323, monospace', fontSize: '16px' }}>
                        <div className="flex items-center gap-2">
                          <button className="xp-button" style={{ padding: '0 6px', minWidth: 'auto' }} onClick={() => handlePlay(beat)}>
                            {loadingId === beat.id ? '⏳' : '▶'}
                          </button>
                          <strong style={{ width: '150px' }}>{beat.title}</strong>
                          <span style={{ color: '#666' }}>{beat.genre}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button className="xp-button" style={{ padding: '2px 8px', fontSize: '12px' }} onClick={() => togglePublicStatus(beat)}>
                            Publish 🌐
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
            </div>
          </RetroWindow>
        </div>

      </div>

      <Taskbar />
    </div>
  );
}
