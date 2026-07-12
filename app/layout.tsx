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
    images: ["/og.png"]
  },
  twitter: {
    card: "summary_large_image",
    title: "PatchRush",
    description:
      "Claim territory. Build your score. Return tomorrow. Play the daily board on Celo or Stacks.",
    images: ["/og.png"]
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
