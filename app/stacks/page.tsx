import type { Metadata } from "next";
import { StacksConsole } from "@/components/stacks-console";

export const metadata: Metadata = {
  title: "Play Today's Stacks Arena",
  description:
    "Preview today's PatchRush arena on Stacks, then jump into the live or demo round with Leather, Xverse, or another Stacks wallet."
};

export default function StacksPage() {
  return <StacksConsole />;
}
