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

export const dynamic = "force-dynamic";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  style: ["normal"],
  display: "swap",
  variable: "--font-inter",
});

const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  style: ["normal"],
  display: "swap",
  variable: "--font-sans",
});

const notoSansSc = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal"],
  display: "swap",
  variable: "--font-sc",
});

const notoSansEthiopic = Noto_Sans_Ethiopic({
  subsets: ["ethiopic"],
  weight: ["400", "700"],
  style: ["normal"],
  display: "swap",
  variable: "--font-ethiopic",
});

export const metadata: Metadata = {
  title: "Youguard - Your Dedicated EV Sourcing Expert for Africa",
  description:
    "China's premier EV export partner for African dealers. Expert sourcing, transparent PDI, turnkey dealer empowerment.",
  icons: {
    icon: "/logo.svg",
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
