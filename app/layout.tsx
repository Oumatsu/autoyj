import type { Metadata } from "next";
import { Noto_Sans_Ethiopic } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/SiteChrome";

const notoSansEthiopic = Noto_Sans_Ethiopic({
  subsets: ["ethiopic"],
  weight: ["400", "700"],
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
    <html lang="en" suppressHydrationWarning>
      <body className={notoSansEthiopic.variable}>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
