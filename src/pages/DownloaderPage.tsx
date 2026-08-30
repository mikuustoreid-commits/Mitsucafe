// ============================================================
// DOWNLOADER PAGE — download media from various sites
// ============================================================
// This page lets users paste a link and download media from
// YouTube, TikTok, Instagram, and other supported sites.
//
// It works by sending the link to our edge function (the server),
// which forwards it to the Cobalt API. The Cobalt API returns a
// download link that the user can click to save the file.
//
// HOW TO EDIT:
//   - To change the page title/description: edit the text below
//   - To change which Cobalt instance is used: edit the URL in
//     supabase/functions/downloader/index.ts
// ============================================================

import { useState } from "react";
import { Download, Link2, Loader2, AlertCircle, CheckCircle, Music, Video, FileImage } from "lucide-react";
import { supabase } from "@/lib/supabase";

// Supported sites to show as hints:
const SUPPORTED_SITES = ["YouTube", "TikTok", "Instagram", "Twitter/X", "Reddit", "Twitch", "SoundCloud", "Pinterest"];

type DownloadResult = {
  status: string;
  url?: string;
  filename?: string;
  picker?: Array<{ type: string; url: string; thumb?: string }>;
  audio?: string;
  audioFilename?: string;
  error?: { code: string; message?: string };
};

export default function DownloaderPage() {
  const [url, setUrl] = useState("");
  const [mode, setMode] = useState<"auto" | "audio" | "mute">("auto");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DownloadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!url.trim()) {
      setError("Please paste a link first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Call our edge function (which proxies to the Cobalt API)
      const { data, error: fnError } = await supabase.functions.invoke("downloader", {
        body: {
          url: url.trim(),
          downloadMode: mode,
          videoQuality: "1080",
          audioFormat: "mp3",
        },
      });

      if (fnError) throw fnError;
      if (!data) throw new Error("No response from downloader.");

      setResult(data as DownloadResult);

      if (data.status === "error") {
        setError(data.error?.message || data.error?.code || "Download failed. The site may not be supported.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0f0c17] py-12 px-4">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/20">
              <Download size={28} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">Media Downloader</h1>
          <p className="mt-2 text-gray-400">Paste a link to download video, audio, or images.</p>
        </div>

        {/* Input card */}
        <div className="rounded-2xl border border-white/10 bg-[#1a1625] p-6 shadow-xl">
          {/* URL input */}
          <div className="relative mb-4">
            <Link2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste a link here (https://...)"
              className="w-full rounded-lg border border-white/10 bg-[#0f0c17] pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition"
              onKeyDown={(e) => e.key === "Enter" && handleDownload()}
            />
          </div>

          {/* Mode selector */}
          <div className="mb-4 flex gap-2">
            {([
              { value: "auto", label: "Auto", icon: Video },
              { value: "audio", label: "Audio Only", icon: Music },
              { value: "mute", label: "Muted Video", icon: FileImage },
            ] as const).map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  onClick={() => setMode(opt.value)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                    mode === opt.value
                      ? "border-amber-500/40 bg-amber-500/15 text-amber-300"
                      : "border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon size={16} />
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Download button */}
          <button
            onClick={handleDownload}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 font-semibold text-white shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-orange-400 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Download size={20} />
                Download
              </>
            )}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Download failed</p>
              <p className="mt-1 text-red-300/80">{error}</p>
            </div>
          </div>
        )}

        {/* Result: single file (tunnel/redirect) */}
        {result && (result.status === "tunnel" || result.status === "redirect") && result.url && (
          <div className="mt-4 rounded-xl border border-green-500/30 bg-green-500/10 p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={20} className="text-green-400" />
              <span className="font-semibold text-green-300">Ready to download!</span>
            </div>
            <p className="text-sm text-gray-400 mb-3 break-all">{result.filename}</p>
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-green-500/20 border border-green-500/40 px-4 py-2.5 text-sm font-semibold text-green-300 hover:bg-green-500/30 transition"
            >
              <Download size={18} />
              Save File
            </a>
          </div>
        )}

        {/* Result: picker (multiple files) */}
        {result && result.status === "picker" && result.picker && (
          <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileImage size={20} className="text-amber-400" />
              <span className="font-semibold text-amber-300">Multiple items found — pick one:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {result.picker.map((item, i) => (
                <a
                  key={i}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden rounded-lg border border-white/10 bg-[#0f0c17] transition hover:border-amber-500/40"
                >
                  {item.thumb ? (
                    <img src={item.thumb} alt="" className="aspect-square w-full object-cover" />
                  ) : (
                    <div className="flex aspect-square items-center justify-center text-gray-600">
                      <FileImage size={32} />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1 text-xs text-white">
                    {item.type}
                  </div>
                </a>
              ))}
            </div>
            {result.audio && (
              <a
                href={result.audio}
                target="_blank"
                rel="noopener noreferrer"
                download={result.audioFilename}
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-500/20 border border-amber-500/40 px-4 py-2 text-sm font-semibold text-amber-300 hover:bg-amber-500/30 transition"
              >
                <Music size={16} />
                Download Audio
              </a>
            )}
          </div>
        )}

        {/* Supported sites */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 mb-2">Supported sites:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {SUPPORTED_SITES.map((site) => (
              <span key={site} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-400">
                {site}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
