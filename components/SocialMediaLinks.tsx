"use client";

import { useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";

export const SOCIAL_MEDIA_LINKS = [
  { name: "YouTube", href: "https://www.youtube.com/channel/UC49C6pgblg6MsnRv-93MqeA", platform: "youtube" },
  { name: "Instagram", href: "https://www.instagram.com/youguard.cn/", platform: "instagram" },
  { name: "Facebook", href: "https://www.facebook.com/profile.php?id=61592775856601", platform: "facebook" },
  { name: "TikTok", href: "https://www.tiktok.com/@youguardevroy?is_from_webapp=1&sender_device=pc", platform: "tiktok" },
] as const;

type Platform = (typeof SOCIAL_MEDIA_LINKS)[number]["platform"];
type Variant = "dropdown" | "mobile-menu" | "footer";

function SocialIcon({ platform }: { platform: Platform }) {
  if (platform === "youtube") {
    return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z" /></svg>;
  }
  if (platform === "instagram") {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".75" fill="currentColor" stroke="none" /></svg>;
  }
  if (platform === "facebook") {
    return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.8 21v-8h2.7l.4-3.1h-3.1V8c0-.9.3-1.5 1.6-1.5H17V3.7c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2H7.5V13h2.8v8h3.5Z" /></svg>;
  }
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.7 3c.5 1.4 1.5 2.5 2.8 3.1v3.1a8.5 8.5 0 0 1-3.1-.9v6.2a6.1 6.1 0 1 1-5.3-6v3.2a3 3 0 1 0 2.1 2.8V3h3.5Z" /></svg>;
}

function SocialLink({ item, className, showName = true }: { item: (typeof SOCIAL_MEDIA_LINKS)[number]; className: string; showName?: boolean }) {
  return (
    <a href={item.href} target="_blank" rel="noopener noreferrer" aria-label={`Visit Youguard on ${item.name}`} className={className}>
      <SocialIcon platform={item.platform} />
      {showName && <span>{item.name}</span>}
    </a>
  );
}

export function SocialMediaLinks({ variant }: { variant: Variant }) {
  const { t } = useTranslation();
  const title = t("nav.socialMedia", "Social Media");
  const [open, setOpen] = useState(false);

  if (variant === "dropdown") {
    return (
      <div className="nav-group relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
        <button type="button" className="nav-link flex items-center gap-1.5" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((current) => !current)}>
          {title}
          <svg className="h-2 w-2 opacity-50" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4" /></svg>
        </button>
        <div role="menu" aria-label={title} className="nav-dropdown glass absolute left-1/2 top-[calc(100%+12px)] min-w-[190px] rounded-[14px] transition-all duration-200" style={{ borderColor: "rgba(16,185,129,0.2)", opacity: open ? 1 : 0, visibility: open ? "visible" : "hidden", pointerEvents: open ? "auto" : "none", transform: open ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(-4px)" }}>
          {SOCIAL_MEDIA_LINKS.map((item, index) => <SocialLink key={item.platform} item={item} className={`flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold tracking-[.12em] uppercase text-gray-400 transition-colors hover:bg-white/5 hover:text-white ${index === 0 ? "rounded-t-[14px]" : ""} ${index === SOCIAL_MEDIA_LINKS.length - 1 ? "rounded-b-[14px]" : ""}`} />)}
        </div>
      </div>
    );
  }

  if (variant === "mobile-menu") {
    return (
      <section aria-label={title} className="border-y border-white/10 py-5">
        <p className="mb-3 text-[10px] font-black uppercase tracking-[.22em] text-[#dfba73]">{title}</p>
        <div className="grid grid-cols-2 gap-2">
          {SOCIAL_MEDIA_LINKS.map((item) => <SocialLink key={item.platform} item={item} className="flex min-h-11 items-center gap-2 rounded-lg border border-white/10 px-3 text-sm font-bold text-slate-200 transition hover:border-[#5ee6d8]/60 hover:text-[#5ee6d8]" />)}
        </div>
      </section>
    );
  }

  return (
    <section aria-label={title} className="mb-8 flex flex-col items-center gap-3 border-t border-white/10 pt-7 sm:mb-10 sm:flex-row sm:justify-between">
      <p className="text-[10px] font-black uppercase tracking-[.22em] text-theme">{title}</p>
      <div className="grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto">
        {SOCIAL_MEDIA_LINKS.map((item) => <SocialLink key={item.platform} item={item} showName={false} className="grid min-h-12 place-items-center rounded-xl border border-white/15 p-3 text-slate-300 transition hover:border-[#dfba73]/70 hover:bg-white/10 hover:text-white sm:h-11 sm:min-h-0 sm:w-11" />)}
      </div>
    </section>
  );
}
