import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ArenaExperience } from "@/components/arena-experience";
import {
  buildEmptyBoard,
  emptyPlayerRoundStats,
  idleTransaction,
  type PatchCell
} from "@/lib/patchrush";

function renderArena(overrides: Partial<Parameters<typeof ArenaExperience>[0]> = {}) {
  const cells = buildEmptyBoard("celo");
  const props: Parameters<typeof ArenaExperience>[0] = {
    network: "celo",
    networkLabel: "Celo",
    networkDetail: "Mainnet",
    configured: true,
    cells,
    selectedIndex: 0,
    selectedHasBoosted: false,
    color: 0x36d399,
    walletAddress: "0x1234567890abcdef",
    walletName: "Celo wallet",
    playerStats: emptyPlayerRoundStats,
    roundId: 20260710,
    todayRoundId: 20260710,
    loadState: "ready",
    loadError: "",
    transaction: idleTransaction,
    pendingClaimIndex: null,
    pendingBoostIndex: null,
    onSelect: vi.fn(),
    onCloseSelection: vi.fn(),
    onColorChange: vi.fn(),
    onConnect: vi.fn(),
    onRefresh: vi.fn(),
    onRoundChange: vi.fn(),
    onClaim: vi.fn(),
    onBoost: vi.fn(),
    ...overrides
  };
  return render(<ArenaExperience {...props} />);
}

describe("ArenaExperience", () => {
  it("labels unconfigured actions as preview only", () => {
    renderArena({ configured: false, walletAddress: "" });
    expect(screen.getByRole("button", { name: "Preview only" })).toBeDisabled();
    expect(screen.getByText(/demo mode/i)).toBeInTheDocument();
  });

  it("makes historical rounds view-only", () => {
    renderArena({ roundId: 20260709 });
    expect(screen.getByRole("button", { name: "History is view-only" })).toBeDisabled();
    expect(screen.getByText(/claims and boosts are available only on today's board/i)).toBeInTheDocument();
  });

  it("shows boost eligibility for a claimed patch", () => {
    const cells = buildEmptyBoard("celo");
    const claimed: PatchCell = {
      ...cells[0],
      owner: "0xabcdef1234567890",
      color: 0xcf3d7a,
      score: 13,
      boosts: 2
    };
    cells[0] = claimed;
    renderArena({ cells, selectedHasBoosted: true });

    expect(screen.getByRole("button", { name: "Already boosted" })).toBeDisabled();
    expect(screen.getByText("15")).toBeInTheDocument();
  });

  it("keeps transaction feedback outside the patch action", () => {
    renderArena({
      transaction: {
        phase: "confirming",
        message: "Waiting for confirmation…",
        txUrl: "https://example.com/tx"
      }
    });
    expect(screen.getByRole("status")).toHaveTextContent("Waiting for confirmation");
    expect(screen.getByRole("link", { name: /receipt/i })).toHaveAttribute(
      "href",
      "https://example.com/tx"
    );
  });
});
