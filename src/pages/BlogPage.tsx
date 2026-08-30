// ============================================================
// BLOG PAGE — shows blog posts from the database
// ============================================================
// This page shows all blog posts. If you're signed in, you can
// also add, edit, and delete posts.
//
// HOW TO EDIT:
//   - To change the default posts (shown when the database is empty):
//     edit DEFAULT_BLOG_POSTS in src/lib/constants.ts
//   - To add a new post from the website: sign in, then click
//     "New Post" and fill in the form.
//   - To edit a post from the website: sign in, then click the
//     pencil icon on any post.
//   - To edit a post from the code: change the DEFAULT_BLOG_POSTS
//     in src/lib/constants.ts (these only show if the database is
//     empty; once you create posts from the website they're saved
//     to the database instead).
// ============================================================

import { useEffect, useState } from "react";
import { FileText, Plus, Pencil, Trash2, X, Save, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { DEFAULT_BLOG_POSTS } from "@/lib/constants";
import type { BlogPost } from "@/lib/types";

export default function BlogPage() {
  const { profile, isGuest } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editExcerpt, setEditExcerpt] = useState("");
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);

  // Load posts from the database
  const loadPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error || !data || data.length === 0) {
      // Fall back to default posts from constants.ts
      setPosts(DEFAULT_BLOG_POSTS.map((p, i) => ({
        id: `default-${i}`,
        title: p.title,
        excerpt: p.excerpt,
        content: p.content,
        author: p.author,
        created_at: new Date().toISOString(),
      })));
    } else {
      setPosts(data as BlogPost[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const canEdit = !!profile && !isGuest;

  const startNew = () => {
    setEditingId(null);
    setEditTitle("");
    setEditExcerpt("");
    setEditContent("");
    setShowEditor(true);
  };

  const startEdit = (post: BlogPost) => {
    setEditingId(post.id);
    setEditTitle(post.title);
    setEditExcerpt(post.excerpt);
    setEditContent(post.content);
    setShowEditor(true);
  };

  const savePost = async () => {
    if (!editTitle.trim() || !editContent.trim()) return;
    setSaving(true);

    if (editingId && !editingId.startsWith("default-")) {
      // Update existing post
      await supabase
        .from("blog_posts")
        .update({ title: editTitle, excerpt: editExcerpt, content: editContent })
        .eq("id", editingId);
    } else {
      // Insert new post
      await supabase
        .from("blog_posts")
        .insert({
          title: editTitle,
          excerpt: editExcerpt,
          content: editContent,
          author: profile?.username || "MitsuCafe",
        });
    }

    setSaving(false);
    setShowEditor(false);
    await loadPosts();
  };

  const deletePost = async (id: string) => {
    if (id.startsWith("default-")) return;
    if (!confirm("Delete this post? This cannot be undone.")) return;
    await supabase.from("blog_posts").delete().eq("id", id);
    await loadPosts();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0f0c17] py-12 px-4">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/20">
              <FileText size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Blog</h1>
              <p className="text-sm text-gray-400">Updates, news, and thoughts</p>
            </div>
          </div>
          {canEdit && (
            <button
              onClick={startNew}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-orange-400 transition"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">New Post</span>
            </button>
          )}
        </div>

        {/* Editor modal */}
        {showEditor && (
          <div className="mb-6 rounded-2xl border border-amber-500/30 bg-[#1a1625] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-white">
                {editingId ? "Edit Post" : "New Post"}
              </h3>
              <button onClick={() => setShowEditor(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Post title"
                className="w-full rounded-lg border border-white/10 bg-[#0f0c17] px-4 py-2.5 text-white placeholder-gray-500 focus:border-amber-500/50 focus:outline-none transition"
              />
              <input
                type="text"
                value={editExcerpt}
                onChange={(e) => setEditExcerpt(e.target.value)}
                placeholder="Short summary (shown in the post list)"
                className="w-full rounded-lg border border-white/10 bg-[#0f0c17] px-4 py-2.5 text-white placeholder-gray-500 focus:border-amber-500/50 focus:outline-none transition"
              />
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Write your post here..."
                rows={8}
                className="w-full rounded-lg border border-white/10 bg-[#0f0c17] px-4 py-2.5 text-white placeholder-gray-500 focus:border-amber-500/50 focus:outline-none transition resize-y"
              />
              <button
                onClick={savePost}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-green-500/20 border border-green-500/40 px-4 py-2 text-sm font-semibold text-green-300 hover:bg-green-500/30 transition disabled:opacity-50"
              >
                <Save size={18} />
                {saving ? "Saving..." : "Save Post"}
              </button>
            </div>
          </div>
        )}

        {/* Posts list */}
        {loading ? (
          <div className="text-center text-gray-500 py-12">Loading posts...</div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group rounded-2xl border border-white/10 bg-[#1a1625] p-6 shadow-lg transition hover:border-white/20"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white">{post.title}</h2>
                    {post.excerpt && <p className="mt-1 text-sm text-amber-400/80">{post.excerpt}</p>}
                  </div>
                  {canEdit && (
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => startEdit(post)}
                        className="rounded-lg p-2 text-gray-500 hover:text-amber-400 hover:bg-amber-500/10 transition"
                      >
                        <Pencil size={16} />
                      </button>
                      {!post.id.startsWith("default-") && (
                        <button
                          onClick={() => deletePost(post.id)}
                          className="rounded-lg p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <p className="mt-3 text-gray-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                <div className="mt-4 flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(post.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </span>
                  <span>•</span>
                  <span>by {post.author}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
