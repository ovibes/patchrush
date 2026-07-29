import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const boardStatsMock = vi.fn(() => ({ claimed: 12 }));

vi.mock("@/components/network-picker-modal", () => ({
  NetworkPickerModal: ({
    triggerLabel,
    triggerText
  }: {
    triggerLabel?: string;
    triggerText?: string;
  }) => (
    <button type="button" aria-label={triggerLabel}>
      {triggerText ?? triggerLabel}
    </button>
  )
}));

vi.mock("@/components/game-board", () => ({
  GameBoard: () => <div>Board preview</div>
}));

vi.mock("@/lib/patchrush", () => ({
  getBoardStats: (...args: unknown[]) => boardStatsMock(...args),
  sampleCeloCells: []
}));

afterEach(() => {
  boardStatsMock.mockClear();
  vi.resetModules();
});

describe("HomePage", () => {
  it("keeps demo-only trigger labels aligned with preview copy", async () => {
    vi.doMock("@/lib/env", () => ({
      getCeloChainLabel: () => "Celo Sepolia",
      publicEnv: {
        talentProjectVerification: "",
        celoContractAddress: "",
        stacksContractAddress: "",
        stacksContractName: ""
      }
    }));

    const { default: HomePage } = await import("@/app/page");
    render(<HomePage />);

    expect(
      screen.getByRole("button", { name: "Preview today's arenas from the hero section" })
    ).toHaveTextContent("Preview today's arenas from the hero section");
    expect(
      screen.getByRole("button", { name: "Preview today's arenas from the board preview" })
    ).toHaveTextContent("Preview today's arenas");
    expect(
      screen.getByText(
        "No signup required. Preview the board in demo mode, then connect a wallet when the live round opens."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Pick a patch, earn more for smart placement, and shape a shared 6×6 arena one move at a time, whether you start in demo mode or join the live round."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Every move is clear before you preview it in demo mode or approve it live in your wallet."
      )
    ).toBeInTheDocument();
  });

  it("updates hero helper copy when a live arena is available", async () => {
    vi.doMock("@/lib/env", () => ({
      getCeloChainLabel: () => "Celo Mainnet",
      publicEnv: {
        talentProjectVerification: "",
        celoContractAddress: "0xabc",
        stacksContractAddress: "",
        stacksContractName: ""
      }
    }));

    const { default: HomePage } = await import("@/app/page");
    render(<HomePage />);

    expect(
      screen.getByRole("button", { name: "Choose today's arena from the hero section" })
    ).toHaveTextContent("Choose today's arena from the hero section");
    expect(
      screen.getByText(
        "No signup required. Preview the board in demo mode, or connect a wallet now to join the live round."
      )
    ).toBeInTheDocument();
  });

  it("uses live-round timing copy for demo-only arena cards", async () => {
    vi.doMock("@/lib/env", () => ({
      getCeloChainLabel: () => "Celo Sepolia",
      publicEnv: {
        talentProjectVerification: "",
        celoContractAddress: "",
        stacksContractAddress: "",
        stacksContractName: ""
      }
    }));

    const { default: HomePage } = await import("@/app/page");
    render(<HomePage />);

    expect(
      screen.getByRole("link", {
        name: "Celo arena demo. Connect a Celo-compatible wallet when the live round opens"
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "Stacks arena demo. Connect a Stacks wallet when the live round opens"
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Open the demo now, then connect a Celo-compatible wallet for quick mobile play when the live round opens."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Open the demo now, then connect a Stacks wallet for the same daily rules when the live round opens."
      )
    ).toBeInTheDocument();
  });

  it("front-loads live arena card labels with the network name", async () => {
    vi.doMock("@/lib/env", () => ({
      getCeloChainLabel: () => "Celo Mainnet",
      publicEnv: {
        talentProjectVerification: "",
        celoContractAddress: "0xabc",
        stacksContractAddress: "ST123",
        stacksContractName: "patchrush"
      }
    }));

    const { default: HomePage } = await import("@/app/page");
    render(<HomePage />);

    expect(
      screen.getByRole("link", {
        name: "Celo arena, live today. Open with MiniPay or another Celo-compatible wallet"
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "Stacks arena, live today. Open with Leather, Xverse, or another Stacks-compatible wallet"
      })
    ).toBeInTheDocument();
  });
});
