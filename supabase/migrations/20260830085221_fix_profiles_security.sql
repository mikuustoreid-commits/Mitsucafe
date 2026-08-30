/*
# Fix profiles security — prevent self-escalation

## Problem
The profiles_update_own policy allowed any user to UPDATE all columns on their
own profile, including role, badge, is_banned, and ban_reason. A regular user
could escalate themselves to admin or unban themselves.

## Fix
1. Drop the broad profiles_update_own policy.
2. Add column-level privileges: authenticated users can only UPDATE the
   username column on their own profile. Role, badge, badge_color, is_banned,
   and ban_reason are only changeable through the SECURITY DEFINER RPC functions
   (set_user_role, set_user_badge, ban_user, unban_user) which check moderator status.
3. Revoke broad table-level grants on profiles and re-grant only what's needed.
*/

-- Drop the insecure update policy
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

-- Revoke all table-level grants, then re-apply minimal ones
REVOKE ALL ON profiles FROM anon, authenticated;

-- anon can only SELECT (to see roles/badges)
GRANT SELECT ON profiles TO anon;

-- authenticated can SELECT and UPDATE only username
GRANT SELECT ON profiles TO authenticated;
GRANT UPDATE (username) ON profiles TO authenticated;

-- Re-add a restricted update policy (only for username changes)
CREATE POLICY "profiles_update_own_username"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Also restrict chat_messages grants
REVOKE ALL ON chat_messages FROM anon;
GRANT SELECT ON chat_messages TO authenticated;
GRANT INSERT ON chat_messages TO authenticated;
GRANT DELETE ON chat_messages TO authenticated;

-- Restrict blog_posts: anon can only SELECT, authenticated get full CRUD
REVOKE ALL ON blog_posts FROM anon;
GRANT SELECT ON blog_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON blog_posts TO authenticated;
