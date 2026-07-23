import type { Metadata } from "next";
import { CeloConsole } from "@/components/celo-console";

export const metadata: Metadata = {
  title: "Open Today's Celo Arena",
  description:
    "Open today's PatchRush arena on Celo in live or demo mode with MiniPay or another Celo-compatible wallet.",
  alternates: {
    canonical: "/celo"
  },
  openGraph: {
    title: "Open Today's Celo Arena | PatchRush",
    description:
      "Open today's PatchRush arena on Celo in live or demo mode with MiniPay or another Celo-compatible wallet.",
    url: "/celo",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "PatchRush Celo arena preview"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Open Today's Celo Arena | PatchRush",
    description:
      "Open today's PatchRush arena on Celo in live or demo mode with MiniPay or another Celo-compatible wallet.",
    images: [
      {
        url: "/og.png",
        alt: "PatchRush Celo arena preview"
      }
    ]
  }
};

export default function CeloPage() {
  return <CeloConsole />;
}
