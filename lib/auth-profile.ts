import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export type AuthProfile = {
  name: string;
  email: string;
  isAuthenticated: boolean;
};

const GUEST_NAME = 'Utilisateur';

export function resolveUserName(metadata: Record<string, unknown> | undefined): string {
  const fullName = metadata?.full_name as string | undefined;
  const name = metadata?.name as string | undefined;

  return (fullName || name || '').trim();
}

export function mapUserToAuthProfile(user: User | null): AuthProfile {
  const resolvedName = resolveUserName(user?.user_metadata as Record<string, unknown> | undefined);

  return {
    name: resolvedName || user?.email?.split('@')[0] || GUEST_NAME,
    email: user?.email ?? '',
    isAuthenticated: Boolean(user),
  };
}

export async function fetchCurrentAuthProfile(): Promise<AuthProfile> {
  const { data } = await supabase.auth.getUser();
  return mapUserToAuthProfile(data.user ?? null);
}

export function subscribeToAuthProfile(
  onProfileChange: (profile: AuthProfile) => void,
): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    onProfileChange(mapUserToAuthProfile(session?.user ?? null));
  });

  return () => {
    data.subscription.unsubscribe();
  };
}

export async function signOutCurrentUser() {
  return supabase.auth.signOut();
}
