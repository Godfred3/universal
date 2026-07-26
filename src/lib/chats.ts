import { getCurrentProfile, ProfileRecord } from '@/lib/profile';
import { supabase } from '@/lib/supabase';

export interface ChatRecord {
  id: string;
  type: 'individual' | 'group';
  name?: string | null;
  created_at: string;
  last_message?: string | null;
  last_message_time?: string | null;
  updated_at?: string | null;
  chat_type?: string;
  group_name?: string | null;
  other_user?: ProfileRecord | null;
  last_message_content?: string | null;
  participants?: {
    profile_id: string;
    profiles?: ProfileRecord;
  }[];
}

export interface ContactRecord {
  id: string;
  full_name?: string | null;
  username?: string | null;
  avatar_url?: string | null;
  bio_status?: string | null;
  last_seen?: string | null;
}

export async function getFriendsAndContacts(): Promise<ContactRecord[]> {
  const profile = await getCurrentProfile();
  if (!profile?.id) {
    throw new Error('No profile found');
  }

  // Get friends from friendships table
  const { data: friendsData, error: friendsError } = await supabase
    .from('friendships')
    .select('user_a, user_b')
    .or(`user_a.eq.${profile.id},user_b.eq.${profile.id}`);

  if (friendsError) {
    throw friendsError;
  }

  const friendIds = (friendsData ?? []).flatMap((row: any) => [row.user_a, row.user_b]).filter((id: string | null) => id && id !== profile.id);
  const uniqueFriendIds = Array.from(new Set(friendIds));

  if (uniqueFriendIds.length === 0) {
    return [];
  }

  // Get all profiles
  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name, username, avatar_url, bio_status, last_seen')
    .in('id', uniqueFriendIds);

  if (profilesError) {
    throw profilesError;
  }

  return (profilesData as ContactRecord[] | null) ?? [];
}

export async function getChatsForUser(): Promise<ChatRecord[]> {
  const profile = await getCurrentProfile();
  if (!profile?.id) {
    throw new Error('No profile found');
  }

  // Get chats where user is a participant
  const { data: chatsData, error: chatsError } = await supabase
    .from('chats')
    .select(
      `id, type, name, created_at, last_message_time,
       messages(content, created_at)
    `
    )
    .order('last_message_time', { ascending: false, nullsFirst: false })
    .limit(50);

  if (chatsError) {
    throw chatsError;
  }

  if (!chatsData) {
    return [];
  }

  // Enrich chat records with participant data for individual chats
  const enrichedChats = await Promise.all(
    (chatsData as any[]).map(async (chat) => {
      if (chat.type === 'group') {
        return {
          ...chat,
          chat_type: 'group',
          group_name: chat.name,
          last_message_content: chat.messages?.[0]?.content || '(No messages yet)',
          updated_at: chat.last_message_time || chat.created_at,
        };
      } else {
        // For individual chats, get the other participant's profile
        const { data: participants } = await supabase
          .from('chat_participants')
          .select('profile_id, profiles(id, full_name, username, avatar_url, bio_status)')
          .eq('chat_id', chat.id)
          .neq('profile_id', profile.id)
          .single();

        const otherUser = participants?.profiles as ProfileRecord | null;

        return {
          ...chat,
          chat_type: 'individual',
          other_user: otherUser,
          last_message_content: chat.messages?.[0]?.content || '(No messages yet)',
          updated_at: chat.last_message_time || chat.created_at,
        };
      }
    })
  );

  return enrichedChats as ChatRecord[];
}

export async function createOrGetIndividualChat(participantId: string): Promise<string> {
  const profile = await getCurrentProfile();
  if (!profile?.id) {
    throw new Error('No profile found');
  }

  // Check if chat already exists
  const { data: existingChat } = await supabase
    .from('chats')
    .select('id')
    .eq('type', 'individual')
    .in('chat_participants', 'profile_id', `in.(${profile.id},${participantId})`);

  if (existingChat && existingChat.length > 0) {
    return existingChat[0].id;
  }

  // Create new chat
  const { data: newChat, error: createError } = await supabase
    .from('chats')
    .insert({ type: 'individual' })
    .select('id')
    .single();

  if (createError) {
    throw createError;
  }

  // Add participants
  await supabase
    .from('chat_participants')
    .insert([
      { chat_id: newChat.id, profile_id: profile.id },
      { chat_id: newChat.id, profile_id: participantId },
    ]);

  return newChat.id;
}

export async function createGroupChat(groupName: string, participantIds: string[]): Promise<string> {
  const profile = await getCurrentProfile();
  if (!profile?.id) {
    throw new Error('No profile found');
  }

  // Create new group chat
  const { data: newChat, error: createError } = await supabase
    .from('chats')
    .insert({ type: 'group', name: groupName })
    .select('id')
    .single();

  if (createError) {
    throw createError;
  }

  // Add participants (including the creator)
  await supabase
    .from('chat_participants')
    .insert([
      { chat_id: newChat.id, profile_id: profile.id, role: 'admin' },
      ...participantIds.map((id) => ({ chat_id: newChat.id, profile_id: id, role: 'member' })),
    ]);

  return newChat.id;
}
