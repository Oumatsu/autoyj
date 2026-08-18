import type { Metadata } from "next";
import { Inter, Noto_Sans, Noto_Sans_SC, Noto_Sans_Ethiopic } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/SiteChrome";
import { defaultLocale, locales } from "@/i18n/config";

/**
 * Map each locale to its Tailwind font-family utility class.
 * Defined here (not inside JSX) so it is evaluated at build time and
 * serialized into the inline script via JSON.stringify.
 *
 * To add a new locale: update i18n/config.ts and add an entry here.
 */
const LOCALE_FONT_CLASS: Record<string, string> = {
  zh: "font-sans",   // Noto Sans SC
  en: "font-inter",  // Inter
  am: "font-ethiopic", // Noto Sans Ethiopic
  // new locales go here → config.ts drives the runtime list
};

/** All font-class names that the script may need to remove before adding one. */
const ALL_FONT_CLASSES = [...new Set(Object.values(LOCALE_FONT_CLASS))];

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  style: ["normal"],
  display: "swap",
  preload: false,
  variable: "--font-inter",
});

const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  style: ["normal"],
  display: "swap",
  preload: false,
  variable: "--font-sans",
});

const notoSansSc = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal"],
  display: "swap",
  preload: false,
  variable: "--font-sc",
});

const notoSansEthiopic = Noto_Sans_Ethiopic({
  subsets: ["ethiopic"],
  weight: ["400", "700"],
  style: ["normal"],
  display: "swap",
  preload: false,
  variable: "--font-ethiopic",
});

export const metadata: Metadata = {
  title: "Youguard - Your Dedicated EV Sourcing Expert for Africa",
  description:
    "China's premier EV export partner for African dealers. Expert sourcing, transparent PDI, turnkey dealer empowerment.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Youguard Auto",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang={defaultLocale}
      dir="ltr"
      className={`${inter.variable} ${notoSans.variable} ${notoSansSc.variable} ${notoSansEthiopic.variable} font-sans`}
      suppressHydrationWarning
    >
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#0b1425" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Youguard Auto" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />
        {/* next/font/google downloads fonts at build time — served from
            .vinext/fonts/. No CDN preconnect needed or wanted here. */}
        {/* Runs before React hydration: sets the correct lang attr and font
            class from the URL path. JSON.stringify keeps it in sync with
            i18n/config.ts — no locale name is hardcoded here. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var supportedLocales = ${JSON.stringify(locales)};
                  var defaultLocale = ${JSON.stringify(defaultLocale)};
                  var fontClasses = ${JSON.stringify(
                    Object.fromEntries(
                      locales.map((l) => [l, LOCALE_FONT_CLASS[l] ?? "font-sans"])
                    )
                  )};
                  var allFontClasses = ${JSON.stringify(ALL_FONT_CLASSES)};
                  var segments = window.location.pathname.split('/');
                  var locale = supportedLocales.includes(segments[1]) ? segments[1] : defaultLocale;
                  document.documentElement.lang = locale;
                  var targetClass = fontClasses[locale] || 'font-sans';
                  allFontClasses.forEach(function(cls) {
                    document.documentElement.classList.remove(cls);
                  });
                  document.documentElement.classList.add(targetClass);
                } catch (e) {}
              })();
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
                var refreshing = false;
                navigator.serviceWorker.addEventListener('controllerchange', function() {
                  if (!refreshing) {
                    refreshing = true;
                    window.location.reload();
                  }
                });

                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    try { reg.update(); } catch (e) {}
                    reg.addEventListener('updatefound', function() {
                      var newWorker = reg.installing;
                      if (newWorker) {
                        newWorker.addEventListener('statechange', function() {
                          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            newWorker.postMessage({ type: 'SKIP_WAITING' });
                          }
                        });
                      }
                    });
                  }).catch(function() {});
                });

                document.addEventListener('visibilitychange', function() {
                  if (document.visibilityState === 'visible') {
                    navigator.serviceWorker.getRegistration().then(function(reg) {
                      if (reg) { try { reg.update(); } catch (e) {} }
                    });
                  }
                });
              }
            `,
          }}
        />
      </head>
      <body>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
