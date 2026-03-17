'use client';
import React, { useState, useCallback } from 'react';
import Taskbar from '@/components/Taskbar';
import RetroWindow from '@/components/RetroWindow';
import AudioPlayer from '@/components/AudioPlayer';
import { generateBeat, audioBufferToWav, GENRES, MOODS, INSTRUMENTS, BeatParams } from '@/lib/beatEngine';
import { saveBeat, MockBeat } from '@/lib/mockData';

export default function GeneratorPage() {
  const [genre, setGenre] = useState('trap');
  const [bpm, setBpm] = useState(140);
  const [mood, setMood] = useState('dark');
  const [bars, setBars] = useState(8);
  const [complexity, setComplexity] = useState(5);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>(['kick', 'snare', 'hihat', '808']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBuffer, setGeneratedBuffer] = useState<AudioBuffer | null>(null);
  const [beatTitle, setBeatTitle] = useState('');
  const [generateCount, setGenerateCount] = useState(0);
  const [hasSaved, setHasSaved] = useState(false);
  const [generateMode, setGenerateMode] = useState<'manual' | 'text'>('manual');
  const [textPrompt, setTextPrompt] = useState('');

  const instrumentGroups = {
    drums: ['kick', 'snare', 'hihat', '808', 'clap'],
    melodic: ['piano', 'synth', 'guitar', 'bass', 'strings', 'vocal', 'trumpet', 'sax', 'flute', 'lead', 'pad', 'pluck', 'organ', 'bell', 'marimba', 'kalimba'],
    percussion: ['tom', 'crash', 'cowbell', 'cymbal', 'bongo', 'shaker', 'triangle', 'clave', 'woodblock'],
    fx: ['vinyl', 'riser']
  };

  const toggleInstrument = (inst: string) => {
    setSelectedInstruments(prev => 
      prev.includes(inst) ? prev.filter(i => i !== inst) : [...prev, inst]
    );
  };

  const handleGenerate = useCallback(async () => {
    let finalGenre = 'trap';
    let finalBpm = 140;
    let finalMood = 'dark';
    let finalBars = 16;
    let finalInstruments: string[] = [];
    let finalComplexity = 5;

    if (generateMode === 'text') {
      if (!textPrompt.trim()) return;
      
      const lowerPrompt = textPrompt.toLowerCase();
      
      // Robust Genre detection
      let explicitGenre = false;
      const genreAliases: Record<string, string[]> = {
        trap: ['trap'],
        'hip-hop': ['hip-hop', 'hip hop', 'hiphop', 'rap', 'hiphop'],
        lofi: ['lofi', 'lo-fi', 'lo fi', 'chillhop'],
        phonk: ['phonk', 'drift', 'brazilian phonk'],
        afrobeat: ['afrobeat', 'afro', 'nigerian', 'burna boy', 'wizkid'],
        'baile-funk': ['baile funk', 'baile', 'favela', 'funk carioca'],
        drill: ['drill', 'dril', 'uk drill', 'ny drill'],
        cyberpunk: ['cyberpunk', 'futuristic', 'industrial', 'dark synth'],
        house: ['house', 'edm', 'club'],
        techno: ['techno', 'tekno', 'berlin'],
        reggaeton: ['reggaeton', 'regueton', 'dembow', 'perreo'],
        disco: ['disco', '70s', 'funk disco'],
        jazz: ['jazz', 'jazzy', 'miles davis'],
        rock: ['rock', 'metal', 'grunge'],
        pop: ['pop', 'comercial', 'mainstream'],
        synthwave: ['synthwave', 'retrowave', '80s'],
      };
      
      for (const [g, aliases] of Object.entries(genreAliases)) {
        if (aliases.some(alias => lowerPrompt.includes(alias))) {
          finalGenre = g;
          explicitGenre = true;
          break;
        }
      }
      if (!explicitGenre) {
        // Fallback to a pseudorandom genre based on prompt length if nothing is matched
        const fallbackGenres = ['trap', 'hip-hop', 'lofi', 'house', 'synthwave', 'drill', 'pop', 'reggaeton'];
        finalGenre = fallbackGenres[lowerPrompt.length % fallbackGenres.length];
      }

      // Robust Mood detection
      let explicitMood = false;
      const moodAliases: Record<string, string[]> = {
        dark: ['dark', 'oscuro', 'misterioso'],
        chill: ['chill', 'relajado', 'tranquilo', 'suave'],
        energetic: ['energetic', 'energetico', 'energico', 'activo', 'rapido'],
        aggressive: ['aggressive', 'agresivo', 'duro', 'fuerte'],
        dreamy: ['dreamy', 'soñador', 'espacial', 'nube', 'cloud'],
        nostalgic: ['nostalgic', 'nostalgico', 'viejo', 'old school', 'recuerdo'],
      };
      for (const [m, aliases] of Object.entries(moodAliases)) {
        if (aliases.some(alias => lowerPrompt.includes(alias))) {
          finalMood = m;
          explicitMood = true;
          break;
        }
      }
      if (!explicitMood) finalMood = 'chill'; // default text mood
      
      // Robust BPM
      let explicitBpm = false;
      const bpmMatch = lowerPrompt.match(/(\d+)\s*bpm/);
      if (bpmMatch) {
        finalBpm = Math.min(200, Math.max(60, parseInt(bpmMatch[1])));
        explicitBpm = true;
      } else if (lowerPrompt.match(/(fast|rapido|rápido|acelerado)/)) {
        finalBpm = 160;
        explicitBpm = true;
      } else if (lowerPrompt.match(/(slow|lento|despacio|tranquilo)/)) {
        finalBpm = 80;
        explicitBpm = true;
      }

      if (!explicitBpm) {
        const defaultBpms: Record<string, number> = {
          trap: 140, 'hip-hop': 90, lofi: 75, house: 125,
          techno: 135, reggaeton: 95, rock: 120, pop: 110,
          synthwave: 115, drill: 140
        };
        finalBpm = defaultBpms[finalGenre] || 120;
      }

      const minMatch = lowerPrompt.match(/(\d+)\s*(min|minuto)/);
      if (minMatch) {
        const mins = Math.min(8, Math.max(1, parseInt(minMatch[1])));
        const barsPerMin = Math.round(finalBpm / 4);
        finalBars = mins * barsPerMin;
      } else {
        finalBars = 16; // default 16 bars for text prompt
      }

      // Instruments detection with Spanish & Artist support
      const aliasMap: Record<string, string[]> = {
        kick: ['kick', 'bombo', 'fuerte', 'duro', 'travis', 'skrillex'],
        snare: ['snare', 'caja', 'tarola'],
        hihat: ['hihat', 'hat', 'charles', 'trap'],
        '808': ['808', 'sub', 'bizarrap', 'duki', 'metro boomin'],
        clap: ['clap', 'palma', 'fiesta'],
        tom: ['tom'],
        crash: ['crash', 'platillo fuerte'],
        cowbell: ['cowbell', 'campana', 'phonk'],
        cymbal: ['cymbal', 'plato', 'platillo'],
        bongo: ['bongo', 'bongó', 'rosalia', 'bad bunny', 'playa', 'latino'],
        shaker: ['shaker', 'maraca', 'suave'],
        guitar: ['guitar', 'guitarra', 'acustica', 'electrica', 'rock', 'post malone', 'indie', 'triste', 'melancolico'],
        trumpet: ['trumpet', 'trompeta', 'viento', 'metales', 'jazz'],
        piano: ['piano', 'teclado', 'melodia', 'mac miller', 'elegante', 'clasico', 'sad'],
        synth: ['synth', 'sintetizador', 'pad', 'sintesis', 'electronico', 'espacial', 'alien', 'futurista', 'the weeknd', 'daft punk'],
        sax: ['sax', 'saxofon', 'saxofón', 'jazz', 'sexy'],
        flute: ['flute', 'flauta', 'drill', 'ny', 'pop smoke'],
        bass: ['bass', 'bajo electrico', 'bajo eléctrico', 'bajo', 'bassline', 'funk', 'dua lipa'],
        strings: ['strings', 'cuerdas', 'violin', 'violín', 'cello', 'violines', 'epico', 'orquesta', 'dramatico'],
        vocal: ['vocal', 'voz', 'voces', 'choir', 'coro', 'celestial', 'angelical', 'kanye'],
        marimba: ['marimba', 'xilofono', 'xilófono', 'tropical', 'verano', 'j balvin'],
        triangle: ['triangle', 'triangulo', 'triángulo', 'magico'],
        bell: ['bell', 'camponilla', 'campana', 'chime', 'glockenspiel'],
        pad: ['pad', 'atmosfera', 'ambiente', 'fondo', 'synth pad'],
        lead: ['lead', 'solista', 'puntero', 'destacado', 'melodico fuerte'],
        pluck: ['pluck', 'punteo', 'corto', 'staccato'],
        organ: ['organ', 'organo', 'iglesia', 'retro organ'],
        kalimba: ['kalimba', 'mbira', 'pulgar', 'africano'],
        clave: ['clave', 'palo', 'ritmo latino'],
        woodblock: ['woodblock', 'madera', 'bloque'],
        vinyl: ['vinyl', 'vinilo', 'crackle', 'ruido', 'lo-fi noise'],
        riser: ['riser', 'subida', 'tension', 'drop prep'],
      };

      const foundInsts = INSTRUMENTS.filter(i => {
        const aliases = aliasMap[i.value] || [i.value];
        return aliases.some(alias => lowerPrompt.includes(alias));
      }).map(i => i.value);
      
      const defaultInsts: Record<string, string[]> = {
        trap: ['kick', 'snare', 'hihat', '808'],
        'hip-hop': ['kick', 'snare', 'hihat', 'bass', 'piano'],
        lofi: ['kick', 'snare', 'hihat', 'piano', 'vinyl'],
        phonk: ['kick', 'snare', 'hihat', 'cowbell', '808'],
        afrobeat: ['kick', 'snare', 'hihat', 'bongo', 'shaker', 'clave'],
        'baile-funk': ['kick', 'snare', 'vocal', 'clap'],
        drill: ['kick', 'snare', 'hihat', '808', 'flute'],
        cyberpunk: ['kick', 'bass', 'synth', 'lead', 'hihat'],
        house: ['kick', 'clap', 'hihat', 'synth', 'bass'],
        techno: ['kick', 'hihat', 'clap', 'synth'],
        reggaeton: ['kick', 'snare', 'hihat', 'bongo', 'bass'],
        disco: ['kick', 'snare', 'hihat', 'guitar', 'synth', 'cowbell'],
        jazz: ['kick', 'cymbal', 'piano', 'sax', 'bass'],
        rock: ['kick', 'snare', 'hihat', 'crash', 'guitar', 'bass'],
        pop: ['kick', 'snare', 'hihat', 'piano', 'synth', 'bass'],
        synthwave: ['kick', 'snare', 'hihat', 'synth', 'bass'],
      };

      if (foundInsts.length > 0) {
        // If they only asked for melodic instruments, make sure to add drums so it's a beat!
        const needsDrums = !foundInsts.some(i => ['kick', 'snare', 'hihat', 'clap'].includes(i));
        const hasDrumsInRegex = lowerPrompt.includes('bateria') || lowerPrompt.includes('percusiones') || lowerPrompt.includes('ritmo') || lowerPrompt.includes('drum');
        
        finalInstruments = foundInsts;
        if (needsDrums || hasDrumsInRegex) {
           const genreDrums = defaultInsts[finalGenre].filter(i => ['kick', 'snare', 'hihat', 'clap', '808'].includes(i));
           finalInstruments = Array.from(new Set([...finalInstruments, ...genreDrums]));
        }
      } else {
        // If entirely ambiguous, use the genre defaults, ignoring whatever is in the manual selection.
        finalInstruments = defaultInsts[finalGenre] || ['kick', 'snare', 'hihat'];
      }
      
      let explicitComplexity = false;
      if (lowerPrompt.includes('complex') || lowerPrompt.includes('crazy') || lowerPrompt.includes('complejo') || lowerPrompt.includes('loco') || lowerPrompt.includes('variado')) {
        finalComplexity = 9;
        explicitComplexity = true;
      } else if (lowerPrompt.includes('simple') || lowerPrompt.includes('basic') || lowerPrompt.includes('basico') || lowerPrompt.includes('básico') || lowerPrompt.includes('sencillo')) {
        finalComplexity = 2;
        explicitComplexity = true;
      }
      if (!explicitComplexity) {
         finalComplexity = 4 + (lowerPrompt.length % 5); // pseudorandom complexity
      }

      // Update UI state so user sees what the AI actually decided!
      setGenre(finalGenre);
      setBpm(finalBpm);
      setMood(finalMood);
      setBars(finalBars);
      setSelectedInstruments(finalInstruments);
      setComplexity(finalComplexity);
      
    } else {
      if (selectedInstruments.length === 0) return;
      finalGenre = genre;
      finalBpm = bpm;
      finalMood = mood;
      finalBars = bars;
      finalInstruments = [...selectedInstruments];
      finalComplexity = complexity;
    }
    
    setIsGenerating(true);
    setGeneratedBuffer(null);
    setHasSaved(false);

    try {
      // Create a deterministic seed from the text prompt
      let textSeed = 0;
      if (generateMode === 'text') {
        for (let i = 0; i < textPrompt.length; i++) {
          textSeed = textPrompt.charCodeAt(i) + ((textSeed << 5) - textSeed);
        }
      }

      const params: BeatParams = {
        genre: finalGenre,
        bpm: finalBpm,
        mood: finalMood,
        instruments: finalInstruments,
        bars: finalBars,
        complexity: finalComplexity,
        isAi: generateMode === 'text',
        seed: Math.abs(textSeed),
      };

      // Add slight delay for UX
      await new Promise(resolve => setTimeout(resolve, generateMode === 'text' ? 1500 : 800));
      const buffer = await generateBeat(params);
      setGeneratedBuffer(buffer);
      setGenerateCount(prev => prev + 1);
      
      const genreLabel = GENRES.find(g => g.value === finalGenre)?.label?.split(' ')[1] || finalGenre;
      setBeatTitle(generateMode === 'text' ? 'AI_Prompt_Beat' : `${genreLabel}_Beat_${generateCount + 1}`);
    } catch (error) {
      console.error('Error generating beat:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [genre, bpm, mood, bars, complexity, selectedInstruments, generateCount, generateMode, textPrompt]);

  const handleDownload = () => {
    if (!generatedBuffer) return;
    const wav = audioBufferToWav(generatedBuffer);
    const url = URL.createObjectURL(wav);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${beatTitle || 'beat'}.wav`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveToLibrary = () => {
    if (!generatedBuffer) return;
    
    // Create MockBeat from current params
    const genreLabel = GENRES.find(g => g.value === genre)?.label?.split(' ')[1] || genre;
    const durationSecs = generatedBuffer.duration;
    const mins = Math.floor(durationSecs / 60);
    const secs = Math.floor(durationSecs % 60).toString().padStart(2, '0');
    
    const newBeat: MockBeat = {
      id: `beat-${Date.now()}`,
      title: beatTitle || `${genreLabel} Beat`,
      genre: genre,
      bpm: bpm,
      mood: mood,
      bars: bars,
      createdAt: new Date().toISOString(),
      duration: `${mins}:${secs}`,
      instruments: selectedInstruments,
      isPublic: false,
      likes: 0,
      author: {
        id: 'user-001',
        name: 'DJ Producer' // Should use getStoredUser but keeping it simple for mock
      }
    };
    
    saveBeat(newBeat);
    setHasSaved(true);
  };

  return (
    <div className="min-h-screen retro-grid p-4 pb-16" style={{ background: 'linear-gradient(135deg, #008080 0%, #004040 50%, #006060 100%)' }}>
      <div className="max-w-3xl mx-auto space-y-6 flex flex-col items-center">
        
        {/* Main Generator Window */}
        <RetroWindow 
          title="AI Beat Generator v1.0" 
          icon="🎹" 
          menuItems={['File', 'Edit', 'Generate', 'Tools', 'Help']}
          statusBar={isGenerating ? '⏳ Generating beat...' : generatedBuffer ? (hasSaved ? `✅ Saved to Library: ${beatTitle}` : `✅ Beat generated: ${beatTitle}`) : 'Ready - Select parameters and click Generate'}
          onClose={() => window.history.back()}
        >
          <div className="p-4 space-y-6">
            
            {/* Mode Selection */}
            <div className="flex gap-2">
              <button 
                className={`xp-button flex-1 ${generateMode === 'manual' ? 'xp-button-primary' : ''}`}
                onClick={() => setGenerateMode('manual')}
              >
                🎛️ Manual Studio
              </button>
              <button 
                className={`xp-button flex-1 ${generateMode === 'text' ? 'xp-button-primary' : ''}`}
                onClick={() => setGenerateMode('text')}
              >
                🤖 AI Composer
              </button>
            </div>

            {generateMode === 'text' ? (
              <div className="xp-groupbox">
                <span className="xp-groupbox-label">AI Composer Mode</span>
                <div className="p-2 space-y-3">
                  <p className="text-sm text-gray-600 font-mono">DESCRIBE THE BEAT YOU WANT TO CREATE:</p>
                  <textarea 
                    className="xp-input w-full min-h-[120px] text-lg"
                    placeholder="e.g. A fast trap beat with a dark mood, 160 bpm. Add 808s and a spooky trumpet."
                    value={textPrompt}
                    onChange={(e) => setTextPrompt(e.target.value)}
                    style={{ resize: 'none' }}
                  />
                  <div className="flex items-center gap-2 text-xs text-blue-800 bg-blue-50 p-2 border border-blue-200">
                    <span className="animate-pulse">ℹ️</span>
                    <span>AI understands artists (Drake, Bizarrap), moods, and specific instruments.</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Engine Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="xp-groupbox">
                    <span className="xp-groupbox-label">Genre & Mood</span>
                    <div className="space-y-3 p-2">
                      <div>
                        <label className="block text-sm font-mono mb-1">Select Genre:</label>
                        <select className="xp-select w-full" value={genre} onChange={(e) => setGenre(e.target.value)}>
                          {GENRES.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-mono mb-1">Musical Mood:</label>
                        <select className="xp-select w-full" value={mood} onChange={(e) => setMood(e.target.value)}>
                          {MOODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="xp-groupbox">
                    <span className="xp-groupbox-label">Playback Config</span>
                    <div className="space-y-4 p-2">
                      <div>
                        <div className="flex justify-between text-sm font-mono mb-1">
                          <span>Tempo:</span>
                          <span className="text-blue-700 font-bold">{bpm} BPM</span>
                        </div>
                        <input type="range" className="xp-slider" min={60} max={200} value={bpm} onChange={(e) => setBpm(Number(e.target.value))} />
                      </div>
                      <div>
                        <label className="block text-sm font-mono mb-1">Beat Duration:</label>
                        <select className="xp-select w-full" value={bars} onChange={(e) => setBars(Number(e.target.value))}>
                          <option value={4}>4 bars (~8s)</option>
                          <option value={8}>8 bars (~15s)</option>
                          <option value={16}>16 bars (~30s)</option>
                          <option value={32}>32 bars (~1 min)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instrument Rack */}
                <div className="xp-groupbox">
                  <span className="xp-groupbox-label">Instrument Rack</span>
                  <div className="p-2">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {INSTRUMENTS.map((inst) => (
                        <label 
                          key={inst.value} 
                          className={`flex items-center gap-2 p-2 border cursor-pointer hover:bg-gray-100 transition-colors ${selectedInstruments.includes(inst.value) ? 'bg-blue-50 border-blue-400' : 'bg-white border-gray-200'}`}
                        >
                          <input 
                            type="checkbox" 
                            className="xp-checkbox" 
                            checked={selectedInstruments.includes(inst.value)}
                            onChange={() => toggleInstrument(inst.value)}
                          />
                          <span className="text-sm font-mono">{inst.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Generation Controls */}
            <div className="pt-4 border-t border-gray-300">
              <button 
                className="xp-button xp-button-primary w-full py-4 text-xl"
                onClick={handleGenerate}
                disabled={isGenerating || (generateMode === 'manual' && selectedInstruments.length === 0)}
              >
                {isGenerating ? '⏳ PROCESSING SIGNAL...' : generateMode === 'text' ? '🚀 GENERATE WITH AI' : '🎹 BUILD BEAT'}
              </button>

              {isGenerating && (
                <div className="mt-4">
                  <div className="xp-progress">
                    <div className="xp-loading-bar" style={{ width: '100%' }} />
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </RetroWindow>

        {/* Status & Preview Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <RetroWindow title="Status Monitor" icon="📡">
            <div className="p-4 font-mono text-sm space-y-2">
               <div className="flex justify-between border-b pb-1">
                 <span className="text-gray-500 italic">SYSTEM:</span>
                 <span className="text-green-600 font-bold">● ONLINE</span>
               </div>
               <div className="flex justify-between">
                 <span>ACTIVE GENRE:</span>
                 <span className="text-blue-700 font-bold uppercase">{genre}</span>
               </div>
               <div className="flex justify-between">
                 <span>BPM:</span>
                 <span className="text-blue-700 font-bold">{bpm}</span>
               </div>
               <div className="flex justify-between">
                 <span>INSTRUMENTS:</span>
                 <span className="text-blue-700 font-bold">{selectedInstruments.length}</span>
               </div>
            </div>
          </RetroWindow>

          <RetroWindow title="Waveform Preview" icon="📉">
            <div className="bg-black aspect-video flex items-center justify-center relative overflow-hidden">
               <div className="flex items-center gap-[2px] h-1/2 w-full px-4 opacity-70">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="bg-green-500 w-full rounded-full"
                    style={{ 
                      height: generatedBuffer ? `${20 + Math.random() * 80}%` : '5%',
                      transition: 'height 0.2s',
                    }}
                  />
                ))}
              </div>
              {!generatedBuffer && <span className="absolute text-[10px] text-green-800 font-mono">STANDBY...</span>}
            </div>
          </RetroWindow>
        </div>

        {/* Audio Player */}
        <div className="flex justify-center w-full">
          <div className="w-full">
            <AudioPlayer 
              audioBuffer={generatedBuffer}
              title={beatTitle || 'Ready to Generate'}
            />
          </div>
        </div>

        {generatedBuffer && (
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <button className="xp-button flex-1 font-bold" onClick={handleDownload}>💾 EXPORT WAV</button>
            <button 
              className={`xp-button flex-1 font-bold ${hasSaved ? 'opacity-50' : 'xp-button-primary'}`} 
              onClick={handleSaveToLibrary}
              disabled={hasSaved}
            >
              {hasSaved ? '✅ SAVED TO LIBRARY' : '📁 ADD TO LIBRARY'}
            </button>
          </div>
        )}

      </div>

      <Taskbar />
    </div>
  );
}
