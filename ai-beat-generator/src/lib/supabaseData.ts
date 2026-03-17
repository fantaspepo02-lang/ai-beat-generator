import { supabase } from './supabase';

export interface Beat {
  id: string;
  user_id: string;
  title: string;
  genre: string;
  bpm: number;
  mood: string;
  bars: number;
  instruments: string[];
  audio_url: string | null;
  duration: string;
  is_public: boolean;
  likes: number;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  bio: string | null;
  profile_picture: string | null;
  plan: string;
  created_at: string;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    // If profile is missing, try to create it or just return a basic object
    const { data: newProfile } = await supabase
      .from('profiles')
      .insert([{ id: user.id, email: user.email, name: user.email?.split('@')[0] }])
      .select()
      .single();
    
    return (newProfile || { id: user.id, email: user.email, name: user.email?.split('@')[0], plan: 'free' }) as Profile;
  }

  return profile as Profile;
}

export async function updateProfile(updates: Partial<Profile>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
}

export async function getBeats(onlyPublic: boolean = false) {
  let query = supabase.from('beats').select('*').order('created_at', { ascending: false });
  
  if (onlyPublic) {
    query = query.eq('is_public', true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Beat[];
}

export async function saveBeat(beat: Omit<Beat, 'id' | 'created_at' | 'user_id' | 'likes'>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('beats')
    .insert([{ ...beat, user_id: user.id }])
    .select()
    .single();

  if (error) throw error;
  return data as Beat;
}

export async function updateBeat(id: string, updates: Partial<Beat>) {
  const { data, error } = await supabase
    .from('beats')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Beat;
}

export async function getBeatById(id: string) {
  const { data, error } = await supabase
    .from('beats')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Beat;
}

export async function deleteBeat(id: string) {
  const { error } = await supabase
    .from('beats')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getStats() {
  const { data: beats } = await supabase.from('beats').select('genre, created_at');
  
  if (!beats || beats.length === 0) {
    return { totalBeats: 0, totalPlaytime: '0:00', favoriteGenre: '-', thisWeek: 0 };
  }

  const thisWeek = beats.filter(b => new Date(b.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;
  
  // Simple favorite genre logic
  const genres = beats.map(b => b.genre);
  const favoriteGenre = genres.sort((a,b) =>
      genres.filter(v => v===a).length - genres.filter(v => v===b).length
  ).pop();

  return {
    totalBeats: beats.length,
    totalPlaytime: '4:22', // Still mocked or calculated if duration is added to schema
    favoriteGenre: favoriteGenre?.toUpperCase() || '-',
    thisWeek
  };
}
