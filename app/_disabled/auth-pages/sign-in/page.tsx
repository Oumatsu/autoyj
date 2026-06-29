"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

type AuthStep = "idle" | "loading" | "passkey" | "magic-link" | "magic-sent" | "oauth";
type OAuthProvider = "wechat" | "apple" | "google" | "facebook";

const oauthProviders: { id: OAuthProvider; label: string; icon: React.ReactNode; cls: string }[] = [
  { id: "wechat", label: "WeChat", icon: "W", cls: "bg-[#07C160] hover:bg-[#06AD56] text-white" },
  { id: "apple", label: "Apple", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 21.99 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 21.99C7.79 22.03 6.8 20.68 5.96 19.47C4.25 16.97 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/></svg>, cls: "bg-white hover:bg-gray-100 text-black" },
  { id: "google", label: "Google", icon: "G", cls: "bg-white hover:bg-gray-100 text-black border border-gray-300" },
  { id: "facebook", label: "Facebook", icon: "f", cls: "bg-[#1877F2] hover:bg-[#166FE5] text-white" },
];

export default function SignInPage() {
  const [step, setStep] = useState<AuthStep>("idle");
  const [error, setError] = useState<string | null>(null);
  const [magicEmail, setMagicEmail] = useState("");
  const [magicSent, setMagicSent] = useState(false);

  const handlePasskey = useCallback(async () => {
    setStep("loading");
    setError(null);
    try {
      const result = await authClient.signIn.passkey();
      if (result?.error) {
        setError("Passkey sign-in failed. Please try another method.");
        setStep("idle");
      }
    } catch {
      setError("This device doesn't support Passkey. Please try another method.");
      setStep("idle");
    }
  }, []);

  const handleOAuth = useCallback(async (provider: OAuthProvider) => {
    setStep("loading");
    setError(null);
    try {
      await authClient.signIn.social({ provider });
    } catch {
      setError(`${provider} sign-in failed`);
      setStep("idle");
    }
  }, []);

  const handleMagicLink = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!magicEmail.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    setStep("loading");
    setError(null);
    try {
      const result = await authClient.signIn.magicLink({ email: magicEmail });
      setMagicSent(true);
      setStep("idle");
    } catch {
      setError("Failed to send magic link. Please try again.");
      setStep("idle");
    }
  }, [magicEmail]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg pt-20 pb-20 px-4 relative z-10">
      <div className="absolute inset-0 z-0 opacity-30" style={{ background: "radial-gradient(ellipse 50% 50% at 50% 30%, rgba(16,185,129,.04) 0%, transparent 70%)" }} />

      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="flex items-center gap-2.5 justify-center mb-10">
          <div className="w-8 h-8 rounded flex items-center justify-center font-black italic text-black text-base" style={{ background: "linear-gradient(135deg,#D4AF37,#C5A059)" }}>A</div>
          <span className="text-lg font-black tracking-tighter uppercase italic"><span className="text-gray-400">auto</span><span className="text-theme">YJ</span></span>
        </Link>

        <div className="glass rounded-[2.5rem] p-8 md:p-10">
          <h1 className="text-2xl font-black italic text-white uppercase tracking-tight text-center mb-2">Sign In</h1>
          <p className="text-gray-500 text-xs text-center mb-8">Welcome back — choose your sign-in method</p>

          {error && (
            <div className="mb-6 p-4 rounded-xl text-center" style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)" }}>
              <p className="text-red-400 text-xs font-bold mb-2">Sign-In Failed</p>
              <p className="text-gray-400 text-xs">{error}</p>
              <button onClick={() => { setError(null); setStep("idle"); }} className="mt-2 text-[9px] font-black uppercase tracking-wider text-red-400 hover:text-red-300 transition">Try Again</button>
            </div>
          )}

          {magicSent && (
            <div className="mb-6 p-5 rounded-xl text-center" style={{ background: "rgba(16,185,129,.08)", border: "1px solid rgba(16,185,129,.25)" }}>
              <p className="text-accent text-sm font-bold mb-1">Magic Link Sent!</p>
              <p className="text-gray-400 text-xs">Check your inbox (and spam folder) and click the link to sign in</p>
            </div>
          )}

          {/* Priority 1: Passkey */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider bg-gold/20 text-gold">Priority 1</span>
            </div>
            <button
              onClick={handlePasskey}
              disabled={step === "loading"}
              className="w-full glass p-5 rounded-2xl text-left hover:border-gold/40 transition-all duration-300 group disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: "rgba(197,160,89,.15)" }}>K</div>
                <div>
                  <div className="text-white font-black uppercase tracking-wider text-xs group-hover:text-theme transition-colors">Passkey</div>
                  <div className="text-gray-500 text-[10px] font-light mt-0.5">Use your device biometric or PIN for the fastest sign-in</div>
                </div>
              </div>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-[8px] font-black uppercase tracking-widest text-gray-600">Or continue with</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          {/* Priority 2: OAuth */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider bg-accent/20 text-accent">Priority 2</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {oauthProviders.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleOAuth(p.id)}
                  disabled={step === "loading"}
                  className={`${p.cls} p-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition disabled:opacity-50`}
                >
                  <span>{p.icon}</span>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-[8px] font-black uppercase tracking-widest text-gray-600">Or continue with</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          {/* Priority 3: Magic Link */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider bg-white/5 text-gray-400">Priority 3</span>
            </div>
            <form onSubmit={handleMagicLink} className="space-y-3">
              <input
                type="email"
                value={magicEmail}
                onChange={(e) => setMagicEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-500 focus:border-gold outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={step === "loading"}
                className="w-full py-3.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition disabled:opacity-50"
                style={{ background: "rgba(255,255,255,.06)", color: "#9CA3AF", border: "1px solid rgba(255,255,255,.08)" }}
              >
                {step === "loading" ? "Processing..." : "Send Magic Link"}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-gray-500 text-xs font-light mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-accent hover:text-white transition underline-offset-2 hover:underline">
            Register
          </Link>
        </p>

        <p className="text-center text-gray-600 text-[9px] font-light mt-4">By signing in you agree to our Terms of Service and Privacy Policy</p>
      </div>
    </main>
  );
}
