// ============================================================
// GLOBAL CHAT — a slide-in chat panel
// ============================================================
// This is a global chat room where all signed-in users can talk.
// It shows each user's username, role badge, and custom badge.
//
// HOW TO EDIT:
//   - To change how many messages load at once: edit
//     CHAT_SETTINGS.messageLimit in src/lib/constants.ts
//   - To change the max message length: edit
//     CHAT_SETTINGS.maxLength in src/lib/constants.ts
//   - Role colors: edit ROLE_COLORS in src/lib/constants.ts
//   - Badge colors: edit BADGE_COLORS in src/lib/constants.ts
// ============================================================

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Trash2, Ban } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { CHAT_SETTINGS, ROLE_COLORS, BADGE_COLORS } from "@/lib/constants";
import type { ChatMessage } from "@/lib/types";

interface ChatWidgetProps {
  open: boolean;
  onClose: () => void;
}

export default function ChatWidget({ open, onClose }: ChatWidgetProps) {
  const { profile, isGuest } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isModerator = profile?.role === "admin" || profile?.role === "developer";
  const canChat = !!profile && !isGuest && !profile.is_banned;

  // Load messages
  const loadMessages = async () => {
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(CHAT_SETTINGS.messageLimit);
    if (data) {
      setMessages((data as ChatMessage[]).reverse());
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open) loadMessages();
  }, [open]);

  // Subscribe to new messages in real-time
  useEffect(() => {
    if (!open) return;
    const channel = supabase
      .channel("chat_messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload) => {
        setMessages((prev) => [...prev, payload.new as ChatMessage]);
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "chat_messages" }, (payload) => {
        setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [open]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !canChat) return;
    if (input.length > CHAT_SETTINGS.maxLength) return;

    const content = input.trim();
    setInput("");

    await supabase.from("chat_messages").insert({
      user_id: profile.id,
      username: profile.username,
      role: profile.role,
      badge: profile.badge,
      badge_color: profile.badge_color,
      content,
    });
  };

  const deleteMessage = async (msgId: string) => {
    if (!isModerator) return;
    await supabase.rpc("delete_chat_message", { msg_id: msgId });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Chat panel */}
      <div className="relative w-full max-w-md bg-[#1a1625] border-l border-white/10 shadow-2xl flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <MessageCircle size={20} className="text-amber-400" />
            <h3 className="font-semibold text-white">Global Chat</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={22} />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <p className="text-center text-gray-500 text-sm">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-gray-500 text-sm">No messages yet. Say hello!</p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="group">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-white">{msg.username}</span>
                  {/* Role label */}
                  <span className={`text-xs font-medium text-${ROLE_COLORS[msg.role] || "gray"}-400`}>
                    {msg.role}
                  </span>
                  {/* Custom badge */}
                  {msg.badge && (
                    <span className={`rounded-full border px-1.5 py-0.5 text-xs font-medium ${BADGE_COLORS[msg.badge_color] || BADGE_COLORS.amber}`}>
                      {msg.badge}
                    </span>
                  )}
                  {/* Moderator delete button */}
                  {isModerator && (
                    <button
                      onClick={() => deleteMessage(msg.id)}
                      className="ml-auto opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed break-words">{msg.content}</p>
                <span className="text-xs text-gray-600">
                  {new Date(msg.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-white/10">
          {profile?.is_banned ? (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2.5 text-sm text-red-300">
              <Ban size={16} />
              You are banned from chat. Reason: {profile.ban_reason || "Not specified"}
            </div>
          ) : !canChat ? (
            <p className="text-center text-sm text-gray-500">Sign in to join the conversation.</p>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                maxLength={CHAT_SETTINGS.maxLength}
                className="flex-1 rounded-lg border border-white/10 bg-[#0f0c17] px-4 py-2.5 text-white placeholder-gray-500 focus:border-amber-500/50 focus:outline-none transition text-sm"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="flex items-center justify-center rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-white shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-orange-400 transition disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
