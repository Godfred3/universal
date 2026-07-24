-- 1. Create custom Enums
CREATE TYPE chat_type AS ENUM ('individual', 'group');
CREATE TYPE chat_role AS ENUM ('admin', 'member');
CREATE TYPE message_type AS ENUM ('text', 'image', 'voice', 'sticker');

-- 2. Create 'profiles' table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio_status TEXT DEFAULT 'Hey there! I am using ChatApp',
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create 'chats' table
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type chat_type NOT NULL DEFAULT 'individual',
  name TEXT, -- only required for group chats
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create 'chat_participants' table
CREATE TABLE chat_participants (
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role chat_role NOT NULL DEFAULT 'member',
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (chat_id, profile_id)
);

-- 5. Create 'messages' table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content_type message_type NOT NULL DEFAULT 'text',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 7. Define RLS Policies

-- Profiles: Anyone can view profiles, but only the user can update their own profile.
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Chats: Users can only see chats they are a participant in.
CREATE POLICY "Users can view their chats" ON chats FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM chat_participants 
    WHERE chat_id = chats.id AND profile_id = auth.uid()
  )
);
CREATE POLICY "Users can create chats" ON chats FOR INSERT WITH CHECK (true);

-- Chat Participants: Users can see participants of chats they belong to.
CREATE POLICY "Users can view participants of their chats" ON chat_participants FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM chat_participants AS cp
    WHERE cp.chat_id = chat_participants.chat_id AND cp.profile_id = auth.uid()
  )
);
CREATE POLICY "Users can add participants" ON chat_participants FOR INSERT WITH CHECK (
  profile_id = auth.uid() OR -- User adding themselves (e.g. creating a chat)
  EXISTS (
    SELECT 1 FROM chat_participants 
    WHERE chat_id = chat_participants.chat_id AND profile_id = auth.uid() AND role = 'admin'
  )
);

-- Messages: Users can see and send messages in chats they are part of.
CREATE POLICY "Users can view messages in their chats" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM chat_participants 
    WHERE chat_id = messages.chat_id AND profile_id = auth.uid()
  )
);
CREATE POLICY "Users can insert messages in their chats" ON messages FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM chat_participants 
    WHERE chat_id = messages.chat_id AND profile_id = auth.uid()
  )
);

-- 8. Create Trigger to automatically create a profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, phone, full_name)
  VALUES (
    new.id,
    new.phone,
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
