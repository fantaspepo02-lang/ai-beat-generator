'use client';
import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Taskbar from '@/components/Taskbar';
import RetroWindow from '@/components/RetroWindow';
import AudioPlayer from '@/components/AudioPlayer';
import { getBeats, updateBeat, deleteBeat, Beat, getCurrentUser } from '@/lib/supabaseData';
import { generateBeat, audioBufferToWav, BeatParams } from '@/lib/beatEngine';

export default function LibraryPage() {
  const router = useRouter();
  const [beats, setBeats] = useState<Beat[]>([]);
  
  React.useEffect(() => {
    async function loadData() {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.push('/login');
          return;
        }
        const userBeats = await getBeats();
        setBeats(userBeats);
      } catch (error) {
        console.error('Error loading library:', error);
      }
    }
    loadData();
  }, [router]);
  const [selectedBeat, setSelectedBeat] = useState<Beat | null>(null);
  const [playingBuffer, setPlayingBuffer] = useState<AudioBuffer | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [filterGenre, setFilterGenre] = useState('all');
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);

  const handlePlay = useCallback(async (beat: Beat) => {
    setSelectedBeat(beat);
    setLoadingId(beat.id);
    
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
      console.error('Error generating beat for playback:', error);
    } finally {
      setLoadingId(null);
    }
  }, []);

  const handleDownload = async (beat: Beat) => {
    setLoadingId(beat.id);
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
      const wav = audioBufferToWav(buffer);
      const url = URL.createObjectURL(wav);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${beat.title.replace(/\s+/g, '_')}.wav`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading beat:', error);
    } finally {
      setLoadingId(null);
    }
  };

  const handleRename = (beat: Beat) => {
    setEditingId(beat.id);
    setEditTitle(beat.title);
  };

  const confirmRename = async (id: string) => {
    try {
      await updateBeat(id, { title: editTitle });
      const userBeats = await getBeats();
      setBeats(userBeats);
      setEditingId(null);
      setEditTitle('');
    } catch (error) {
      console.error('Error renaming:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBeat(id);
      const userBeats = await getBeats();
      setBeats(userBeats);
      setShowDeleteDialog(null);
      if (selectedBeat?.id === id) {
        setSelectedBeat(null);
        setPlayingBuffer(null);
      }
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const handleShare = (beat: Beat) => {
    const url = `${window.location.origin}/beat/${beat.id}`;
    navigator.clipboard.writeText(url);
    alert('Share link copied to clipboard!');
  };

  const filteredBeats = filterGenre === 'all' 
    ? beats 
    : beats.filter(b => b.genre === filterGenre);

  const genres = ['all', ...Array.from(new Set(beats.map(b => b.genre)))];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', { 
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen retro-grid p-4 pb-16" style={{ background: 'linear-gradient(135deg, #008080 0%, #004040 50%, #006060 100%)' }}>
      <div className="max-w-5xl mx-auto">
        
        <RetroWindow 
          title={`My Beats - ${filteredBeats.length} object(s)`}
          icon="📚" 
          menuItems={['File', 'Edit', 'View', 'Favorites', 'Tools', 'Help']}
          statusBar={`${filteredBeats.length} beat(s) | Filter: ${filterGenre === 'all' ? 'All genres' : filterGenre}`}
        >
          {/* Toolbar */}
          <div className="xp-toolbar" style={{ gap: '8px' }}>
            <button 
              className={`xp-toolbar-btn ${viewMode === 'list' ? 'font-bold' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              📋 List
            </button>
            <button 
              className={`xp-toolbar-btn ${viewMode === 'grid' ? 'font-bold' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              📊 Grid
            </button>
            <div style={{ width: '1px', height: '20px', background: '#999', margin: '0 4px' }} />
            <span style={{ fontFamily: 'VT323, monospace', fontSize: '14px', marginRight: '4px' }}>Genre:</span>
            <select 
              className="xp-select"
              value={filterGenre}
              onChange={(e) => setFilterGenre(e.target.value)}
              style={{ fontSize: '14px', padding: '2px 4px' }}
            >
              {genres.map(g => (
                <option key={g} value={g}>{g === 'all' ? '📂 All Genres' : g}</option>
              ))}
            </select>
          </div>

          <div style={{ background: 'white', minHeight: '300px' }}>
            {viewMode === 'list' ? (
              // LIST VIEW
              <div>
                {/* Headers */}
                <div className="flex items-center gap-2 p-2" style={{ 
                  background: '#F0F0F0', 
                  borderBottom: '2px solid #ccc',
                  fontFamily: 'VT323, monospace',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  <span style={{ width: '30px' }}></span>
                  <span style={{ flex: 1 }}>Name</span>
                  <span className="hidden md:inline-block" style={{ width: '80px' }}>Genre</span>
                  <span className="hidden lg:inline-block" style={{ width: '50px' }}>BPM</span>
                  <span className="hidden lg:inline-block" style={{ width: '50px' }}>Bars</span>
                  <span style={{ width: '120px', textAlign: 'center' }}>Date</span>
                  <span style={{ width: '150px', textAlign: 'center' }}>Actions</span>
                </div>
                {filteredBeats.map((beat, i) => (
                  <div key={beat.id} className="flex items-center gap-2 p-2" style={{
                    background: selectedBeat?.id === beat.id ? '#CCE5FF' : i % 2 === 0 ? 'white' : '#F8F8F8',
                    fontFamily: 'VT323, monospace',
                    fontSize: '15px',
                    borderBottom: '1px solid #eee',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedBeat(beat)}
                  >
                    <span style={{ width: '30px', fontSize: '18px' }}>
                      {loadingId === beat.id ? '⏳' : '🎵'}
                    </span>
                    <span style={{ flex: 1, fontWeight: 'bold' }}>
                      {editingId === beat.id ? (
                        <span className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <input 
                            className="xp-input" 
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            style={{ fontSize: '14px', padding: '1px 4px', width: '140px' }}
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && confirmRename(beat.id)}
                          />
                          <button className="xp-button" style={{ fontSize: '12px', padding: '1px 6px', minWidth: 'auto' }} onClick={() => confirmRename(beat.id)}>✓</button>
                          <button className="xp-button" style={{ fontSize: '12px', padding: '1px 6px', minWidth: 'auto' }} onClick={() => setEditingId(null)}>✗</button>
                        </span>
                      ) : beat.title}
                    </span>
                    <span className="hidden md:inline-block" style={{ width: '80px', color: '#666' }}>{beat.genre}</span>
                    <span className="hidden lg:inline-block" style={{ width: '50px', color: '#666' }}>{beat.bpm}</span>
                    <span className="hidden lg:inline-block" style={{ width: '50px', color: '#666' }}>{beat.bars}</span>
                    <span className="hidden md:inline-block" style={{ width: '120px', color: '#666', fontSize: '13px' }}>{formatDate(beat.created_at)}</span>
                    <span style={{ width: '150px', display: 'flex', gap: '3px' }} onClick={(e) => e.stopPropagation()}>
                      <button className="xp-button" style={{ fontSize: '12px', padding: '1px 6px', minWidth: 'auto' }} onClick={() => handlePlay(beat)} title="Play">▶</button>
                      <button className="xp-button" style={{ fontSize: '12px', padding: '1px 6px', minWidth: 'auto' }} onClick={() => handleShare(beat)} title="Share">🔗</button>
                      <button className="xp-button hidden md:inline-block" style={{ fontSize: '12px', padding: '1px 6px', minWidth: 'auto' }} onClick={() => handleRename(beat)} title="Rename">✏️</button>
                      <button className="xp-button" style={{ fontSize: '12px', padding: '1px 6px', minWidth: 'auto' }} onClick={() => handleDownload(beat)} title="Download">💾</button>
                      <button className="xp-button" style={{ fontSize: '12px', padding: '1px 6px', minWidth: 'auto', color: '#C42B1C' }} onClick={() => setShowDeleteDialog(beat.id)} title="Delete">🗑️</button>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              // GRID VIEW
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                {filteredBeats.map(beat => (
                  <div key={beat.id} className="xp-window w-full" style={{ 
                    cursor: 'pointer',
                    border: selectedBeat?.id === beat.id ? '3px solid #0055E5' : undefined
                  }}
                  onClick={() => setSelectedBeat(beat)}
                  >
                    <div className="xp-titlebar" style={{ height: '22px', padding: '1px 4px' }}>
                      <div className="xp-titlebar-text" style={{ fontSize: '12px' }}>
                        <span>🎵</span>
                        <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {beat.title}
                        </span>
                      </div>
                    </div>
                    <div style={{ 
                      background: '#1a1a2e', 
                      padding: '16px',
                      textAlign: 'center',
                      height: '80px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <span style={{ fontSize: '40px' }}>
                        {beat.genre === 'trap' ? '🔥' : beat.genre === 'lofi' ? '🌧️' : beat.genre === 'house' ? '🏠' : beat.genre === 'techno' ? '⚡' : beat.genre === 'reggaeton' ? '🌴' : '🎤'}
                      </span>
                    </div>
                    <div className="xp-window-body" style={{ padding: '8px', fontSize: '13px', fontFamily: 'VT323, monospace' }}>
                      <div><strong>{beat.genre}</strong> • {beat.bpm} BPM</div>
                      <div style={{ color: '#666', fontSize: '11px' }}>{beat.duration} | {beat.bars} bars</div>
                      <div className="flex gap-1 mt-2" onClick={(e) => e.stopPropagation()}>
                        <button className="xp-button flex-1" style={{ fontSize: '11px', padding: '1px 4px', minWidth: 'auto' }} onClick={() => handlePlay(beat)}>▶</button>
                        <button className="xp-button flex-1" style={{ fontSize: '11px', padding: '1px 4px', minWidth: 'auto' }} onClick={() => handleShare(beat)}>🔗</button>
                        <button className="xp-button flex-1" style={{ fontSize: '11px', padding: '1px 4px', minWidth: 'auto' }} onClick={() => handleDownload(beat)}>💾</button>
                        <button className="xp-button" style={{ fontSize: '11px', padding: '1px 4px', minWidth: 'auto', color: '#C42B1C' }} onClick={() => setShowDeleteDialog(beat.id)}>🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredBeats.length === 0 && (
              <div className="p-8 text-center" style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#666' }}>
                📂 No beats found. Try a different filter or create a new beat!
              </div>
            )}
          </div>
        </RetroWindow>

        {/* Player */}
        <div className="mt-4">
          <AudioPlayer 
            audioBuffer={playingBuffer}
            title={selectedBeat?.title || 'Select a beat to play'}
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="xp-dialog-overlay p-4">
          <div className="xp-window window-animate w-full" style={{ maxWidth: '340px' }}>
            <div className="xp-titlebar">
              <div className="xp-titlebar-text">
                <span>⚠️</span>
                <span>Confirm Delete</span>
              </div>
              <div className="xp-titlebar-buttons">
                <button className="xp-btn-close" onClick={() => setShowDeleteDialog(null)}>✕</button>
              </div>
            </div>
            <div className="xp-window-body" style={{ padding: '20px' }}>
              <div className="flex gap-4 items-start mb-4">
                <span style={{ fontSize: '32px' }}>⚠️</span>
                <p style={{ fontFamily: 'VT323, monospace', fontSize: '16px' }}>
                  Are you sure you want to delete this beat? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <button className="xp-button" onClick={() => setShowDeleteDialog(null)} style={{ minWidth: '80px' }}>
                  Cancel
                </button>
                <button 
                  className="xp-button" 
                  onClick={() => handleDelete(showDeleteDialog)}
                  style={{ minWidth: '80px', color: '#C42B1C' }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Taskbar />
    </div>
  );
}
