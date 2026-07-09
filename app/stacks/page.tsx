import type { Metadata } from "next";
import { StacksConsole } from "@/components/stacks-console";

export const metadata: Metadata = {
  title: "Play on Stacks",
  description:
    "Claim and boost PatchRush board cells on Stacks with Stacks Connect wallet signing."
};

export default function StacksPage() {
  return <StacksConsole />;
}
