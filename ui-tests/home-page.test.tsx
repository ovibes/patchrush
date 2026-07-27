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
        "Pick a patch, earn more for smart placement, and shape a shared 6×6 arena one move at a time, whether you start in demo mode or jump into the live round."
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
        name: "Open today's Celo demo arena and connect a Celo-compatible wallet when the live round opens"
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "Open today's Stacks demo arena and connect a Stacks wallet when the live round opens"
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
});
