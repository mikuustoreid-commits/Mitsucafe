// ============================================================
// AUTH MODAL — the sign in / sign up popup
// ============================================================
// This popup lets users:
//   - Sign in with username + password
//   - Sign up for a new account
//   - Browse as a guest
//   - Toggle "Show password" to see what they're typing
//   - Check "Remember me" to stay logged in
//
// You don't need to edit this file to customize your site.
// ============================================================

import { useState } from "react";
import { X, Eye, EyeOff, User, Lock, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { SITE_NAME } from "@/lib/constants";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const { signIn, signUp, signInAsGuest } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);

    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters.");
      setBusy(false);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setBusy(false);
      return;
    }

    const result = mode === "signin"
      ? await signIn(username.trim(), password, rememberMe)
      : await signUp(username.trim(), password);

    setBusy(false);

    if (result.error) {
      setError(result.error);
    } else {
      // Success — close the modal
      setUsername("");
      setPassword("");
      setError(null);
      onClose();
    }
  };

  const handleGuest = () => {
    signInAsGuest();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1a1625] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">
            {mode === "signin" ? `Sign in to ${SITE_NAME}` : `Join ${SITE_NAME}`}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Username field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Username</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Pick a username"
                className="w-full rounded-lg border border-white/10 bg-[#0f0c17] pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition"
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password field with show/hide toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full rounded-lg border border-white/10 bg-[#0f0c17] pl-10 pr-10 py-2.5 text-white placeholder-gray-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
              />
              {/* Show/Hide password button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember me checkbox (only on sign in) */}
          {mode === "signin" && (
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-[#0f0c17] accent-amber-500"
              />
              <span className="text-sm text-gray-400">Remember me</span>
            </label>
          )}

          {/* Error message */}
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-2.5 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 font-semibold text-white shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-orange-400 transition disabled:opacity-50"
          >
            {busy ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
          </button>

          {/* Switch between sign in / sign up */}
          <div className="text-center text-sm text-gray-400">
            {mode === "signin" ? (
              <>
                Don't have an account?{" "}
                <button type="button" onClick={() => { setMode("signup"); setError(null); }} className="text-amber-400 hover:text-amber-300 font-medium">
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button type="button" onClick={() => { setMode("signin"); setError(null); }} className="text-amber-400 hover:text-amber-300 font-medium">
                  Sign in
                </button>
              </>
            )}
          </div>

          {/* Guest mode button */}
          <div className="pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={handleGuest}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 transition"
            >
              <Sparkles size={16} />
              Continue as Guest
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
