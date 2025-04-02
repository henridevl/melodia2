import { Profile, getUserProfile } from '../services/supabase';

export const getUserInitials = async (userId: string): Promise<string> => {
  const profile = await getUserProfile(userId);
  if (profile) {
    const { first_name, last_name } = profile;
    return `${first_name.charAt(0).toUpperCase()}${last_name
      .charAt(0)
      .toUpperCase()}`;
  }
  return 'U';
};

export const getUserProfile = async (userId: string): Promise<Profile | null> => {
  // Implémentez la logique pour récupérer le profil de l'utilisateur depuis Supabase
  // Par exemple, utilisez Supabase client pour récupérer les données de l'utilisateur
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
};
