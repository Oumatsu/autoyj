import type { Metadata } from "next";
import { Inter, Noto_Sans_Ethiopic } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/SiteChrome";

export const dynamic = "force-dynamic";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-inter",
});

const notoSansEthiopic = Noto_Sans_Ethiopic({
  subsets: ["ethiopic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-ethiopic",
});

export const metadata: Metadata = {
  title: "autoYJ — Your Dedicated EV Sourcing Expert for Africa",
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
      lang="zh"
      dir="ltr"
      className={`${inter.variable} ${notoSansEthiopic.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const segments = window.location.pathname.split('/');
                  const locale = ['zh', 'en', 'am'].includes(segments[1]) ? segments[1] : 'zh';
                  document.documentElement.lang = locale;
                  if (locale === 'am') {
                    document.documentElement.classList.add('font-ethiopic');
                    document.documentElement.classList.remove('font-inter');
                  } else {
                    document.documentElement.classList.add('font-inter');
                    document.documentElement.classList.remove('font-ethiopic');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} font-inter`}>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
