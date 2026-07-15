import type { Metadata } from "next";
import { StacksConsole } from "@/components/stacks-console";

export const metadata: Metadata = {
  title: "Play on Stacks",
  description:
    "Preview today's PatchRush board on Stacks, then claim and boost patches with Stacks Connect when the live arena is available."
};

export default function StacksPage() {
  return <StacksConsole />;
}
