import type { Metadata } from "next";
import { CeloConsole } from "@/components/celo-console";

export const metadata: Metadata = {
  title: "Play on Celo",
  description:
    "Claim and boost PatchRush board cells on Celo with MiniPay-compatible wallet handling."
};

export default function CeloPage() {
  return <CeloConsole />;
}
