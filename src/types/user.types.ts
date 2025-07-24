import { Tables } from './supabase.types';

export type UserProfile = Tables<'profiles'>;

export interface UserWithProfile {
  id: string;
  email: string;
  username: string;
  profile: UserProfile;
}
