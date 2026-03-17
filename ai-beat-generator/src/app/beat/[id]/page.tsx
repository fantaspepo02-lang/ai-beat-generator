'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import RetroWindow from '@/components/RetroWindow';
import AudioPlayer from '@/components/AudioPlayer';
import Taskbar from '@/components/Taskbar';
import { getBeatById, Beat } from '@/lib/supabaseData';
import { generateBeat, BeatParams } from '@/lib/beatEngine';
import Link from 'next/link';

export default function PublicBeatPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [beat, setBeat] = useState<Beat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playingBuffer, setPlayingBuffer] = useState<AudioBuffer | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    async function loadBeat() {
      try {
        const data = await getBeatById(id);
        if (!data.is_public) {
          setError('This beat is private or does not exist.');
        } else {
          setBeat(data);
        }
      } catch (err: any) {
        console.error('Error loading beat:', err);
        setError('Beat not found.');
      } finally {
        setLoading(false);
      }
    }
    if (id) loadBeat();
  }, [id]);

  const handlePlay = async () => {
    if (!beat || playingBuffer) return;
    
    setIsGenerating(true);
    try {
      const genParams: BeatParams = {
        genre: beat.genre,
        bpm: beat.bpm,
        mood: beat.mood,
        instruments: beat.instruments,
        bars: beat.bars,
        complexity: 5,
      };
      const buffer = await generateBeat(genParams);
      setPlayingBuffer(buffer);
    } catch (err) {
      console.error('Error generating play:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen retro-grid flex items-center justify-center p-4" style={{ background: '#008080' }}>
        <div className="xp-window" style={{ width: '300px' }}>
          <div className="xp-window-body text-center p-8">
            <p className="font-vt323 text-xl mb-4">Loading Beat...</p>
            <div className="xp-progress"><div className="xp-loading-bar" /></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !beat) {
    return (
      <div className="min-h-screen retro-grid flex items-center justify-center p-4" style={{ background: '#008080' }}>
        <RetroWindow title="Error" icon="❌">
          <div className="p-8 text-center">
            <p className="font-vt323 text-xl mb-6">{error || 'Unknown error'}</p>
            <Link href="/">
              <button className="xp-button xp-button-primary">Return Home</button>
            </Link>
          </div>
        </RetroWindow>
      </div>
    );
  }

  return (
    <div className="min-h-screen retro-grid p-4 pb-20 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #008080 0%, #004040 50%, #006060 100%)' }}>
      <div className="w-full max-w-xl">
        <RetroWindow 
          title={`Shared Beat: ${beat.title}`} 
          icon="🎵"
          statusBar="Public Shared Beat"
        >
          <div className="p-6 bg-white space-y-6">
            <div className="flex items-center gap-6">
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px',
                border: '2px solid #ccc'
              }}>
                🎵
              </div>
              <div>
                <h1 style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '18px', color: '#0055E5', marginBottom: '8px' }}>
                  {beat.title}
                </h1>
                <p style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#666' }}>
                  Genre: <strong>{beat.genre.toUpperCase()}</strong> | BPM: <strong>{beat.bpm}</strong>
                </p>
              </div>
            </div>

            <div className="xp-groupbox">
              <span className="xp-groupbox-label">Description</span>
              <div className="p-2 font-vt323 text-lg">
                This beat was created with AI Beat Generator. It features {beat.instruments.join(', ')} with a {beat.mood} mood.
              </div>
            </div>

            <div className="pt-4">
              {!playingBuffer ? (
                <button 
                  className="xp-button xp-button-primary w-full py-4 text-xl"
                  onClick={handlePlay}
                  disabled={isGenerating}
                >
                  {isGenerating ? '⏳ PROCESSING SIGNAL...' : '▶ LOAD & PLAY BEAT'}
                </button>
              ) : (
                <AudioPlayer audioBuffer={playingBuffer} title={beat.title} />
              )}
            </div>

            <div className="pt-6 border-t border-gray-200 text-center">
              <p className="font-vt323 text-lg mb-4 text-gray-600">Want to create your own professional beats?</p>
              <Link href="/generator">
                <button className="xp-button w-full sm:w-auto px-8">
                  🎹 Try AI Beat Generator Now
                </button>
              </Link>
            </div>
          </div>
        </RetroWindow>
      </div>
      <Taskbar />
    </div>
  );
}
