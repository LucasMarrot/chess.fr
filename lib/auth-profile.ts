import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export type AuthProfile = {
  id?: string;
  name: string;
  email: string;
  isAuthenticated: boolean;
  elo: {
    bullet: number;
    blitz: number;
    rapid: number;
  };
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
    id: user?.id,
    name: resolvedName || user?.email?.split('@')[0] || GUEST_NAME,
    email: user?.email ?? '',
    isAuthenticated: Boolean(user),
    elo: {
      bullet: 1200,
      blitz: 1200,
      rapid: 1200,
    },
  };
}

export async function fetchCurrentAuthProfile(): Promise<AuthProfile> {
  const { data } = await supabase.auth.getUser();
  const profile = mapUserToAuthProfile(data.user ?? null);

  if (!data.user) return profile;

  const { data: ratingProfile } = await supabase
    .from('profiles')
    .select('elo_bullet, elo_blitz, elo_rapid')
    .eq('id', data.user.id)
    .maybeSingle();

  if (!ratingProfile) return profile;

  return {
    ...profile,
    elo: {
      bullet: Number(ratingProfile.elo_bullet ?? profile.elo.bullet),
      blitz: Number(ratingProfile.elo_blitz ?? profile.elo.blitz),
      rapid: Number(ratingProfile.elo_rapid ?? profile.elo.rapid),
    },
  };
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
