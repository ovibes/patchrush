import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  title: {
    default: "PatchRush",
    template: "%s | PatchRush"
  },
  description:
    "Claim territory, build your score, and return tomorrow in a daily on-chain board game for Celo and Stacks.",
  keywords: [
    "PatchRush",
    "on-chain game",
    "daily board game",
    "Celo game",
    "Stacks game",
    "territory game",
    "wallet game"
  ],
  applicationName: "PatchRush",
  icons: {
    icon: [
      {
        url: "/icon.svg",
        type: "image/svg+xml"
      },
      {
        url: "/icon-192.png",
        sizes: "192x192",
        type: "image/png"
      }
    ],
    shortcut: ["/icon.svg"],
    apple: [
      {
        url: "/icon-192.png",
        sizes: "192x192"
      }
    ]
  },
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "PatchRush",
    description:
      "Claim territory. Build your score. Return tomorrow. Play the daily board on Celo or Stacks.",
    url: "/",
    siteName: "PatchRush",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "PatchRush daily on-chain territory game preview"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "PatchRush",
    description:
      "Claim territory. Build your score. Return tomorrow. Play the daily board on Celo or Stacks.",
    images: [
      {
        url: "/og.png",
        alt: "PatchRush daily on-chain territory game preview"
      }
    ]
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#090b10"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
