import type { Metadata } from "next";
import { CeloConsole } from "@/components/celo-console";

export const metadata: Metadata = {
  title: "Play on Celo",
  description:
    "Preview today's PatchRush board on Celo, then claim and boost patches with a MiniPay-compatible wallet when the live arena is available."
};

export default function CeloPage() {
  return <CeloConsole />;
}
