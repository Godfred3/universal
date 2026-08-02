import { supabase } from '@/lib/supabase';

export interface ProfileRecord {
  id: string;
  email?: string | null;
  phone?: string | null;
  gender?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  bio_status?: string | null;
  username?: string | null;
  last_seen?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  is_authorized?: boolean;
  authorized_at?: string | null;
}

async function requireUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error('Please verify your email and sign in first.');
  return user;
}

export async function getCurrentProfile(): Promise<ProfileRecord | null> {
  const user = await requireUser();
  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
  if (error) throw error;
  return (data as ProfileRecord | null) ?? null;
}

export async function isUsernameAvailable(username: string): Promise<boolean> {
  const user = await requireUser();
  const { data, error } = await supabase.from('profiles').select('id').eq('username', username).neq('id', user.id).maybeSingle();
  if (error) throw error;
  return !data;
}

export async function uploadProfileAvatar(uri: string, mimeType = 'image/jpeg'): Promise<string> {
  const user = await requireUser();
  const extension = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
  const path = `${user.id}/avatar-${Date.now()}.${extension}`;
  const response = await fetch(uri);
  const file = await response.arrayBuffer();
  const { error } = await supabase.storage.from('avatars').upload(path, file, { contentType: mimeType, upsert: true });
  if (error) throw error;
  return supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl;
}

export async function saveProfileDraft(input: {
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  gender?: string | null;
  username?: string | null;
  about?: string | null;
  avatarUrl?: string | null;
}): Promise<ProfileRecord | null> {
  const user = await requireUser();
  const payload = {
    id: user.id,
    email: input.email ?? user.email ?? null,
    ...(input.phone !== undefined ? { phone: input.phone } : {}),
    ...(input.gender !== undefined ? { gender: input.gender } : {}),
    ...(input.fullName !== undefined ? { full_name: input.fullName } : {}),
    ...(input.username !== undefined ? { username: input.username } : {}),
    ...(input.about !== undefined ? { bio_status: input.about } : {}),
    ...(input.avatarUrl !== undefined ? { avatar_url: input.avatarUrl } : {}),
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' }).select('*').single();
  if (error) throw error;
  return data as ProfileRecord;
}
