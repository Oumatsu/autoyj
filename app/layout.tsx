import type { Metadata } from "next";
import { Inter, Noto_Sans, Noto_Sans_SC, Noto_Sans_Ethiopic } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/SiteChrome";
import { defaultLocale } from "@/i18n/config";


const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const notoSans = Noto_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const notoSansSc = Noto_Sans_SC({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sc",
});

const notoSansEthiopic = Noto_Sans_Ethiopic({
  subsets: ["ethiopic"],
  display: "swap",
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
        <meta
          name="description"
          content="China's premier EV export partner for African dealers. Expert sourcing, transparent PDI, turnkey dealer empowerment."
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Youguard Auto" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />
        {/* next/font/google downloads fonts at build time — served from
            .vinext/fonts/. No CDN preconnect needed or wanted here. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    try { reg.update(); } catch (e) {}
                  }).catch(function() {});
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
