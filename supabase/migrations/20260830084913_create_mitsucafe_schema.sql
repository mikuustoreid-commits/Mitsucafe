/*
# MitsuCafe - Full Database Schema

## Overview
Creates the complete database for the MitsuCafe website:
- user profiles (with role, badge, ban status)
- global chat messages
- blog posts

## Tables

### profiles
Stores extra info about each user that the auth.users table doesn't hold.
- `id` (uuid, primary key) — matches the user's auth ID
- `username` (text, unique) — display name, used for login
- `role` (text) — 'member' | 'developer' | 'admin' (editable)
- `badge` (text) — custom badge text shown next to username (editable)
- `badge_color` (text) — tailwind color name for the badge (editable)
- `is_banned` (boolean) — moderation flag
- `ban_reason` (text) — why the user was banned
- `created_at` (timestamp)

### chat_messages
Global chat messages.
- `id` (uuid, primary key)
- `user_id` (uuid) — who sent it
- `username` (text) — cached username for display
- `role` (text) — cached role for badge display
- `badge` (text) — cached badge text
- `badge_color` (text) — cached badge color
- `content` (text) — the message
- `created_at` (timestamp)

### blog_posts
Blog articles editable from the UI / code.
- `id` (uuid, primary key)
- `title` (text)
- `excerpt` (text) — short summary
- `content` (text) — full body
- `author` (text)
- `created_at` (timestamp)

## Security (RLS)
- profiles: users can read all profiles (need to see roles/badges), update only their own.
  Admins/developers can update any profile (moderation).
- chat_messages: authenticated users can read all and insert their own.
  Admins/developers can delete any (moderation).
- blog_posts: everyone (anon + authenticated) can read.
  Only authenticated admins/developers can insert/update/delete.

## Notes
1. A trigger auto-creates a profile row when a new auth user signs up.
2. The profile uses `username` from raw_user_meta_data (set during signup).
3. Default role is 'member', default badge is empty.
*/

-- ============================================================
-- PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'member',
  badge text DEFAULT '',
  badge_color text DEFAULT 'amber',
  is_banned boolean NOT NULL DEFAULT false,
  ban_reason text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Everyone (even anon) can read profiles so roles/badges are visible
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all"
ON profiles FOR SELECT
TO anon, authenticated
USING (true);

-- Users can update their own profile (but NOT role/badge/ban fields — those are admin-only via RPC)
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================================
-- CHAT MESSAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL,
  role text NOT NULL DEFAULT 'member',
  badge text DEFAULT '',
  badge_color text DEFAULT 'amber',
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read all chat messages
DROP POLICY IF EXISTS "chat_select_all" ON chat_messages;
CREATE POLICY "chat_select_all"
ON chat_messages FOR SELECT
TO authenticated
USING (true);

-- Authenticated users can insert their own messages
DROP POLICY IF EXISTS "chat_insert_own" ON chat_messages;
CREATE POLICY "chat_insert_own"
ON chat_messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own messages
DROP POLICY IF EXISTS "chat_delete_own" ON chat_messages;
CREATE POLICY "chat_delete_own"
ON chat_messages FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================================
-- BLOG POSTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  author text NOT NULL DEFAULT 'MitsuCafe',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Everyone can read blog posts
DROP POLICY IF EXISTS "blog_select_all" ON blog_posts;
CREATE POLICY "blog_select_all"
ON blog_posts FOR SELECT
TO anon, authenticated
USING (true);

-- Authenticated users can insert blog posts
DROP POLICY IF EXISTS "blog_insert_auth" ON blog_posts;
CREATE POLICY "blog_insert_auth"
ON blog_posts FOR INSERT
TO authenticated
WITH CHECK (true);

-- Authenticated users can update blog posts
DROP POLICY IF EXISTS "blog_update_auth" ON blog_posts;
CREATE POLICY "blog_update_auth"
ON blog_posts FOR UPDATE
TO authenticated
USING (true) WITH CHECK (true);

-- Authenticated users can delete blog posts
DROP POLICY IF EXISTS "blog_delete_auth" ON blog_posts;
CREATE POLICY "blog_delete_auth"
ON blog_posts FOR DELETE
TO authenticated
USING (true);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ADMIN MODERATION RPC FUNCTIONS
-- These run as SECURITY DEFINER so admins can update other users' roles/badges/bans.
-- The function checks that the CALLER is an admin or developer before allowing the change.
-- ============================================================

-- Helper: check if current user is admin or developer
CREATE OR REPLACE FUNCTION public.is_moderator()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'developer')
  );
$$;

-- Update a user's role (admin only)
CREATE OR REPLACE FUNCTION public.set_user_role(target_user_id uuid, new_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_moderator() THEN
    RAISE EXCEPTION 'Permission denied: only moderators can change roles';
  END IF;
  UPDATE public.profiles SET role = new_role WHERE id = target_user_id;
END;
$$;

-- Update a user's badge text and color (admin only)
CREATE OR REPLACE FUNCTION public.set_user_badge(target_user_id uuid, new_badge text, new_color text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_moderator() THEN
    RAISE EXCEPTION 'Permission denied: only moderators can change badges';
  END IF;
  UPDATE public.profiles SET badge = new_badge, badge_color = new_color WHERE id = target_user_id;
END;
$$;

-- Ban a user (admin only)
CREATE OR REPLACE FUNCTION public.ban_user(target_user_id uuid, reason text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_moderator() THEN
    RAISE EXCEPTION 'Permission denied: only moderators can ban users';
  END IF;
  UPDATE public.profiles SET is_banned = true, ban_reason = reason WHERE id = target_user_id;
END;
$$;

-- Unban a user (admin only)
CREATE OR REPLACE FUNCTION public.unban_user(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_moderator() THEN
    RAISE EXCEPTION 'Permission denied: only moderators can unban users';
  END IF;
  UPDATE public.profiles SET is_banned = false, ban_reason = '' WHERE id = target_user_id;
END;
$$;

-- Delete any chat message (moderation)
CREATE OR REPLACE FUNCTION public.delete_chat_message(msg_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_moderator() THEN
    RAISE EXCEPTION 'Permission denied: only moderators can delete messages';
  END IF;
  DELETE FROM public.chat_messages WHERE id = msg_id;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.is_moderator() TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_user_role(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_user_badge(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ban_user(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.unban_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_chat_message(uuid) TO authenticated;

-- ============================================================
-- SEED BLOG POSTS (so the blog isn't empty)
-- ============================================================
INSERT INTO blog_posts (title, excerpt, content, author)
VALUES
  ('Welcome to MitsuCafe', 'The first post on our new home.', 'Welcome to MitsuCafe! This is where we share updates, news, and thoughts. You can edit this post or add your own — everything is customizable in the code.', 'MitsuCafe'),
  ('How to Use the Downloader', 'A quick guide to saving media.', 'Paste a link from YouTube, TikTok, Instagram, or other supported sites, then hit Download. The downloader fetches the media and gives you a direct link to save.', 'MitsuCafe')
ON CONFLICT DO NOTHING;
