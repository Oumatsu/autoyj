import type { Metadata } from "next";
import "./globals.css";
import { SiteChrome } from "@/components/SiteChrome";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "autoYJ - Your Dedicated EV Sourcing Expert for Africa",
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
      className="font-sans"
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
                  if (locale === 'en') {
                    document.documentElement.classList.add('font-inter');
                    document.documentElement.classList.remove('font-sans', 'font-ethiopic');
                  } else if (locale === 'am') {
                    document.documentElement.classList.add('font-ethiopic');
                    document.documentElement.classList.remove('font-inter', 'font-sans');
                  } else {
                    document.documentElement.classList.add('font-sans');
                    document.documentElement.classList.remove('font-inter', 'font-ethiopic');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="font-inter">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
