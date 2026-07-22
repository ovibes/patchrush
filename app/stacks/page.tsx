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
    url: "/stacks"
  },
  twitter: {
    title: "Open Today's Stacks Arena | PatchRush",
    description:
      "Open today's PatchRush arena on Stacks in live or demo mode with Leather, Xverse, or another Stacks-compatible wallet."
  }
};

export default function StacksPage() {
  return <StacksConsole />;
}
