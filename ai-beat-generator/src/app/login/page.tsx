'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Taskbar from '@/components/Taskbar';
import RetroWindow from '@/components/RetroWindow';

import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'magic'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (activeTab === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (activeTab === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Check your email for confirmation!');
      } else {
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) throw error;
        alert('Magic link sent!');
      }

      setShowDialog(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard',
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen retro-grid flex items-center justify-center p-4 pb-16" 
         style={{ background: 'linear-gradient(135deg, #008080 0%, #004040 50%, #006060 100%)' }}>
      
      {/* Login Dialog */}
      <div className="w-full max-w-md px-2">
        <RetroWindow title="Log On to Windows - AI Beat Generator" icon="🔑" maxWidth="100%">
          <div style={{ padding: '4px' }}>
            {/* Tabs */}
            <div className="xp-tabs">
              <button 
                className={`xp-tab ${activeTab === 'login' ? 'active' : ''}`}
                onClick={() => setActiveTab('login')}
              >
                📧 Email Login
              </button>
              <button 
                className={`xp-tab ${activeTab === 'signup' ? 'active' : ''}`}
                onClick={() => setActiveTab('signup')}
              >
                ✨ Sign Up
              </button>
              <button 
                className={`xp-tab ${activeTab === 'magic' ? 'active' : ''}`}
                onClick={() => setActiveTab('magic')}
              >
                🪄 Magic Link
              </button>
            </div>

            <div style={{ background: 'white', padding: '20px', border: '1px solid #808080' }}>
              {/* User icon */}
              <div className="flex items-center gap-4 mb-6">
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  border: '2px solid #ccc'
                }}>
                  🎵
                </div>
                <div>
                  <h2 style={{ 
                    fontFamily: "'Press Start 2P', cursive",
                    fontSize: '14px',
                    color: '#0055E5',
                    marginBottom: '4px'
                  }}>
                    {activeTab === 'signup' ? 'Create Account' : 'Welcome Back'}
                  </h2>
                  <p style={{ fontFamily: 'VT323, monospace', fontSize: '14px', color: '#666' }}>
                    {activeTab === 'magic' ? 'Enter your email for a magic link' : 'Enter your credentials to continue'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Email */}
                <div className="mb-4">
                  <label style={{ 
                    fontFamily: 'VT323, monospace', 
                    fontSize: '16px',
                    display: 'block',
                    marginBottom: '4px'
                  }}>
                    📧 Email Address:
                  </label>
                  <input 
                    type="email"
                    className="xp-input w-full"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {activeTab !== 'magic' && (
                  <div className="mb-4">
                    <label style={{ 
                      fontFamily: 'VT323, monospace', 
                      fontSize: '16px',
                      display: 'block',
                      marginBottom: '4px'
                    }}>
                      🔒 Password:
                    </label>
                    <input 
                      type="password"
                      className="xp-input w-full"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                )}

                {activeTab === 'signup' && (
                  <div className="mb-4">
                    <label style={{ 
                      fontFamily: 'VT323, monospace', 
                      fontSize: '16px',
                      display: 'block',
                      marginBottom: '4px'
                    }}>
                      🔒 Confirm Password:
                    </label>
                    <input 
                      type="password"
                      className="xp-input w-full"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                )}

                {error && (
                  <div className="mb-4 p-2" style={{ background: '#FFE5E5', border: '1px solid #C42B1C', color: '#C42B1C', fontFamily: 'VT323, monospace', fontSize: '14px' }}>
                    ❌ Error: {error}
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button type="submit" disabled={loading} className="xp-button xp-button-primary flex-1" style={{ fontSize: '18px', padding: '8px', opacity: loading ? 0.7 : 1 }}>
                    {loading ? '⏳ Please Wait...' : activeTab === 'login' ? '🔓 Log In' : activeTab === 'signup' ? '✨ Create Account' : '🪄 Send Magic Link'}
                  </button>
                </div>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-4 my-4">
                <div style={{ flex: 1, height: '1px', background: '#ccc' }} />
                <span style={{ fontFamily: 'VT323, monospace', fontSize: '14px', color: '#999' }}>OR</span>
                <div style={{ flex: 1, height: '1px', background: '#ccc' }} />
              </div>

              {/* Google OAuth */}
              <button 
                className="xp-button w-full flex items-center justify-center gap-2"
                style={{ fontSize: '16px', padding: '8px' }}
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <span style={{ fontSize: '20px' }}>🔵</span>
                {loading ? '⏳ Connecting...' : 'Sign in with Google'}
              </button>

              <div className="text-center mt-4">
                <Link href="/" style={{ 
                  fontFamily: 'VT323, monospace', 
                  fontSize: '14px', 
                  color: '#0055E5',
                  textDecoration: 'underline'
                }}>
                  ← Back to Home
                </Link>
              </div>
            </div>
          </div>
        </RetroWindow>
      </div>

      {/* Success dialog */}
      {showDialog && (
        <div className="xp-dialog-overlay">
          <div className="xp-window window-animate" style={{ width: '300px' }}>
            <div className="xp-titlebar">
              <div className="xp-titlebar-text">
                <span>✅</span>
                <span>Authentication</span>
              </div>
            </div>
            <div className="xp-window-body text-center" style={{ padding: '20px' }}>
              <p style={{ fontFamily: 'VT323, monospace', fontSize: '20px', marginBottom: '12px' }}>
                🎵 Login Successful!
              </p>
              <div className="xp-progress" style={{ marginBottom: '12px' }}>
                <div className="xp-loading-bar" />
              </div>
              <p style={{ fontFamily: 'VT323, monospace', fontSize: '14px', color: '#666' }}>
                Loading dashboard...
              </p>
            </div>
          </div>
        </div>
      )}

      <Taskbar />
    </div>
  );
}
