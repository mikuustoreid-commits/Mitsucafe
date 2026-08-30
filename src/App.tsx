// ============================================================
// APP — the main app that ties everything together
// ============================================================
// This file controls which page is shown and manages the popups
// (auth modal, chat, admin panel).
//
// You don't need to edit this file to customize your site.
// All editable text is in src/lib/constants.ts.
// ============================================================

import { useState } from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import AuthModal from "@/components/AuthModal";
import ChatWidget from "@/components/ChatWidget";
import AdminPanel from "@/components/AdminPanel";
import HomePage from "@/pages/HomePage";
import DownloaderPage from "@/pages/DownloaderPage";
import BlogPage from "@/pages/BlogPage";
import AboutPage from "@/pages/AboutPage";
import type { Page } from "@/lib/types";

function AppContent() {
  const { loading, profile, isGuest } = useAuth();
  const [page, setPage] = useState<Page>("home");
  const [authOpen, setAuthOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  // Show a loading screen while checking login status
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0c17] flex items-center justify-center">
        <div className="text-gray-500 animate-pulse">Loading...</div>
      </div>
    );
  }

  // Check if banned user should be kicked to a "banned" screen
  const isBanned = profile?.is_banned && page !== "about";

  return (
    <div className="min-h-screen bg-[#0f0c17]">
      {/* Navbar is hidden on the home page, shown on all other pages */}
      {page !== "home" && (
        <Navbar
          currentPage={page}
          onNavigate={setPage}
          onOpenAuth={() => setAuthOpen(true)}
          onOpenChat={() => setChatOpen(true)}
          onOpenAdmin={() => setAdminOpen(true)}
        />
      )}

      {/* Banned notice */}
      {isBanned && (
        <div className="bg-red-500/10 border-b border-red-500/30 px-4 py-2 text-center text-sm text-red-300">
          Your account has been banned. Reason: {profile?.ban_reason || "Not specified"}. You can still browse but cannot chat.
        </div>
      )}

      {/* Page content */}
      {page === "home" && (
        <HomePage onNavigate={setPage} onOpenAuth={() => setAuthOpen(true)} />
      )}
      {page === "downloader" && <DownloaderPage />}
      {page === "blog" && <BlogPage />}
      {page === "about" && <AboutPage />}

      {/* Popups */}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <ChatWidget open={chatOpen} onClose={() => setChatOpen(false)} />
      <AdminPanel open={adminOpen} onClose={() => setAdminOpen(false)} />

      {/* Floating chat button (shown on non-home pages when chat is closed and user is signed in) */}
      {page !== "home" && !chatOpen && (profile || isGuest) && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-xl shadow-amber-500/30 hover:scale-105 transition"
          title="Open Chat"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
