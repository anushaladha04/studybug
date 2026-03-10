import { Session } from '@supabase/supabase-js';
import { createContext, useContext } from 'react';

export type AuthData = {
  session?: Session | null
  profile?: any | null
  isLoading: boolean
  isLoggedIn: boolean
  refreshProfile: () => Promise<void>
  profileImageVersion: number
};

export const AuthContext = createContext<AuthData>({
  session: undefined,
  profile: undefined,
  isLoading: true,
  isLoggedIn: false,
  refreshProfile: async () => {},
  profileImageVersion: 0,
});

export const useAuthContext = () => useContext(AuthContext);