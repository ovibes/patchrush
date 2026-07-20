import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  title: {
    default: "PatchRush Daily Territory Arena",
    template: "%s | PatchRush"
  },
  description:
    "PatchRush is a daily on-chain territory game for Celo and Stacks. Preview the board, compare wallet flows, and jump into the live or demo arena.",
  keywords: [
    "PatchRush",
    "on-chain game",
    "daily arena game",
    "Celo game",
    "Stacks game",
    "territory game",
    "wallet game"
  ],
  applicationName: "PatchRush",
  appleWebApp: {
    capable: true,
    title: "PatchRush",
    statusBarStyle: "black-translucent"
  },
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
    title: "Choose Today's Arena | PatchRush",
    description:
      "PatchRush is a daily on-chain territory game for Celo and Stacks. Preview the board, compare wallet flows, and jump into the live or demo arena.",
    url: "/",
    siteName: "PatchRush",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "PatchRush daily on-chain territory arena preview"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Choose Today's Arena | PatchRush",
    description:
      "PatchRush is a daily on-chain territory game for Celo and Stacks. Preview the board, compare wallet flows, and jump into the live or demo arena.",
    images: [
      {
        url: "/og.png",
        alt: "PatchRush daily on-chain territory arena preview"
      }
    ]
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
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
