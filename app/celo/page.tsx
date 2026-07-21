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
    url: "/celo"
  },
  twitter: {
    title: "Open Today's Celo Arena | PatchRush",
    description:
      "Open today's PatchRush arena on Celo in live or demo mode with MiniPay or another Celo-compatible wallet."
  }
};

export default function CeloPage() {
  return <CeloConsole />;
}
