// Mock data for the AI Beat Generator with localStorage persistence

export interface MockBeat {
  id: string;
  title: string;
  genre: string;
  bpm: number;
  mood: string;
  bars: number;
  createdAt: string;
  duration: string;
  instruments: string[];
  isPublic: boolean;
  likes: number;
  author: {
    id: string;
    name: string;
  };
}

export interface MockUser {
  id: string;
  email: string;
  name: string;
  bio: string;
  profilePicture: string | null;
  plan: 'free' | 'pro';
  createdAt: string;
  totalBeats: number;
}

export const mockUser: MockUser = {
  id: 'user-001',
  email: 'producer@aibeat.com',
  name: 'DJ Producer',
  bio: 'Making retro beats all day.',
  profilePicture: null,
  plan: 'pro',
  createdAt: '2025-01-15',
  totalBeats: 24,
};

const initialMockBeats: MockBeat[] = [
  {
    id: 'beat-001',
    title: 'Midnight Trap',
    genre: 'trap',
    bpm: 140,
    mood: 'dark',
    bars: 8,
    createdAt: '2026-03-15T10:00:00',
    duration: '0:28',
    instruments: ['kick', 'snare', 'hihat', '808'],
    isPublic: true,
    likes: 42,
    author: { id: 'user-001', name: 'DJ Producer' }
  },
  {
    id: 'beat-002',
    title: 'Summer Vibes',
    genre: 'reggaeton',
    bpm: 95,
    mood: 'energetic',
    bars: 8,
    createdAt: '2026-03-14T18:30:00',
    duration: '0:32',
    instruments: ['kick', 'snare', 'hihat', '808', 'clap'],
    isPublic: false,
    likes: 0,
    author: { id: 'user-001', name: 'DJ Producer' }
  },
  {
    id: 'beat-003',
    title: 'Lo-Fi Rain',
    genre: 'lofi',
    bpm: 80,
    mood: 'chill',
    bars: 16,
    createdAt: '2026-03-13T22:15:00',
    duration: '0:48',
    instruments: ['kick', 'snare', 'hihat'],
    isPublic: true,
    likes: 15,
    author: { id: 'user-001', name: 'DJ Producer' }
  },
  {
    id: 'beat-004',
    title: 'Club Banger',
    genre: 'house',
    bpm: 128,
    mood: 'energetic',
    bars: 8,
    createdAt: '2026-03-12T14:45:00',
    duration: '0:30',
    instruments: ['kick', 'snare', 'hihat', 'clap'],
    isPublic: false,
    likes: 0,
    author: { id: 'user-001', name: 'DJ Producer' }
  },
];

export function getStoredUser(): MockUser {
  if (typeof window === 'undefined') return mockUser;
  const stored = localStorage.getItem('ai_beats_user');
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem('ai_beats_user', JSON.stringify(mockUser));
  return mockUser;
}

export function saveUser(updates: Partial<MockUser>) {
  if (typeof window === 'undefined') return;
  const current = getStoredUser();
  const updated = { ...current, ...updates };
  localStorage.setItem('ai_beats_user', JSON.stringify(updated));
  return updated;
}

export function getStoredBeats(): MockBeat[] {
  if (typeof window === 'undefined') return initialMockBeats;
  const stored = localStorage.getItem('ai_beats_library');
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem('ai_beats_library', JSON.stringify(initialMockBeats));
  return initialMockBeats;
}

export function saveBeat(beat: MockBeat) {
  if (typeof window === 'undefined') return;
  const currentBeats = getStoredBeats();
  const newBeats = [beat, ...currentBeats];
  localStorage.setItem('ai_beats_library', JSON.stringify(newBeats));
}

export function updateBeat(id: string, updates: Partial<MockBeat>) {
  if (typeof window === 'undefined') return;
  const currentBeats = getStoredBeats();
  const newBeats = currentBeats.map(b => b.id === id ? { ...b, ...updates } : b);
  localStorage.setItem('ai_beats_library', JSON.stringify(newBeats));
}

export function deleteBeat(id: string) {
  if (typeof window === 'undefined') return;
  const currentBeats = getStoredBeats();
  const newBeats = currentBeats.filter(b => b.id !== id);
  localStorage.setItem('ai_beats_library', JSON.stringify(newBeats));
}

export function getStats() {
  const beats = getStoredBeats();
  return {
    totalBeats: beats.length,
    totalPlaytime: '4:22', // Mocked for now
    favoriteGenre: beats.length > 0 ? beats[0].genre.toUpperCase() : 'NONE',
    thisWeek: beats.filter(b => new Date(b.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
  };
}
