// ============================================================
// ABOUT PAGE — tells visitors about your site
// ============================================================
// This page shows information about your project.
//
// HOW TO EDIT:
//   - To change the heading, body text, features, or author name:
//     edit ABOUT_CONTENT in src/lib/constants.ts
//   - That's it! The text you change there appears here.
// ============================================================

import { Info, CheckCircle } from "lucide-react";
import { ABOUT_CONTENT } from "@/lib/constants";

export default function AboutPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0f0c17] py-12 px-4">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/20">
              <Info size={28} className="text-white" />
            </div>
          </div>
          {/* The heading comes from ABOUT_CONTENT.heading in constants.ts */}
          <h1 className="text-3xl font-bold text-white">{ABOUT_CONTENT.heading}</h1>
        </div>

        {/* Main content card */}
        <div className="rounded-2xl border border-white/10 bg-[#1a1625] p-8 shadow-xl">
          {/* The body text comes from ABOUT_CONTENT.body in constants.ts */}
          <p className="text-gray-300 leading-relaxed text-lg">{ABOUT_CONTENT.body}</p>

          {/* Features list */}
          <div className="mt-8">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">Features</h3>
            <ul className="space-y-2.5">
              {ABOUT_CONTENT.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle size={20} className="shrink-0 mt-0.5 text-amber-400" />
                  <span className="text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Author footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Made with care by{" "}
            <span className="font-semibold text-amber-400">{ABOUT_CONTENT.author}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
