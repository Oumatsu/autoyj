"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { createAuthClient } from "better-auth/react";
import { passkeyClient } from "@better-auth/passkey/client";

const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : "",
  plugins: [passkeyClient()],
});

type AuthStep = "idle" | "loading" | "passkey" | "magic-link" | "magic-sent" | "oauth";
type OAuthProvider = "wechat" | "apple" | "google" | "facebook";

const oauthProviders: { id: OAuthProvider; label: string; icon: string; cls: string }[] = [
  { id: "wechat", label: "WeChat", icon: "💬", cls: "bg-[#07C160] hover:bg-[#06AD56] text-white" },
  { id: "apple", label: "Apple", icon: "", cls: "bg-white hover:bg-gray-100 text-black" },
  { id: "google", label: "Google", icon: "G", cls: "bg-white hover:bg-gray-100 text-black border border-gray-300" },
  { id: "facebook", label: "Facebook", icon: "f", cls: "bg-[#1877F2] hover:bg-[#166FE5] text-white" },
];

function isChinese(): boolean {
  if (typeof navigator === "undefined") return false;
  const lang = navigator.language || "";
  return lang.startsWith("zh");
}

export default function RegisterPage() {
  const [step, setStep] = useState<AuthStep>("idle");
  const [error, setError] = useState<string | null>(null);
  const [magicEmail, setMagicEmail] = useState("");
  const [magicSent, setMagicSent] = useState(false);
  const [isCN, setIsCN] = useState(false);
  const [showPasskeyPrompt, setShowPasskeyPrompt] = useState(false);

  useEffect(() => {
    setIsCN(isChinese());
  }, []);

  const handlePasskey = useCallback(async () => {
    setStep("loading");
    setError(null);
    try {
      const result = await authClient.signIn.passkey();
      if (result?.error) {
        setError(isCN ? "Passkey 登录失败，请尝试其他方式" : "Passkey sign-in failed. Please try another method.");
        setStep("idle");
      }
    } catch {
      setError(isCN ? "该设备不支持 Passkey，请尝试其他方式" : "This device doesn't support Passkey. Please try another method.");
      setStep("idle");
    }
  }, [error, isCN]);

  const handleOAuth = useCallback(async (provider: OAuthProvider) => {
    setStep("loading");
    setError(null);
    try {
      await authClient.signIn.social({ provider });
    } catch {
      setError(isCN ? `${provider} 登录失败` : `${provider} sign-in failed`);
      setStep("idle");
    }
  }, [isCN]);

  const handleMagicLink = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!magicEmail.includes("@")) {
      setError(isCN ? "请输入有效的邮箱地址" : "Please enter a valid email address");
      return;
    }
    setStep("loading");
    setError(null);
    try {
      await (authClient as any).signIn.magicLink({ email: magicEmail });
      setMagicSent(true);
      setStep("idle");
    } catch {
      setError(isCN ? "邮件发送失败，请重试" : "Failed to send magic link. Please try again.");
      setStep("idle");
    }
  }, [magicEmail, isCN]);

  const t = isCN ? {
    title: "登录 / 注册",
    subtitle: "选择以下任意方式登录",
    passkey: "🔑 Passkey（优先推荐）",
    passkeyDesc: "使用设备生物识别或 PIN 码一键登录，最安全快捷",
    passkeyBtn: "使用 Passkey 登录",
    orContinue: "或选择其他方式继续",
    wechat: "微信登录",
    apple: "Apple 登录",
    magicLink: "📧 邮箱验证码登录",
    magicLinkDesc: "输入您的邮箱，我们将发送验证链接",
    emailPlaceholder: "请输入邮箱地址",
    sendLink: "发送验证链接",
    magicSentTitle: "验证链接已发送！",
    magicSentDesc: "请检查您的邮箱（包括垃圾邮件箱）并点击链接完成登录",
    errorTitle: "登录失败",
    tryAgain: "重试",
    passkeyPrompt: "🎉 登录成功！是否要添加 Passkey 以方便下次登录？",
    addPasskey: "添加 Passkey（推荐）",
    skip: "跳过",
    footer: "登录即表示您同意我们的服务条款和隐私政策",
    loading: "处理中...",
  } : {
    title: "Sign In / Register",
    subtitle: "Choose your preferred sign-in method",
    passkey: "🔑 Passkey (Recommended)",
    passkeyDesc: "Use your device biometric or PIN for the fastest, most secure sign-in",
    passkeyBtn: "Sign in with Passkey",
    orContinue: "Or continue with",
    wechat: "WeChat",
    apple: "Apple",
    google: "Google",
    facebook: "Facebook",
    magicLink: "📧 Magic Link",
    magicLinkDesc: "Enter your email and we'll send you a sign-in link",
    emailPlaceholder: "Enter your email",
    sendLink: "Send Magic Link",
    magicSentTitle: "Magic Link Sent!",
    magicSentDesc: "Check your inbox (and spam folder) and click the link to sign in",
    errorTitle: "Sign-In Failed",
    tryAgain: "Try Again",
    passkeyPrompt: "🎉 Signed in successfully! Would you like to add a Passkey for faster sign-in next time?",
    addPasskey: "Add Passkey (Recommended)",
    skip: "Skip",
    footer: "By signing in you agree to our Terms of Service and Privacy Policy",
    loading: "Processing...",
  };

  const visibleProviders = isCN
    ? oauthProviders.filter((p) => p.id === "wechat" || p.id === "apple")
    : oauthProviders;

  return (
    <>
      <main className="min-h-screen flex items-center justify-center bg-bg pt-20 pb-20 px-4 relative z-10">
        <div className="absolute inset-0 z-0 opacity-30" style={{ background: "radial-gradient(ellipse 50% 50% at 50% 30%, rgba(16,185,129,.04) 0%, transparent 70%)" }} />

        <div className="relative z-10 w-full max-w-md">
          <Link href="/" className="flex items-center gap-2.5 justify-center mb-10">
            <div className="w-8 h-8 rounded flex items-center justify-center font-black italic text-black text-base" style={{ background: "linear-gradient(135deg,#D4AF37,#C5A059)" }}>A</div>
            <span className="text-lg font-black tracking-tighter uppercase italic"><span className="text-gray-400">auto</span><span className="text-theme">YJ</span></span>
          </Link>

          <div className="glass rounded-[2.5rem] p-8 md:p-10">
            <h1 className="text-2xl font-black italic text-white uppercase tracking-tight text-center mb-2">{t.title}</h1>
            <p className="text-gray-500 text-xs text-center mb-8">{t.subtitle}</p>

            {error && (
              <div className="mb-6 p-4 rounded-xl text-center" style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)" }}>
                <p className="text-red-400 text-xs font-bold mb-2">{t.errorTitle}</p>
                <p className="text-gray-400 text-xs">{error}</p>
                <button onClick={() => { setError(null); setStep("idle"); }} className="mt-2 text-[9px] font-black uppercase tracking-wider text-red-400 hover:text-red-300 transition">{t.tryAgain}</button>
              </div>
            )}

            {magicSent && (
              <div className="mb-6 p-5 rounded-xl text-center" style={{ background: "rgba(16,185,129,.08)", border: "1px solid rgba(16,185,129,.25)" }}>
                <p className="text-accent text-sm font-bold mb-1">{t.magicSentTitle}</p>
                <p className="text-gray-400 text-xs">{t.magicSentDesc}</p>
              </div>
            )}

            {showPasskeyPrompt && (
              <div className="mb-6 p-5 rounded-xl text-center" style={{ background: "rgba(197,160,89,.08)", border: "1px solid rgba(197,160,89,.25)" }}>
                <p className="text-theme text-sm font-bold mb-3">{t.passkeyPrompt}</p>
                <div className="flex gap-3 justify-center">
                  <button onClick={handlePasskey} className="btn-primary px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider">{t.addPasskey}</button>
                  <button onClick={() => setShowPasskeyPrompt(false)} className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border border-white/10 text-gray-400 hover:text-white transition">{t.skip}</button>
                </div>
              </div>
            )}

            {/* Priority 1: Passkey */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider bg-gold/20 text-gold">🥇 Priority 1</span>
              </div>
              <button
                onClick={handlePasskey}
                disabled={step === "loading"}
                className="w-full glass p-5 rounded-2xl text-left hover:border-gold/40 transition-all duration-300 group disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: "rgba(197,160,89,.15)" }}>🔑</div>
                  <div>
                    <div className="text-white font-black uppercase tracking-wider text-xs group-hover:text-theme transition-colors">{t.passkey}</div>
                    <div className="text-gray-500 text-[10px] font-light mt-0.5">{t.passkeyDesc}</div>
                  </div>
                </div>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px bg-white/10 flex-1" />
              <span className="text-[8px] font-black uppercase tracking-widest text-gray-600">{t.orContinue}</span>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            {/* Priority 2: OAuth */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider bg-accent/20 text-accent">🥈 Priority 2</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {visibleProviders.map((p) => (
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
              <span className="text-[8px] font-black uppercase tracking-widest text-gray-600">{t.orContinue}</span>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            {/* Priority 3: Magic Link */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider bg-white/5 text-gray-400">🥉 Priority 3</span>
              </div>
              <form onSubmit={handleMagicLink} className="space-y-3">
                <input
                  type="email"
                  value={magicEmail}
                  onChange={(e) => setMagicEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-500 focus:border-gold outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={step === "loading"}
                  className="w-full py-3.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition disabled:opacity-50"
                  style={{ background: "rgba(255,255,255,.06)", color: "#9CA3AF", border: "1px solid rgba(255,255,255,.08)" }}
                >
                  {step === "loading" ? t.loading : t.sendLink}
                </button>
              </form>
            </div>
          </div>

          <p className="text-center text-gray-600 text-[9px] font-light mt-6">{t.footer}</p>
        </div>
      </main>
    </>
  );
}
