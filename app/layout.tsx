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
    "A tiny on-chain territory game for daily Celo and Stacks board rounds.",
  applicationName: "PatchRush",
  openGraph: {
    title: "PatchRush",
    description:
      "Claim daily board territory, earn adjacency points, and boost patches on Celo or Stacks.",
    type: "website",
    images: ["/og.png"]
  },
  twitter: {
    card: "summary_large_image",
    title: "PatchRush",
    description:
      "Claim daily board territory, earn adjacency points, and boost patches on Celo or Stacks.",
    images: ["/og.png"]
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#07090f"
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
