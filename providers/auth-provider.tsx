import { AuthContext } from '@/hooks/use-auth-context'
import { supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'
import { PropsWithChildren, useEffect, useState } from 'react'

export default function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | undefined | null>()
  const [profile, setProfile] = useState<any>()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [profileImageVersion, setProfileImageVersion] = useState<number>(0)

  // Fetch the session once, and subscribe to auth state changes
  useEffect(() => {
    const fetchSession = async () => {
      setIsLoading(true);

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error('Error fetching session:', error);
      }

      setSession(session);
      setIsLoading(false);
    }

    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', { event: _event, session });
      setSession(session);
    })

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    }
  }, [])

  // Fetch the profile when the session changes
  useEffect(() => {
    fetchProfile();
  }, [session])

  async function fetchProfile() {
    if (session) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      setProfile(data);
      setProfileImageVersion(v => v + 1);
    } else {
      setProfile(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        profile,
        isLoggedIn: session != undefined,
        refreshProfile: fetchProfile,
        profileImageVersion,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}