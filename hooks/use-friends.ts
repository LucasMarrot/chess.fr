import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export type FriendshipStatus = 'PENDING' | 'ACCEPTED' | 'BLOCKED';

export type UserProfile = {
  id: string;
  username: string;
  avatar_url: string | null;
  elo: number;
};

export type Friendship = {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
  friend_profile?: UserProfile;
};

export type OnlineStatusMap = {
  [userId: string]: boolean;
};

// --- ÉTAT GLOBAL POUR LA PRÉSENCE ---
let sharedOnlineUsers: OnlineStatusMap = {};
let presenceChannel: ReturnType<typeof supabase.channel> | null = null;
const subscribers = new Set<(users: OnlineStatusMap) => void>();

export const useFriends = (currentUserId: string | undefined) => {
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineStatusMap>(sharedOnlineUsers);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchFriends = useCallback(async () => {
    if (!currentUserId) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('friendships')
      .select(
        `
        id, status, requester_id, addressee_id, created_at,
        requester:profiles!requester_id(id, username, avatar_url, elo),
        addressee:profiles!addressee_id(id, username, avatar_url, elo)
      `,
      )
      .or(`requester_id.eq.${currentUserId},addressee_id.eq.${currentUserId}`);

    if (error) {
      console.error('Erreur récupération amis:', error.message);
    } else if (data) {
      const formatted: Friendship[] = data.map((item: any) => {
        const isRequester = item.requester_id === currentUserId;
        return {
          id: item.id,
          requester_id: item.requester_id,
          addressee_id: item.addressee_id,
          status: item.status,
          created_at: item.created_at,
          friend_profile: isRequester ? item.addressee : item.requester,
        };
      });
      setFriends(formatted);
    }
    setLoading(false);
  }, [currentUserId]);

  // Synchronisation "En ligne" centralisée
  useEffect(() => {
    if (!currentUserId) return;

    fetchFriends();

    const updateLocalState = (newMap: OnlineStatusMap) => setOnlineUsers(newMap);
    subscribers.add(updateLocalState);

    // Sécurité supplémentaire : on vérifie que Supabase n'a pas déjà ce canal en mémoire
    const activeChannels = supabase.getChannels();
    const hasOnlineChannel = activeChannels.some((c) => c.topic === 'realtime:online-users');

    if (!presenceChannel && !hasOnlineChannel) {
      presenceChannel = supabase.channel('online-users');

      presenceChannel
        .on('presence', { event: 'sync' }, () => {
          if (!presenceChannel) return;
          const newState = presenceChannel.presenceState();
          const onlineMap: OnlineStatusMap = {};

          Object.values(newState).forEach((presences: any) => {
            presences.forEach((presence: any) => {
              if (presence.user_id) onlineMap[presence.user_id] = true;
            });
          });

          sharedOnlineUsers = onlineMap;
          subscribers.forEach((sub) => sub(onlineMap));
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED' && presenceChannel) {
            await presenceChannel.track({
              user_id: currentUserId,
              online_at: new Date().toISOString(),
            });
          }
        });
    }

    return () => {
      subscribers.delete(updateLocalState);

      if (subscribers.size === 0 && presenceChannel) {
        supabase.removeChannel(presenceChannel);
        presenceChannel = null;
        sharedOnlineUsers = {};
      }
    };
  }, [currentUserId, fetchFriends]);

  const sendFriendRequest = async (addresseeId: string) => {
    const { error } = await supabase.from('friendships').insert({
      requester_id: currentUserId,
      addressee_id: addresseeId,
      status: 'PENDING',
    });
    if (!error) fetchFriends();
  };

  const respondToRequest = async (friendshipId: string, status: 'ACCEPTED' | 'BLOCKED') => {
    const { error } = await supabase.from('friendships').update({ status }).eq('id', friendshipId);
    if (!error) fetchFriends();
  };

  const removeFriend = async (friendshipId: string) => {
    const { error } = await supabase.from('friendships').delete().eq('id', friendshipId);
    if (!error) fetchFriends();
  };

  return {
    friends,
    onlineUsers,
    loading,
    sendFriendRequest,
    respondToRequest,
    removeFriend,
    refetch: fetchFriends,
  };
};
