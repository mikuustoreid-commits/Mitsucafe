// ============================================================
// HOME PAGE — the landing page with menu cards
// ============================================================
// This page shows a 2-top, 1-bottom card layout.
// The navigation bar is NOT shown on this page (it appears
// when you click a card to go to another page).
//
// HOW TO EDIT:
//   - To change the website name/logo: edit SITE_NAME and LOGO_ICON_NAME
//     in src/lib/constants.ts
//   - To change the cards (title, description, icon): edit HOME_CARDS
//     in src/lib/constants.ts
//   - To change the headline text: edit the text below in this file
// ============================================================

import { Cat, Download, FileText, Info, ArrowRight } from "lucide-react";
import { SITE_NAME, HOME_CARDS } from "@/lib/constants";
import type { Page } from "@/lib/types";

// Map icon names from constants to actual icon components:
const ICONS: Record<string, typeof Cat> = {
  Download,
  FileText,
  Info,
  Cat,
};

interface HomePageProps {
  onNavigate: (page: Page) => void;
  onOpenAuth: () => void;
}

export default function HomePage({ onNavigate, onOpenAuth }: HomePageProps) {
  return (
    <div className="min-h-screen bg-[#0f0c17] relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-amber-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-16">
        {/* Logo + headline */}
        <div className="mb-12 text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-2xl shadow-amber-500/30">
              <Cat size={44} className="text-white" />
            </div>
          </div>
          {/* EDIT THIS: the big headline on the home page */}
          <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-tight">
            {SITE_NAME}
          </h1>
          {/* EDIT THIS: the subtitle below the headline */}
          <p className="mt-3 text-lg text-gray-400">
            Your cozy corner of the internet
          </p>
        </div>

        {/* Menu cards: 2 on top, 1 on bottom (centered) */}
        <div className="w-full max-w-2xl">
          {/* Top row: 2 cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {HOME_CARDS.slice(0, 2).map((card) => {
              const Icon = ICONS[card.icon] || Cat;
              return (
                <button
                  key={card.page}
                  onClick={() => onNavigate(card.page as Page)}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1625] to-[#0f0c17] p-6 text-left shadow-xl transition-all hover:border-amber-500/30 hover:shadow-amber-500/10 hover:-translate-y-0.5"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 transition group-hover:bg-amber-500/20">
                      <Icon size={24} className="text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                      <p className="mt-1 text-sm text-gray-400 leading-relaxed">{card.description}</p>
                    </div>
                  </div>
                  <ArrowRight size={18} className="absolute bottom-5 right-5 text-gray-600 transition group-hover:text-amber-400 group-hover:translate-x-1" />
                </button>
              );
            })}
          </div>

          {/* Bottom row: 1 card centered */}
          <div className="flex justify-center">
            <button
              onClick={() => onNavigate(HOME_CARDS[2].page as Page)}
              className="group relative w-full sm:w-[calc(50%-0.5rem)] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1625] to-[#0f0c17] p-6 text-left shadow-xl transition-all hover:border-amber-500/30 hover:shadow-amber-500/10 hover:-translate-y-0.5"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 transition group-hover:bg-amber-500/20">
                  {(() => {
                    const Icon = ICONS[HOME_CARDS[2].icon] || Cat;
                    return <Icon size={24} className="text-amber-400" />;
                  })()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{HOME_CARDS[2].title}</h3>
                  <p className="mt-1 text-sm text-gray-400 leading-relaxed">{HOME_CARDS[2].description}</p>
                </div>
              </div>
              <ArrowRight size={18} className="absolute bottom-5 right-5 text-gray-600 transition group-hover:text-amber-400 group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Sign in prompt at bottom */}
        <div className="mt-12 text-center">
          <button
            onClick={onOpenAuth}
            className="text-sm text-gray-500 hover:text-amber-400 transition"
          >
            Sign in or create an account to join the chat →
          </button>
        </div>
      </div>
    </div>
  );
}
