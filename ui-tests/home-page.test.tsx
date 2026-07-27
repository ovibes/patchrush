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
  });
});
