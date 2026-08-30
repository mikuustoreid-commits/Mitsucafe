// ============================================================
// ADMIN / MODERATION PANEL
// ============================================================
// This panel lets admins and developers:
//   - View all users
//   - Change a user's role (member / developer / admin)
//   - Change a user's badge text and color
//   - Ban / unban users
//
// Only users with role "admin" or "developer" can open this panel.
// ============================================================

import { useEffect, useState } from "react";
import { X, Shield, Ban, CheckCircle, Crown, Star } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { BADGE_COLORS } from "@/lib/constants";
import type { Profile } from "@/lib/types";

interface AdminPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function AdminPanel({ open, onClose }: AdminPanelProps) {
  const { profile, refreshProfile } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (data) setUsers(data as Profile[]);
    setLoading(false);
  };

  useEffect(() => {
    if (open) loadUsers();
  }, [open]);

  if (!open) return null;

  const isModerator = profile?.role === "admin" || profile?.role === "developer";
  if (!isModerator) return null;

  // --- Change a user's role ---
  const changeRole = async (userId: string, newRole: string) => {
    await supabase.rpc("set_user_role", { target_user_id: userId, new_role: newRole });
    await loadUsers();
    if (userId === profile?.id) refreshProfile();
  };

  // --- Change a user's badge ---
  const changeBadge = async (userId: string, badge: string, color: string) => {
    await supabase.rpc("set_user_badge", { target_user_id: userId, new_badge: badge, new_color: color });
    await loadUsers();
    if (userId === profile?.id) refreshProfile();
  };

  // --- Ban a user ---
  const banUser = async (userId: string) => {
    const reason = prompt("Why are you banning this user?");
    if (reason === null) return;
    await supabase.rpc("ban_user", { target_user_id: userId, reason: reason || "Violation of rules" });
    await loadUsers();
  };

  // --- Unban a user ---
  const unbanUser = async (userId: string) => {
    await supabase.rpc("unban_user", { target_user_id: userId });
    await loadUsers();
  };

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl max-h-[85vh] rounded-2xl border border-white/10 bg-[#1a1625] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Shield size={22} className="text-amber-400" />
            <h2 className="text-xl font-bold text-white">Moderation Panel</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={22} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-white/10">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name..."
            className="w-full rounded-lg border border-white/10 bg-[#0f0c17] px-4 py-2 text-white placeholder-gray-500 focus:border-amber-500/50 focus:outline-none transition text-sm"
          />
        </div>

        {/* User list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <p className="text-center text-gray-500">Loading users...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-500">No users found.</p>
          ) : (
            filtered.map((user) => (
              <div
                key={user.id}
                className={`rounded-xl border p-4 ${user.is_banned ? "border-red-500/30 bg-red-500/5" : "border-white/10 bg-white/5"}`}
              >
                {/* User info row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{user.username}</span>
                    {user.role === "admin" && <Crown size={16} className="text-amber-400" />}
                    {user.role === "developer" && <Star size={16} className="text-blue-400" />}
                    {user.badge && (
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${BADGE_COLORS[user.badge_color] || BADGE_COLORS.amber}`}>
                        {user.badge}
                      </span>
                    )}
                    {user.is_banned && (
                      <span className="rounded-full bg-red-500/20 border border-red-500/40 px-2 py-0.5 text-xs font-medium text-red-300">
                        BANNED
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(user.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap gap-2">
                  {/* Role selector */}
                  <select
                    value={user.role}
                    onChange={(e) => changeRole(user.id, e.target.value)}
                    className="rounded-lg border border-white/10 bg-[#0f0c17] px-3 py-1.5 text-sm text-white focus:border-amber-500/50 focus:outline-none transition"
                  >
                    <option value="member">Member</option>
                    <option value="developer">Developer</option>
                    <option value="admin">Admin</option>
                  </select>

                  {/* Badge text input */}
                  <input
                    type="text"
                    defaultValue={user.badge}
                    placeholder="Badge text"
                    onBlur={(e) => changeBadge(user.id, e.target.value, user.badge_color)}
                    className="w-32 rounded-lg border border-white/10 bg-[#0f0c17] px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:border-amber-500/50 focus:outline-none transition"
                  />

                  {/* Badge color selector */}
                  <select
                    value={user.badge_color}
                    onChange={(e) => changeBadge(user.id, user.badge, e.target.value)}
                    className="rounded-lg border border-white/10 bg-[#0f0c17] px-3 py-1.5 text-sm text-white focus:border-amber-500/50 focus:outline-none transition"
                  >
                    {Object.keys(BADGE_COLORS).map((color) => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>

                  {/* Ban / Unban button */}
                  {user.is_banned ? (
                    <button
                      onClick={() => unbanUser(user.id)}
                      className="flex items-center gap-1.5 rounded-lg bg-green-500/20 border border-green-500/40 px-3 py-1.5 text-sm font-medium text-green-300 hover:bg-green-500/30 transition"
                    >
                      <CheckCircle size={14} />
                      Unban
                    </button>
                  ) : (
                    <button
                      onClick={() => banUser(user.id)}
                      disabled={user.id === profile?.id}
                      className="flex items-center gap-1.5 rounded-lg bg-red-500/20 border border-red-500/40 px-3 py-1.5 text-sm font-medium text-red-300 hover:bg-red-500/30 transition disabled:opacity-30"
                    >
                      <Ban size={14} />
                      Ban
                    </button>
                  )}
                </div>

                {/* Ban reason (if banned) */}
                {user.is_banned && user.ban_reason && (
                  <p className="mt-2 text-xs text-red-300/70">Reason: {user.ban_reason}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
