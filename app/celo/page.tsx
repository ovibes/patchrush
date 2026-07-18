import type { Metadata } from "next";
import { CeloConsole } from "@/components/celo-console";

export const metadata: Metadata = {
  title: "Play Today's Celo Arena",
  description:
    "Preview today's PatchRush arena on Celo, then jump into the live or demo round with MiniPay or another Celo-compatible wallet."
};

export default function CeloPage() {
  return <CeloConsole />;
}
