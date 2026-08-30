// ============================================================
// NAVBAR — the top navigation bar
// ============================================================
// This bar shows on every page EXCEPT the home page.
// On the home page it is hidden (the home page has its own menu).
//
// HOW TO EDIT:
//   - To change the logo text: edit SITE_NAME in src/lib/constants.ts
//   - To change the nav links: edit NAV_LINKS in src/lib/constants.ts
//   - To change the logo icon: edit LOGO_ICON_NAME in constants.ts
//     and update the import below (change "Cat" to your icon name)
// ============================================================

import { Cat, Home, Download, FileText, Info, LogOut, Shield, MessageCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { SITE_NAME, NAV_LINKS, BADGE_COLORS } from "@/lib/constants";
import type { Page } from "@/lib/types";

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onOpenAuth: () => void;
  onOpenChat: () => void;
  onOpenAdmin: () => void;
}

// Map page names to icons:
const PAGE_ICONS: Record<string, typeof Home> = {
  home: Home,
  downloader: Download,
  blog: FileText,
  about: Info,
};

export default function Navbar({ currentPage, onNavigate, onOpenAuth, onOpenChat, onOpenAdmin }: NavbarProps) {
  const { profile, isGuest, signOut } = useAuth();
  const isModerator = profile?.role === "admin" || profile?.role === "developer";

  return (
    <nav className="sticky top-0 z-40 border-b border-white/10 bg-[#1a1625]/90 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo (clickable to go home) */}
          <button
            onClick={() => onNavigate("home")}
            className="flex items-center gap-2 shrink-0"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/20">
              <Cat size={20} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white">{SITE_NAME}</span>
          </button>

          {/* Navigation links */}
          <div className="flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const Icon = PAGE_ICONS[link.page] || Home;
              const isActive = currentPage === link.page;
              return (
                <button
                  key={link.page}
                  onClick={() => onNavigate(link.page as Page)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-amber-500/15 text-amber-300"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{link.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right side: chat, admin, account */}
          <div className="flex items-center gap-2">
            {/* Chat button */}
            <button
              onClick={onOpenChat}
              className="flex items-center gap-1.5 rounded-lg p-2 text-gray-400 hover:text-white hover:bg-white/5 transition"
              title="Global Chat"
            >
              <MessageCircle size={20} />
            </button>

            {/* Admin panel button (only for moderators) */}
            {isModerator && (
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-1.5 rounded-lg p-2 text-gray-400 hover:text-white hover:bg-white/5 transition"
                title="Moderation Panel"
              >
                <Shield size={20} />
              </button>
            )}

            {/* Account area */}
            {profile ? (
              <div className="flex items-center gap-2">
                {/* Username + badge */}
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-white hidden sm:inline">{profile.username}</span>
                  {profile.badge && (
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${BADGE_COLORS[profile.badge_color] || BADGE_COLORS.amber}`}>
                      {profile.badge}
                    </span>
                  )}
                </div>
                {/* Sign out */}
                <button
                  onClick={signOut}
                  className="rounded-lg p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition"
                  title="Sign Out"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : isGuest ? (
              <button
                onClick={onOpenAuth}
                className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-orange-400 transition"
              >
                Sign In
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-orange-400 transition"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
