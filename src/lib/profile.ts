import { supabase } from '@/lib/supabase';

export interface ProfileRecord {
  id: string;
  phone?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  bio_status?: string | null;
  username?: string | null;
  last_seen?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

async function ensureProfileSession() {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  if (session?.user) {
    return session.user;
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error('Unable to create a profile session.');
  }

  return data.user;
}

export async function getCurrentProfile(): Promise<ProfileRecord | null> {
  const user = await ensureProfileSession();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as ProfileRecord | null) ?? null;
}

export async function saveProfileDraft(input: {
  fullName?: string | null;
  phone?: string | null;
  username?: string | null;
  about?: string | null;
  avatarUrl?: string | null;
}): Promise<ProfileRecord | null> {
  const user = await ensureProfileSession();

  const payload = {
    id: user.id,
    phone: input.phone ?? null,
    full_name: input.fullName ?? null,
    username: input.username ?? null,
    bio_status: input.about ?? null,
    avatar_url: input.avatarUrl ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' });

  if (error) {
    const fallbackPayload = {
      id: user.id,
      phone: input.phone ?? null,
      full_name: input.fullName ?? null,
      bio_status: input.about ?? null,
      avatar_url: input.avatarUrl ?? null,
    };

    const { data: fallbackData, error: fallbackError } = await supabase
      .from('profiles')
      .upsert(fallbackPayload, { onConflict: 'id' });

    if (fallbackError) {
      throw fallbackError;
    }

    return (fallbackData as ProfileRecord[] | ProfileRecord | null) as ProfileRecord | null;
  }

  return (data as ProfileRecord[] | ProfileRecord | null) as ProfileRecord | null;
}
