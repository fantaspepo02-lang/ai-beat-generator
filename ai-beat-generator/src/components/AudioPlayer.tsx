'use client';
import React, { useRef, useEffect, useState, useCallback } from 'react';

interface AudioPlayerProps {
  audioUrl?: string;
  title?: string;
  onEnded?: () => void;
  audioBuffer?: AudioBuffer | null;
}

export default function AudioPlayer({ audioUrl, title = 'Untitled Beat', onEnded, audioBuffer }: AudioPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const drawVisualizer = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = '#0a2a0a';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < canvas.height; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * canvas.height;
      
      const gradient = ctx.createLinearGradient(x, canvas.height - barHeight, x, canvas.height);
      gradient.addColorStop(0, '#00ff41');
      gradient.addColorStop(0.5, '#00cc33');
      gradient.addColorStop(1, '#008822');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
      
      // Glow effect
      ctx.shadowColor = '#00ff41';
      ctx.shadowBlur = 4;
      ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, 2);
      ctx.shadowBlur = 0;
      
      x += barWidth;
    }

    // Update time
    if (isPlaying && audioContextRef.current && audioBuffer) {
      const elapsed = audioContextRef.current.currentTime - startTimeRef.current;
      setCurrentTime(Math.min(elapsed, audioBuffer.duration));
      setProgress((elapsed / audioBuffer.duration) * 100);
      if (elapsed >= audioBuffer.duration) {
        setIsPlaying(false);
        onEnded?.();
      }
    }

    animationRef.current = requestAnimationFrame(drawVisualizer);
  }, [isPlaying, audioBuffer, onEnded]);

  useEffect(() => {
    if (audioBuffer) {
      setDuration(audioBuffer.duration);
    }
  }, [audioBuffer]);

  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(drawVisualizer);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, drawVisualizer]);

  // Draw initial static visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#0a2a0a';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < canvas.height; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }

    // Draw static bars
    ctx.fillStyle = '#003300';
    for (let i = 0; i < canvas.width; i += 6) {
      const h = Math.random() * 30 + 5;
      ctx.fillRect(i, canvas.height - h, 4, h);
    }

    // Label text
    ctx.fillStyle = '#00ff41';
    ctx.font = '14px VT323, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(audioBuffer ? '► READY TO PLAY' : 'AWAITING SIGNAL...', canvas.width / 2, canvas.height / 2);
  }, [audioBuffer]);

  const togglePlay = async () => {
    if (!audioBuffer) return;

    if (isPlaying) {
      sourceRef.current?.stop();
      setIsPlaying(false);
      return;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    const ctx = audioContextRef.current;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(analyser);
    analyser.connect(ctx.destination);
    
    startTimeRef.current = ctx.currentTime;
    source.start(0);
    sourceRef.current = source;
    setIsPlaying(true);

    source.onended = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="xp-window" style={{ width: '100%' }}>
      <div className="xp-titlebar">
        <div className="xp-titlebar-text">
          <span>🎵</span>
          <span>AI Beat Player - {title}</span>
        </div>
        <div className="xp-titlebar-buttons">
          <button className="xp-btn-minimize">─</button>
          <button className="xp-btn-maximize">□</button>
          <button className="xp-btn-close">✕</button>
        </div>
      </div>
      <div className="xp-window-body" style={{ padding: '0', background: '#000' }}>
        <canvas 
          ref={canvasRef} 
          width={600} 
          height={120}
          className="visualizer-canvas"
          style={{ width: '100%', height: '120px' }}
        />
      </div>
      <div style={{ 
        background: '#1a1a2e', 
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        borderTop: '1px solid #333'
      }}>
        <button 
          onClick={togglePlay}
          disabled={!audioBuffer}
          style={{
            background: audioBuffer ? 'linear-gradient(180deg, #00cc33, #008822)' : '#333',
            border: '2px solid',
            borderColor: audioBuffer ? '#00ff41 #005500 #005500 #00ff41' : '#555',
            color: 'white',
            padding: '4px 12px',
            cursor: audioBuffer ? 'pointer' : 'not-allowed',
            fontFamily: 'VT323, monospace',
            fontSize: '18px',
            borderRadius: '2px',
            minWidth: '40px'
          }}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button
          onClick={() => {
            sourceRef.current?.stop();
            setIsPlaying(false);
            setProgress(0);
            setCurrentTime(0);
          }}
          style={{
            background: 'linear-gradient(180deg, #333, #222)',
            border: '2px solid #555',
            color: '#ccc',
            padding: '4px 12px',
            cursor: 'pointer',
            fontFamily: 'VT323, monospace',
            fontSize: '18px',
            borderRadius: '2px'
          }}
        >
          ⏹
        </button>
        <div style={{ flex: 1 }}>
          <div className="xp-progress" style={{ background: '#111' }}>
            <div className="xp-progress-bar" style={{ 
              width: `${progress}%`,
              background: 'repeating-linear-gradient(90deg, #00cc33 0px, #00cc33 4px, #00ff41 4px, #00ff41 6px)'
            }} />
          </div>
        </div>
        <span style={{ 
          color: '#00ff41', 
          fontFamily: 'VT323, monospace',
          fontSize: '16px',
          minWidth: '80px',
          textAlign: 'right'
        }}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}
