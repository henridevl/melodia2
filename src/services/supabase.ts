import { createClient } from '@supabase/supabase-js';

// Log environment variables for debugging
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY);

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set correctly.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'melodia-auth',
    storage: localStorage,
  },
});

export type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
  updated_at: string;
};

export type Recording = {
  id: string;
  title: string;
  audio_url: string;
  duration: string;
  date: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type Note = {
  id: string;
  title: string;
  content: string;
  date: string;
  user_id: string;
  recording_id?: string;
  created_at: string;
  updated_at: string;
};

export type Share = {
  id: string;
  resource_id: string;
  resource_type: 'recording' | 'note';
  owner_id: string;
  shared_with_email: string;
  permission_level: 'view' | 'edit';
  status: 'pending' | 'accepted';
  created_at: string;
  updated_at: string;
  profiles?: {
    email: string;
  };
};

export type Feedback = {
  id: string;
  comment: string;
  user_id: string;
  note_id?: string;
  recording_id?: string;
  parent_id?: string;
  likes?: number;
  is_ok?: boolean;
  created_at: string;
  timestamp_seconds?: number;
  liked_by?: string[];
};

export type Composition = {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
  recordings?: Recording[];
  notes?: Note[];
};

export type CompositionRecording = {
  id: string;
  composition_id: string;
  recording_id: string;
  created_at: string;
};

export type CompositionNote = {
  id: string;
  composition_id: string;
  note_id: string;
  created_at: string;
};