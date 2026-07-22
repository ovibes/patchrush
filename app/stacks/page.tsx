import type { Metadata } from "next";
import { StacksConsole } from "@/components/stacks-console";

export const metadata: Metadata = {
  title: "Open Today's Stacks Arena",
  description:
    "Open today's PatchRush arena on Stacks in live or demo mode with Leather, Xverse, or another Stacks-compatible wallet.",
  alternates: {
    canonical: "/stacks"
  },
  openGraph: {
    title: "Open Today's Stacks Arena | PatchRush",
    description:
      "Open today's PatchRush arena on Stacks in live or demo mode with Leather, Xverse, or another Stacks-compatible wallet.",
    url: "/stacks",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "PatchRush Stacks arena preview"
      }
    ]
  },
  twitter: {
    title: "Open Today's Stacks Arena | PatchRush",
    description:
      "Open today's PatchRush arena on Stacks in live or demo mode with Leather, Xverse, or another Stacks-compatible wallet.",
    images: [
      {
        url: "/og.png",
        alt: "PatchRush Stacks arena preview"
      }
    ]
  }
};

export default function StacksPage() {
  return <StacksConsole />;
}
