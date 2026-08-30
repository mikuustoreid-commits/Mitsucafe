// ============================================================
// TYPE DEFINITIONS
// ============================================================
// These describe the shape of data used in the app.
// You don't need to edit these unless you change the database structure.
// ============================================================

export type Page = "home" | "downloader" | "blog" | "about";

// A user's profile from the database
export interface Profile {
  id: string;
  username: string;
  role: string; // 'member' | 'developer' | 'admin'
  badge: string;
  badge_color: string;
  is_banned: boolean;
  ban_reason: string;
  created_at: string;
}

// A chat message
export interface ChatMessage {
  id: string;
  user_id: string;
  username: string;
  role: string;
  badge: string;
  badge_color: string;
  content: string;
  created_at: string;
}

// A blog post
export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  created_at: string;
}
