import { useCallback, useEffect, useState } from 'react';
import {
  AuthProfile,
  fetchCurrentAuthProfile,
  mapUserToAuthProfile,
  signOutCurrentUser,
  subscribeToAuthProfile,
} from '@/lib/auth-profile';

type UseAuthProfileResult = {
  profile: AuthProfile;
  isLoading: boolean;
  isSigningOut: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<{ error: Error | null }>;
};

const GUEST_PROFILE = mapUserToAuthProfile(null);

export function useAuthProfile(): UseAuthProfileResult {
  const [profile, setProfile] = useState<AuthProfile>(GUEST_PROFILE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const refresh = useCallback(async () => {
    const nextProfile = await fetchCurrentAuthProfile();
    setProfile(nextProfile);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        const nextProfile = await fetchCurrentAuthProfile();
        if (!isMounted) return;
        setProfile(nextProfile);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    bootstrap();

    const unsubscribe = subscribeToAuthProfile((nextProfile) => {
      if (!isMounted) return;
      setProfile(nextProfile);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    try {
      setIsSigningOut(true);
      const { error } = await signOutCurrentUser();
      return { error: (error as Error | null) ?? null };
    } finally {
      setIsSigningOut(false);
    }
  }, []);

  return {
    profile,
    isLoading,
    isSigningOut,
    refresh,
    signOut,
  };
}
