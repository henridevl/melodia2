// utils.ts
import { Profile } from '../services/supabase';

export const getUserInitials = (profile: Profile | null) => {
  if (profile) {
    const { first_name, last_name } = profile;
    return `${first_name.charAt(0).toUpperCase()}${last_name
      .charAt(0)
      .toUpperCase()}`;
  }
  return 'U';
};
