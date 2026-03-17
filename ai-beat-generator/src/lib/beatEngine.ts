// Client-side beat generation engine using Web Audio API
// Generates drum patterns based on genre, BPM, mood parameters

export interface BeatParams {
  genre: string;
  bpm: number;
  mood: string;
  instruments: string[];
  bars: number;
  complexity: number;
  isAi?: boolean;
  seed?: number;
}

export interface GeneratedBeat {
  id: string;
  title: string;
  genre: string;
  bpm: number;
  mood: string;
  bars: number;
  audioBuffer: AudioBuffer;
  createdAt: string;
}

// Drum patterns per genre (1 = hit, 0 = rest)
const PATTERNS: Record<string, Record<string, number[]>> = {
  trap: {
    kick:    [1,0,0,0, 0,0,1,0, 0,0,0,0, 1,0,0,0],
    snare:   [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    hihat:   [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
    '808':   [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
    clap:    [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,1],
    tom:     [0,0,0,0, 0,0,0,0, 0,1,0,1, 0,0,0,0],
    crash:   [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    cowbell: [0,0,1,0, 0,0,1,0, 0,0,0,0, 0,1,0,0],
    cymbal:  [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    bongo:   [0,0,1,1, 0,0,0,0, 0,0,1,0, 0,0,0,0],
    shaker:  [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
    guitar:  [0,0,0,1, 0,0,0,0, 0,0,0,1, 0,0,0,0],
    trumpet: [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    piano:   [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
    synth:   [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
    sax:     [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    flute:   [0,0,1,0, 0,0,0,0, 0,0,1,0, 0,0,0,0],
    bass:    [1,0,0,0, 0,0,1,0, 0,0,0,0, 1,0,0,0],
  },
  'hip-hop': {
    kick:    [1,0,0,0, 0,0,1,0, 0,1,0,0, 0,0,1,0],
    snare:   [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    hihat:   [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
    '808':   [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    clap:    [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    tom:     [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,1,1,0],
    crash:   [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    cowbell: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    cymbal:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    bongo:   [0,0,0,0, 0,1,0,0, 0,0,0,0, 0,1,0,0],
    shaker:  [0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,0,1],
    guitar:  [1,0,0,0, 0,0,1,0, 1,0,0,0, 0,0,1,0],
    trumpet: [0,0,1,0, 0,0,0,0, 0,0,1,0, 0,0,0,0],
    piano:   [1,0,0,0, 0,0,1,0, 1,0,0,0, 0,0,1,0],
    synth:   [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    sax:     [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    flute:   [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    bass:    [1,0,0,0, 0,0,1,0, 1,0,0,0, 0,0,1,0],
  },
  lofi: {
    kick:    [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
    snare:   [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    hihat:   [1,0,1,0, 1,0,1,0, 1,0,1,1, 1,0,1,0],
    '808':   [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    clap:    [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    tom:     [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    crash:   [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    cowbell: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    cymbal:  [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    bongo:   [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    shaker:  [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
    guitar:  [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
    trumpet: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    piano:   [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
    synth:   [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    sax:     [0,0,1,0, 0,0,0,0, 0,0,1,0, 0,0,0,0],
    flute:   [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    bass:    [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
  },
  house: {
    kick:    [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
    snare:   [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    hihat:   [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
    '808':   [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    clap:    [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    tom:     [0,0,0,0, 0,1,0,0, 0,0,0,0, 0,1,0,0],
    crash:   [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    cowbell: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    cymbal:  [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    bongo:   [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
    shaker:  [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
    guitar:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    trumpet: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    piano:   [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
    synth:   [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
    sax:     [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    flute:   [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    bass:    [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
  },
  techno: {
    kick:    [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
    snare:   [0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
    hihat:   [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
    '808':   [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,1,0],
    clap:    [0,0,0,0, 1,0,0,1, 0,0,0,0, 1,0,0,1],
    tom:     [0,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,1,0],
    crash:   [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    cowbell: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    cymbal:  [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
    bongo:   [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    shaker:  [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
    guitar:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    trumpet: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    piano:   [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    synth:   [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
    sax:     [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    flute:   [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    bass:    [0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,0,1],
  },
  reggaeton: {
    kick:    [1,0,0,0, 0,0,1,0, 0,0,0,0, 1,0,0,0],
    snare:   [0,0,0,1, 0,0,0,0, 0,0,0,1, 0,0,0,0],
    hihat:   [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
    '808':   [1,0,0,0, 0,0,1,0, 0,0,0,0, 1,0,0,0],
    clap:    [0,0,0,1, 0,0,0,0, 0,0,0,1, 0,0,0,0],
    tom:     [0,0,0,0, 0,1,0,0, 0,0,0,0, 0,1,0,0],
    crash:   [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    cowbell: [0,0,1,0, 0,0,0,0, 0,0,1,0, 0,0,0,0],
    cymbal:  [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    bongo:   [0,1,0,0, 0,0,0,1, 0,1,0,0, 0,0,0,1],
    shaker:  [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
    guitar:  [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
    trumpet: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    piano:   [1,0,0,0, 0,0,1,0, 0,0,0,0, 1,0,0,0],
    synth:   [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    sax:     [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    flute:   [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    bass:    [1,0,0,0, 0,0,1,0, 0,0,0,0, 1,0,0,0],
  },
  rock: {
    kick:    [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
    snare:   [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    hihat:   [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
    '808':   [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    clap:    [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    tom:     [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,1,1,0],
    crash:   [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    cowbell: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    cymbal:  [1,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0],
    bongo:   [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    shaker:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    guitar:  [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
    trumpet: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    piano:   [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
    synth:   [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    sax:     [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    flute:   [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    bass:    [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
  },
  pop: {
    kick:    [1,0,0,0, 0,0,1,0, 1,0,0,0, 0,0,1,0],
    snare:   [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    hihat:   [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
    '808':   [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    clap:    [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    tom:     [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    crash:   [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    cowbell: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    cymbal:  [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    bongo:   [0,0,1,0, 0,0,0,0, 0,0,1,0, 0,0,0,0],
    shaker:  [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
    guitar:  [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
    trumpet: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    piano:   [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
    synth:   [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
    sax:     [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    flute:   [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    bass:    [1,0,0,0, 0,0,1,0, 1,0,0,0, 0,0,1,0],
  },
  synthwave: {
    kick:    [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
    snare:   [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    hihat:   [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
    '808':   [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
    clap:    [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    tom:     [0,0,0,1, 0,0,1,0, 0,1,0,0, 1,0,0,0],
    crash:   [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    cowbell: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    cymbal:  [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    bongo:   [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    shaker:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    guitar:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    trumpet: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    piano:   [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
    synth:   [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
    sax:     [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    flute:   [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    bass:    [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
  },
  drill: {
    kick:    [1,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0],
    snare:   [0,0,0,0, 0,1,0,0, 0,0,0,0, 0,1,0,0],
    hihat:   [1,1,0,1, 1,0,1,1, 1,1,0,1, 1,0,1,1],
    '808':   [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
    clap:    [0,0,0,0, 0,1,0,0, 0,0,0,0, 0,1,0,0],
    tom:     [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    crash:   [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    cowbell: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    cymbal:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    bongo:   [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    shaker:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    guitar:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    trumpet: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    piano:   [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    synth:   [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    sax:     [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    flute:   [0,0,0,1, 0,0,1,0, 0,0,0,1, 0,0,1,0],
    bass:    [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
  },
  phonk: {
    kick:    [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
    snare:   [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    hihat:   [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
    cowbell: [1,0,1,1, 0,1,0,1, 1,0,1,0, 0,1,1,0],
    '808':   [1,0,1,0, 0,0,0,0, 1,0,1,0, 0,0,0,0],
    bell:    [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
  },
  afrobeat: {
    kick:    [1,0,0,0, 0,0,1,0, 0,0,1,0, 0,0,0,0],
    snare:   [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    hihat:   [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
    bongo:   [0,0,1,0, 0,1,0,0, 1,0,0,1, 0,0,1,0],
    clave:   [1,0,0,1, 0,0,1,0, 0,0,1,0, 0,1,0,0],
    shaker:  [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
  },
  'baile-funk': {
    kick:    [1,0,0,1, 0,0,1,0, 0,0,1,0, 0,0,1,0],
    snare:   [0,0,1,0, 1,0,0,1, 0,0,1,0, 1,0,0,1],
    vocal:   [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
    clap:    [0,0,0,1, 0,0,1,0, 0,0,1,0, 0,0,1,0],
  },
  cyberpunk: {
    kick:    [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
    bass:    [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
    synth:   [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
    lead:    [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
    hihat:   [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
  },
  jazz: {
    kick:    [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,1,0],
    cymbal:  [1,0,1,1, 1,0,1,1, 1,0,1,1, 1,0,1,1],
    piano:   [0,0,1,0, 0,0,0,0, 0,0,1,0, 0,0,0,0],
    sax:     [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    bass:    [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
  },
  disco: {
    kick:    [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
    snare:   [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    hihat:   [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
    guitar:  [0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,0,1],
    synth:   [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
    cowbell: [0,0,1,0, 0,0,0,1, 0,0,1,0, 1,0,0,0],
  }
};

function synthesizeKick(ctx: OfflineAudioContext, dest: AudioNode, time: number, velocity: number = 1) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(dest);
  
  osc.frequency.setValueAtTime(160 * velocity, time);
  osc.frequency.exponentialRampToValueAtTime(40, time + 0.12);
  
  gain.gain.setValueAtTime(0.7 * velocity, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
  
  osc.start(time);
  osc.stop(time + 0.3);
}

function synthesizeSnare(ctx: OfflineAudioContext, dest: AudioNode, time: number, velocity: number = 1) {
  const bufferSize = ctx.sampleRate * 0.15;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    noiseData[i] = (Math.random() * 2 - 1) * 0.6;
  }
  
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  const noiseGain = ctx.createGain();
  noise.connect(noiseGain);
  noiseGain.connect(dest);
  
  noiseGain.gain.setValueAtTime(0.6 * velocity, time);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
  
  noise.start(time);
  noise.stop(time + 0.15);
  
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.connect(oscGain);
  oscGain.connect(dest);
  
  osc.frequency.setValueAtTime(250, time);
  osc.frequency.exponentialRampToValueAtTime(100, time + 0.05);
  
  oscGain.gain.setValueAtTime(0.5 * velocity, time);
  oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
  
  osc.start(time);
  osc.stop(time + 0.1);
}

function synthesizeHihat(ctx: OfflineAudioContext, dest: AudioNode, time: number, velocity: number = 0.5) {
  const bufferSize = ctx.sampleRate * 0.05;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.4;
  }
  
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  
  const bandpass = ctx.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.value = 8500;
  bandpass.Q.value = 1.5;
  
  const gain = ctx.createGain();
  source.connect(bandpass);
  bandpass.connect(gain);
  gain.connect(dest);
  
  gain.gain.setValueAtTime(0.5 * velocity, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
  
  source.start(time);
  source.stop(time + 0.05);
}

function synthesize808(ctx: OfflineAudioContext, dest: AudioNode, time: number, velocity: number = 1) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(55 * velocity, time);
  osc.frequency.exponentialRampToValueAtTime(30, time + 0.4);
  
  gain.gain.setValueAtTime(0.6 * velocity, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.8);
  
  const distortion = ctx.createWaveShaper();
  const curve = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    const x = (i * 2) / 256 - 1;
    curve[i] = Math.tanh(x * 1.5) * 0.8;
  }
  distortion.curve = curve;
  
  gain.disconnect();
  gain.connect(distortion);
  distortion.connect(dest);
  
  osc.start(time);
  osc.stop(time + 0.8);
}

function synthesizeClap(ctx: OfflineAudioContext, dest: AudioNode, time: number, velocity: number = 1) {
  for (let j = 0; j < 3; j++) {
    const t = time + j * 0.012;
    const bufferSize = ctx.sampleRate * 0.04;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }
    
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 2500;
    bandpass.Q.value = 1.2;
    
    const gain = ctx.createGain();
    source.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(dest);
    
    gain.gain.setValueAtTime(0.5 * velocity, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    
    source.start(t);
    source.stop(t + 0.1);
  }
}

function synthesizeTom(ctx: OfflineAudioContext, dest: AudioNode, time: number, velocity: number = 1) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(dest);
  
  osc.frequency.setValueAtTime(130 * velocity, time);
  osc.frequency.exponentialRampToValueAtTime(60, time + 0.2);
  
  gain.gain.setValueAtTime(0.8 * velocity, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
  
  osc.start(time);
  osc.stop(time + 0.3);
}

function synthesizeCrash(ctx: OfflineAudioContext, dest: AudioNode, time: number, velocity: number = 1) {
  const bufferSize = ctx.sampleRate * 2.5; 
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.4));
  }
  
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  
  const highpass = ctx.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.value = 5000;
  
  const gain = ctx.createGain();
  source.connect(highpass);
  highpass.connect(gain);
  gain.connect(dest);
  
  gain.gain.setValueAtTime(0.4 * velocity, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 2.0);
  
  source.start(time);
  source.stop(time + 2.0);
}

function synthesizeCowbell(ctx: OfflineAudioContext, dest: AudioNode, time: number, velocity: number = 1) {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc1.type = 'square';
  osc2.type = 'square';
  
  osc1.frequency.setValueAtTime(800, time);
  osc2.frequency.setValueAtTime(540, time);
  
  osc1.connect(gain);
  osc2.connect(gain);
  
  const bandpass = ctx.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.value = 1000;
  
  gain.connect(bandpass);
  bandpass.connect(dest);
  
  gain.gain.setValueAtTime(0.6 * velocity, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
  
  osc1.start(time);
  osc2.start(time);
  osc1.stop(time + 0.25);
  osc2.stop(time + 0.25);
}

function synthesizeGuitar(ctx: OfflineAudioContext, dest: AudioNode, time: number, velocity: number = 1, seed: number = 0) {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();
  
  // Seed influences waveform for AI mode
  const waveTypes: OscillatorType[] = ['sawtooth', 'square', 'triangle'];
  osc1.type = waveTypes[(seed + 1) % 3];
  osc2.type = waveTypes[(seed + 2) % 3];
  
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.type = 'sine';
  lfo.frequency.value = 4 + (seed % 4); // 4-7 Hz vibrato 
  lfo.connect(lfoGain);
  
  const notes = [82.41, 110.00, 146.83, 196.00, 246.94, 329.63, 392.00];
  const pseudoRand = (seed + Math.floor(time * 100)) % notes.length;
  const note = notes[pseudoRand] * (seed % 2 === 0 ? 1 : 2);
  
  osc1.frequency.setValueAtTime(note, time);
  // Seed influences detune amount
  osc2.frequency.setValueAtTime(note * (1.001 + (seed % 10) * 0.001), time);
  
  lfoGain.gain.value = note * 0.015;
  lfoGain.connect(osc1.frequency);
  lfoGain.connect(osc2.frequency);
  
  osc1.connect(gain);
  osc2.connect(gain);
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1500 + (seed % 2000), time);
  filter.frequency.exponentialRampToValueAtTime(300 + (seed % 200), time + 0.8);
  
  gain.connect(filter);
  filter.connect(dest);
  
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.5 * velocity, time + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 1.5);
  
  osc1.start(time);
  osc2.start(time);
  lfo.start(time);
  osc1.stop(time + 1.5);
  osc2.stop(time + 1.5);
  lfo.stop(time + 1.5);
}

function synthesizeTrumpet(ctx: OfflineAudioContext, dest: AudioNode, time: number, velocity: number = 1) {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc1.type = 'sawtooth';
  osc2.type = 'square';
  
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.type = 'sine';
  lfo.frequency.value = 6;
  lfo.connect(lfoGain);
  
  const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];
  const note = notes[Math.floor(Math.random() * notes.length)];
  
  osc1.frequency.setValueAtTime(note, time);
  osc2.frequency.setValueAtTime(note * 1.01, time);
  
  lfoGain.gain.value = note * 0.02;
  lfoGain.connect(osc1.frequency);
  lfoGain.connect(osc2.frequency);
  
  osc1.connect(gain);
  osc2.connect(gain);
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  
  filter.frequency.setValueAtTime(500, time);
  filter.frequency.linearRampToValueAtTime(3500, time + 0.08);
  filter.frequency.exponentialRampToValueAtTime(1000, time + 0.4);
  
  gain.connect(filter);
  filter.connect(dest);
  
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.4 * velocity, time + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.6);
  
  osc1.start(time);
  osc2.start(time);
  lfo.start(time);
  osc1.stop(time + 0.6);
  osc2.stop(time + 0.6);
  lfo.stop(time + 0.6);
}

function synthesizeCymbal(ctx: OfflineAudioContext, dest: AudioNode, time: number, velocity: number = 1) {
  const bufferSize = ctx.sampleRate * 1.5; 
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.3));
  }
  
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  
  const highpass = ctx.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.value = 6000;
  
  const gain = ctx.createGain();
  source.connect(highpass);
  highpass.connect(gain);
  gain.connect(dest);
  
  gain.gain.setValueAtTime(0.5 * velocity, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 1.2);
  
  source.start(time);
  source.stop(time + 1.2);
}

function synthesizeBongo(ctx: OfflineAudioContext, dest: AudioNode, time: number, velocity: number = 1) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(dest);
  
  osc.frequency.setValueAtTime(250 * velocity, time);
  osc.frequency.exponentialRampToValueAtTime(150, time + 0.1);
  
  gain.gain.setValueAtTime(0.9 * velocity, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
  
  osc.start(time);
  osc.stop(time + 0.15);
}

function synthesizeShaker(ctx: OfflineAudioContext, dest: AudioNode, time: number, velocity: number = 1) {
  const bufferSize = ctx.sampleRate * 0.1;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.5;
  }
  
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  
  const bandpass = ctx.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.value = 6000;
  bandpass.Q.value = 1;
  
  const gain = ctx.createGain();
  source.connect(bandpass);
  bandpass.connect(gain);
  gain.connect(dest);
  
  gain.gain.setValueAtTime(0.4 * velocity, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
  
  source.start(time);
  source.stop(time + 0.1);
}

function synthesizePiano(ctx: OfflineAudioContext, dest: AudioNode, time: number, velocity: number = 1, seed: number = 0) {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const osc3 = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc1.type = 'triangle';
  osc2.type = 'sine';
  osc3.type = 'sawtooth';
  
  const chords = [
    [261.63, 329.63, 392.00], // C major
    [440.00, 523.25, 659.25], // A minor
    [349.23, 440.00, 523.25], // F major
    [392.00, 493.88, 587.33]  // G major
  ];
  const pseudoRand = (seed + Math.floor(time * 10)) % chords.length;
  const chord = chords[pseudoRand];
  
  const chordGain = ctx.createGain();
  chordGain.gain.value = 0.3;
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1000 + (seed % 1000), time); // Brighter piano with higher seed
  filter.frequency.exponentialRampToValueAtTime(200, time + 1.0);
  
  gain.connect(filter);
  filter.connect(dest);
  
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.5 * velocity, time + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 1.5);
  chord.forEach(note => {
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(note, time);
    osc.connect(gain);
    osc.start(time);
    osc.stop(time + 1.5);
  });
}

function synthesizeSynth(ctx: OfflineAudioContext, dest: AudioNode, time: number, velocity: number = 1, seed: number = 0) {
  const gain = ctx.createGain();
  
  const chords = [
    [293.66, 349.23, 440.00], // D minor
    [261.63, 329.63, 392.00], // C major
    [329.63, 392.00, 493.88], // E minor
  ];
  const pseudoRand = (seed + Math.floor(time * 15)) % chords.length;
  const chord = chords[pseudoRand];
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  // Filter sweep heavily tied to prompt seed for unique sound character
  const cutoffStart = 800 + (seed % 4000); 
  filter.frequency.setValueAtTime(cutoffStart, time);
  filter.frequency.exponentialRampToValueAtTime(cutoffStart * (1 + (seed % 3)), time + 0.2);
  filter.frequency.exponentialRampToValueAtTime(400, time + 1.0);
  
  gain.connect(filter);
  filter.connect(dest);
  
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.4 * velocity, time + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 1.0);
  
  const waves: OscillatorType[] = ['sawtooth', 'square', 'triangle', 'sine'];
  
  chord.forEach(note => {
    const osc = ctx.createOscillator();
    osc.type = waves[(seed + 3) % 4];
    osc.frequency.setValueAtTime(note, time);
    osc.connect(gain);
    osc.start(time);
    osc.stop(time + 1.0);
  });
}

function synthesizeSax(ctx: OfflineAudioContext, dest: AudioNode, time: number, velocity: number = 1) {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc1.type = 'sawtooth';
  osc2.type = 'square';
  
  const notes = [293.66, 349.23, 440.00, 523.25]; // D minor pentatonic
  const note = notes[Math.floor(Math.random() * notes.length)];
  
  osc1.frequency.setValueAtTime(note, time);
  osc2.frequency.setValueAtTime(note * 1.01, time);
  
  // Vibrato
  const vOsc = ctx.createOscillator();
  const vGain = ctx.createGain();
  vOsc.frequency.value = 5.5;
  vGain.gain.value = note * 0.01;
  vOsc.connect(vGain);
  vGain.connect(osc1.frequency);
  vGain.connect(osc2.frequency);
  vOsc.start(time);
  vOsc.stop(time + 0.8);

  osc1.connect(gain);
  osc2.connect(gain);
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(800, time);
  filter.frequency.exponentialRampToValueAtTime(1400, time + 0.15);
  filter.frequency.exponentialRampToValueAtTime(900, time + 0.6);
  
  gain.connect(filter);
  filter.connect(dest);
  
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.4 * velocity, time + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.8);
  
  osc1.start(time);
  osc2.start(time);
  osc1.stop(time + 0.8);
  osc2.stop(time + 0.8);
}

function synthesizeFlute(ctx: OfflineAudioContext, dest: AudioNode, time: number, velocity: number = 1) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'sine';
  
  const notes = [523.25, 659.25, 783.99, 1046.50]; 
  const note = notes[Math.floor(Math.random() * notes.length)];
  
  osc.frequency.setValueAtTime(note * 0.95, time);
  osc.frequency.linearRampToValueAtTime(note, time + 0.05);
  
  osc.connect(gain);
  gain.connect(dest);
  
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.5 * velocity, time + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 1.0);
  
  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 1.0, ctx.sampleRate);
  for (let i = 0; i < noiseBuffer.length; i++) {
    noiseBuffer.getChannelData(0)[i] = (Math.random() * 2 - 1) * 0.1;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.value = 6000;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0, time);
  noiseGain.gain.linearRampToValueAtTime(0.15 * velocity, time + 0.1);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 1.0);
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(dest);
  
  osc.start(time);
  noise.start(time);
  osc.stop(time + 1.0);
  noise.stop(time + 1.0);
}

function synthesizeBass(ctx: OfflineAudioContext, dest: AudioNode, time: number, velocity: number = 1, seed: number = 0) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  const waves: OscillatorType[] = ['sawtooth', 'square', 'triangle', 'sine'];
  osc.type = waves[(seed + 5) % 4]; // Prompts will generate completely different basses (sub, saw, square)
  
  const notes = [41.20, 55.00, 65.41, 73.42]; // E1, A1, C2, D2
  // Make melodic jumps more stable based on time+seed instead of pure random
  const noteIndex = Math.floor(((time * 10) + seed) % notes.length);
  const note = notes[noteIndex];
  
  osc.frequency.setValueAtTime(note, time);
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(400 + (seed % 800), time); // Brightness changes per prompt
  filter.frequency.exponentialRampToValueAtTime(100, time + 0.3);
  
  osc.connect(gain);
  gain.connect(filter);
  filter.connect(dest);
  
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.5 * velocity, time + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.6);
  
  osc.start(time);
  osc.stop(time + 0.6);
}

function synthesizeStrings(ctx: OfflineAudioContext, dest: AudioNode, time: number, velocity: number = 1, seed: number = 0) {
  // Ensemble of 3 oscillators for richer sound
  const oscs = [ctx.createOscillator(), ctx.createOscillator(), ctx.createOscillator()];
  const gain = ctx.createGain();
  
  const waves: OscillatorType[] = ['sawtooth', 'triangle'];
  const wave = waves[seed % 2];
  
  const chords = [
    [261.63, 329.63, 392.00, 523.25], // C major add9
    [349.23, 440.00, 523.25, 698.46], // F major
    [440.00, 523.25, 659.25, 880.00], // A minor
    [293.66, 349.23, 440.00, 587.33]  // D minor
  ];
  const pseudoRand = (seed + Math.floor(time * 5)) % chords.length;
  const noteBase = chords[pseudoRand][Math.floor(time * 10) % 4];
  
  oscs.forEach((osc, i) => {
    osc.type = wave;
    osc.frequency.setValueAtTime(noteBase * (1 + (i - 1) * 0.006), time); // Detuned ensemble
    osc.connect(gain);
    osc.start(time);
    osc.stop(time + 2.5);
  });
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(800 + (seed % 600), time);
  filter.frequency.linearRampToValueAtTime(1800 + (seed % 1000), time + 0.8);
  filter.frequency.exponentialRampToValueAtTime(600 + (seed % 400), time + 2.5);
  
  // High pass to keep it "airy"
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 300;

  gain.connect(hp);
  hp.connect(filter);
  filter.connect(dest);
  
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.3 * velocity, time + 0.4); // Slower attack
  gain.gain.exponentialRampToValueAtTime(0.001, time + 2.5);
}

function synthesizeVocal(ctx: OfflineAudioContext, dest: AudioNode, time: number, velocity: number = 1, seed: number = 0) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'sawtooth';
  
  const notes = [440.00, 523.25, 659.25, 880.00]; 
  const pseudoRand = (seed + Math.floor(time * 12)) % notes.length;
  const note = notes[pseudoRand];
  
  osc.frequency.setValueAtTime(note, time);
  // Portamento effect changes with seed
  osc.frequency.exponentialRampToValueAtTime(note * (1.1 + (seed % 5) * 0.05), time + 0.1);
  osc.frequency.exponentialRampToValueAtTime(note, time + 0.2);
  
  const formant1 = ctx.createBiquadFilter();
  formant1.type = 'bandpass';
  formant1.frequency.value = 600 + (seed % 300); // Changes vowel sound 'Ah' to 'Oh'
  formant1.Q.value = 5 + (seed % 3);
  
  const formant2 = ctx.createBiquadFilter();
  formant2.type = 'bandpass';
  formant2.frequency.value = 1000 + (seed % 500); // second formant
  formant2.Q.value = 5 + (seed % 3);
  
  osc.connect(gain);
  gain.connect(formant1);
  gain.connect(formant2);
  
  formant1.connect(dest);
  formant2.connect(dest);
  
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.6 * velocity, time + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
  
  osc.start(time);
  osc.stop(time + 0.5);
}

function synthesizeMarimba(ctx: OfflineAudioContext, dest: AudioNode, time: number, velocity: number = 1) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'sine';
  
  const notes = [392.00, 440.00, 523.25, 587.33, 659.25]; // G pentatonic
  const note = notes[Math.floor(Math.random() * notes.length)];
  
  osc.frequency.setValueAtTime(note, time);
  
  osc.connect(gain);
  gain.connect(dest);
  
  // Fast attack, fast decay
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.7 * velocity, time + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
  
  osc.start(time);
  osc.stop(time + 0.3);
}

function synthesizeBell(ctx: OfflineAudioContext, dest: AudioNode, time: number, velocity: number = 1) {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();
  osc1.type = 'sine';
  osc2.type = 'sine';
  const freq = 1200 + Math.random() * 400;
  osc1.frequency.value = freq;
  osc2.frequency.value = freq * 1.501; // Harmonic chime
  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(dest);
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.4 * velocity, time + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 1.2);
  osc1.start(time);
  osc2.start(time);
  osc1.stop(time + 1.2);
  osc2.stop(time + 1.2);
}

function synthesizePad(ctx: OfflineAudioContext, dest: AudioNode, time: number, velocity: number = 1, seed: number = 0) {
  const oscs = [ctx.createOscillator(), ctx.createOscillator()];
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 800 + (seed % 400);
  filter.Q.value = 1;
  const note = 261.63 * (1 + (seed % 2));
  oscs.forEach((osc, i) => {
    osc.type = i === 0 ? 'sawtooth' : 'triangle';
    osc.frequency.value = note * (1 + (i === 0 ? 0.002 : -0.002));
    osc.connect(gain);
    osc.start(time);
    osc.stop(time + 3.0);
  });
  gain.connect(filter);
  filter.connect(dest);
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.25 * velocity, time + 1.5); // Very slow attack
  gain.gain.linearRampToValueAtTime(0, time + 3.0);
}

function synthesizeLead(ctx: OfflineAudioContext, dest: AudioNode, time: number, velocity: number = 1, seed: number = 0) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = (seed % 2 === 0) ? 'sawtooth' : 'square';
  const notes = [440, 523.25, 587.33, 659.25, 783.99];
  osc.frequency.value = notes[seed % notes.length];
  osc.connect(gain);
  gain.connect(dest);
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.4 * velocity, time + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
  osc.start(time);
  osc.stop(time + 0.4);
}

function synthesizePluck(ctx: OfflineAudioContext, dest: AudioNode, time: number, velocity: number = 1) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.value = 440 + Math.random() * 440;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2000, time);
  filter.frequency.exponentialRampToValueAtTime(200, time + 0.1);
  osc.connect(gain);
  gain.connect(filter);
  filter.connect(dest);
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.6 * velocity, time + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
  osc.start(time);
  osc.stop(time + 0.2);
}

function synthesizeOrgan(ctx: OfflineAudioContext, dest: AudioNode, time: number, velocity: number = 1) {
  const freqs = [261.63, 523.25, 783.99, 1046.50];
  const gain = ctx.createGain();
  freqs.forEach(f => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = f;
    osc.connect(gain);
    osc.start(time);
    osc.stop(time + 0.8);
  });
  gain.connect(dest);
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.3 * velocity, time + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.8);
}

function synthesizeKalimba(ctx: OfflineAudioContext, dest: AudioNode, time: number, velocity: number = 1) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = 1000 + Math.random() * 1000;
  osc.connect(gain);
  gain.connect(dest);
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.5 * velocity, time + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
  osc.start(time);
  osc.stop(time + 0.2);
}

function synthesizeClave(ctx: OfflineAudioContext, dest: AudioNode, time: number, velocity: number = 1) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.value = 2500;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 2500;
  filter.Q.value = 10;
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  gain.gain.setValueAtTime(0.6 * velocity, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
  osc.start(time);
  osc.stop(time + 0.03);
}

function synthesizeWoodblock(ctx: OfflineAudioContext, dest: AudioNode, time: number, velocity: number = 1) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = 800;
  osc.connect(gain);
  gain.connect(dest);
  gain.gain.setValueAtTime(0.8 * velocity, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
  osc.start(time);
  osc.stop(time + 0.05);
}

function synthesizeVinyl(ctx: OfflineAudioContext, dest: AudioNode, time: number, velocity: number = 1) {
  const bufferSize = ctx.sampleRate * 1.0;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.02 * (Math.random() > 0.99 ? 5 : 1);
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const gain = ctx.createGain();
  source.connect(gain);
  gain.connect(dest);
  gain.gain.value = 0.1 * velocity;
  source.start(time);
  source.stop(time + 1.0);
}

function synthesizeRiser(ctx: OfflineAudioContext, dest: AudioNode, time: number, velocity: number = 1) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(100, time);
  osc.frequency.exponentialRampToValueAtTime(2000, time + 2.0);
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(200, time);
  filter.frequency.exponentialRampToValueAtTime(5000, time + 2.0);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.3 * velocity, time + 1.8);
  gain.gain.linearRampToValueAtTime(0, time + 2.0);
  osc.start(time);
  osc.stop(time + 2.0);
}

function synthesizeTriangle(ctx: OfflineAudioContext, dest: AudioNode, time: number, velocity: number = 1) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(4000, time); // High frequency chime
  
  osc.connect(gain);
  gain.connect(dest);
  
  // Very fast attack, very long decay
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.5 * velocity, time + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 2.5);
  
  osc.start(time);
  osc.stop(time + 2.5);
}

const synthMap: Record<string, (ctx: OfflineAudioContext, dest: AudioNode, time: number, velocity?: number, seed?: number) => void> = {
  kick: synthesizeKick,
  snare: synthesizeSnare,
  hihat: synthesizeHihat,
  '808': synthesize808,
  clap: synthesizeClap,
  tom: synthesizeTom,
  crash: synthesizeCrash,
  cowbell: synthesizeCowbell,
  cymbal: synthesizeCymbal,
  bongo: synthesizeBongo,
  shaker: synthesizeShaker,
  guitar: synthesizeGuitar,
  trumpet: synthesizeTrumpet,
  piano: synthesizePiano,
  synth: synthesizeSynth,
  sax: synthesizeSax,
  flute: synthesizeFlute,
  bass: synthesizeBass,
  strings: synthesizeStrings,
  vocal: synthesizeVocal,
  marimba: synthesizeMarimba,
  triangle: synthesizeTriangle,
  bell: synthesizeBell,
  pad: synthesizePad,
  lead: synthesizeLead,
  pluck: synthesizePluck,
  organ: synthesizeOrgan,
  kalimba: synthesizeKalimba,
  clave: synthesizeClave,
  woodblock: synthesizeWoodblock,
  vinyl: synthesizeVinyl,
  riser: synthesizeRiser,
};

function addVariation(pattern: number[], complexity: number, mood: string): number[] {
  const result = [...pattern];
  if (complexity > 5) {
    for (let i = 0; i < result.length; i++) {
      if (result[i] === 0 && Math.random() < (complexity - 5) * 0.05) {
        result[i] = 0.4; 
      }
    }
  }
  if (mood === 'dark' || mood === 'aggressive') {
    for (let i = 0; i < result.length; i++) {
      if (result[i] === 0 && Math.random() < 0.08) {
        result[i] = 0.6;
      }
    }
  }
  return result;
}

export async function generateBeat(params: BeatParams): Promise<AudioBuffer> {
  const { genre, bpm, instruments, bars, complexity, mood, isAi } = params;
  const stepDuration = 60 / bpm / 4; 
  const stepsPerBar = 16;
  const totalSteps = stepsPerBar * bars;
  const totalDuration = totalSteps * stepDuration + 2; // +2 for reverb tail

  const sampleRate = 44100;
  const ctx = new OfflineAudioContext(2, sampleRate * totalDuration, sampleRate);

  // Master FX Chain for "Professional Sound"
  const masterInput = ctx.createGain();
  masterInput.gain.value = 0.5; // Final safety headroom

  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -22;
  compressor.knee.value = 10;
  compressor.ratio.value = 5;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.2;

  // Professional Limiter Node
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.setValueAtTime(-1.0, ctx.currentTime);
  limiter.knee.setValueAtTime(0, ctx.currentTime);
  limiter.ratio.setValueAtTime(20, ctx.currentTime);
  limiter.attack.setValueAtTime(0, ctx.currentTime);
  limiter.release.setValueAtTime(0.1, ctx.currentTime);

  // Simple Reverb node (Convolver)
  const convolver = ctx.createConvolver();
  const irLen = sampleRate * 1.5; 
  const irBuffer = ctx.createBuffer(2, irLen, sampleRate);
  for (let c = 0; c < 2; c++) {
    const channel = irBuffer.getChannelData(c);
    for (let i = 0; i < irLen; i++) {
       // Exponential decay noise
       channel[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / irLen, 3);
    }
  }
  convolver.buffer = irBuffer;

  // Dry/Wet mix for reverb
  const masterDry = ctx.createGain();
  const masterWet = ctx.createGain();
  masterDry.gain.value = 0.90; 
  masterWet.gain.value = 0.08; // Less mud

  masterInput.connect(masterDry);
  masterInput.connect(convolver);
  convolver.connect(masterWet);
  
  // Final Mastering EQ
  const masterEq = ctx.createBiquadFilter();
  masterEq.type = 'highshelf';
  masterEq.frequency.value = 6000;
  masterEq.gain.value = 1.0;

  const lowCut = ctx.createBiquadFilter();
  lowCut.type = 'highpass';
  lowCut.frequency.value = 45; // Aggressive clean up

  masterDry.connect(lowCut);
  masterWet.connect(lowCut);
  lowCut.connect(masterEq);
  masterEq.connect(compressor);
  compressor.connect(limiter);
  limiter.connect(ctx.destination);

  const basePattern = PATTERNS[genre] || PATTERNS['trap'];

  for (let step = 0; step < totalSteps; step++) {
    const time = step * stepDuration;
    const patternStep = step % stepsPerBar;

    for (const inst of instruments) {
      let baseInstPattern = basePattern[inst];
      if (!baseInstPattern) {
         if (['piano', 'synth', 'guitar', 'strings', 'vocal', 'pad', 'organ', 'lead'].includes(inst)) {
             baseInstPattern = [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0]; // Basic chord/stab hit
         } else if (['bass', 'marimba', 'kalimba', 'pluck'].includes(inst)) {
             baseInstPattern = [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0]; // Basic rhythmic line
         } else if (['hihat', 'shaker', 'triangle', 'clave', 'woodblock', 'bell'].includes(inst)) {
             baseInstPattern = [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0]; // Basic perc
         } else if (inst === 'vinyl') {
             baseInstPattern = [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0];
         } else {
             baseInstPattern = [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0]; 
         }
      }
      
      let pattern = baseInstPattern;
      // Procedural generation for AI
      if (isAi && ['piano', 'synth', 'guitar', 'bass', 'flute', 'sax', 'trumpet', 'strings', 'vocal', 'marimba', 'pad', 'lead', 'pluck', 'organ', 'kalimba'].includes(inst)) {
         pattern = Array(16).fill(0).map((_, i) => {
           return (i % 8 === 0 || Math.random() < complexity * 0.05) ? 1 : 0;
         });
      } else if (isAi && ['hihat', 'shaker', 'bongo', 'triangle', 'clave', 'woodblock', 'bell'].includes(inst)) {
          pattern = Array(16).fill(0).map(() => Math.random() > 0.6 ? 1 : 0);
      }

        pattern = addVariation(pattern, complexity, mood);
        const velocity = pattern[patternStep];
        if (velocity > 0 && synthMap[inst]) {
          synthMap[inst](ctx, masterInput, time, velocity, (params.seed || 0) + inst.length); 
        }
      }
    }

  return ctx.startRendering();
}

export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const length = buffer.length * numChannels * 2;
  const arrayBuffer = new ArrayBuffer(44 + length);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, length, true);

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

// Genre labels
export const GENRES = [
  { value: 'trap', label: '🔥 Trap' },
  { value: 'hip-hop', label: '🎤 Hip-Hop' },
  { value: 'lofi', label: '🌧️ Lo-Fi' },
  { value: 'phonk', label: '💨 Phonk' },
  { value: 'afrobeat', label: '🌍 Afrobeat' },
  { value: 'baile-funk', label: '💃 Baile Funk' },
  { value: 'drill', label: '🔪 Drill' },
  { value: 'cyberpunk', label: '🦾 Cyberpunk' },
  { value: 'house', label: '🏠 House' },
  { value: 'techno', label: '⚡ Techno' },
  { value: 'reggaeton', label: '🌴 Reggaeton' },
  { value: 'disco', label: '🕺 Disco' },
  { value: 'jazz', label: '🎷 Jazz' },
  { value: 'rock', label: '🎸 Rock' },
  { value: 'pop', label: '⭐ Pop' },
  { value: 'synthwave', label: '🌆 Synthwave' },
];

export const MOODS = [
  { value: 'dark', label: '🌑 Dark' },
  { value: 'chill', label: '😌 Chill' },
  { value: 'energetic', label: '⚡ Energetic' },
  { value: 'aggressive', label: '🔥 Aggressive' },
  { value: 'dreamy', label: '☁️ Dreamy' },
  { value: 'nostalgic', label: '📼 Nostalgic' },
];

export const INSTRUMENTS = [
  { value: 'kick', label: '🥁 Kick' },
  { value: 'snare', label: '🪘 Snare' },
  { value: 'hihat', label: '🎩 Hi-Hat' },
  { value: '808', label: '🔊 808 Bass' },
  { value: 'clap', label: '👏 Clap' },
  { value: 'tom', label: '🛢️ Tom' },
  { value: 'crash', label: '💥 Crash' },
  { value: 'cowbell', label: '🔔 Cowbell' },
  { value: 'cymbal', label: '📀 Cymbal' },
  { value: 'bongo', label: '🪘 Bongo' },
  { value: 'shaker', label: '🧂 Shaker' },
  { value: 'guitar', label: '🎸 Guitar' },
  { value: 'trumpet', label: '🎺 Trumpet' },
  { value: 'piano', label: '🎹 Piano' },
  { value: 'synth', label: '🎛️ Synth' },
  { value: 'lead', label: '⚡ Lead' },
  { value: 'pad', label: '☁️ Pad' },
  { value: 'pluck', label: '✨ Pluck' },
  { value: 'strings', label: '🎻 Strings' },
  { value: 'sax', label: '🎷 Sax' },
  { value: 'flute', label: '🎵 Flute' },
  { value: 'organ', label: '🎹 Organ' },
  { value: 'bell', label: '🔔 Bell' },
  { value: 'marimba', label: '🪘 Marimba' },
  { value: 'kalimba', label: '💎 Kalimba' },
  { value: 'clave', label: '🥖 Clave' },
  { value: 'woodblock', label: '🪵 Wood' },
  { value: 'triangle', label: '🔺 Triangle' },
  { value: 'vocal', label: '🗣️ Vocal/Vox' },
  { value: 'vinyl', label: '📻 Vinyl FX' },
  { value: 'riser', label: '📈 Riser FX' },
];
