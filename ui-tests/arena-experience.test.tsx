import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ArenaExperience } from "@/components/arena-experience";
import { CellActionModal } from "@/components/cell-action-modal";
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
    expect(screen.getByRole("button", { name: "Demo preview only" })).toBeDisabled();
    expect(
      screen.getByText(
        "Choose a patch, preview its score, and practice today's arena before the live round opens."
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/demo mode/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Celo wallet demo mode")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Claims remaining unavailable in demo mode")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Score unavailable in demo mode")).toBeInTheDocument();
  });

  it("makes historical rounds view-only", () => {
    renderArena({ roundId: 20260709 });
    expect(screen.getByRole("button", { name: "History is view-only" })).toBeDisabled();
    expect(screen.getByText(/claims and boosts are available only on today's arena/i)).toBeInTheDocument();
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

  it("uses the updated wallet wording for claimed patch boosts", () => {
    render(
      <CellActionModal
        cell={{
          x: 0,
          y: 0,
          index: 0,
          owner: "0xabcdef1234567890",
          color: 0xcf3d7a,
          score: 13,
          boosts: 2
        }}
        color={0xcf3d7a}
        message=""
        networkLabel="Celo"
        onClaim={vi.fn()}
        onClose={vi.fn()}
        onConnect={vi.fn()}
        onBoost={vi.fn()}
        pending={false}
        roundId={20260710}
        txUrl=""
        walletConnected={true}
        walletLabel="Celo wallet"
      />
    );

    expect(screen.getByText("Boost this claimed patch once in your wallet.")).toBeInTheDocument();
  });

  it("announces the selected patch in the inspector", () => {
    renderArena();
    expect(screen.getByText("Selected patch 1.1. Open territory.")).toHaveAttribute(
      "aria-live",
      "polite"
    );
    expect(screen.getByText("Selected patch 1.1. Open territory.")).toHaveAttribute(
      "aria-atomic",
      "true"
    );
  });

  it("announces whether the viewed round is playable or history", () => {
    const { rerender } = renderArena();
    expect(
      screen.getByText(/Viewing today's playable round .*UTC\./)
    ).toHaveAttribute("aria-live", "polite");

    rerender(
      <ArenaExperience
        network="celo"
        networkLabel="Celo"
        networkDetail="Mainnet"
        configured={true}
        cells={buildEmptyBoard("celo")}
        selectedIndex={0}
        selectedHasBoosted={false}
        color={0x36d399}
        walletAddress="0x1234567890abcdef"
        walletName="Celo wallet"
        playerStats={emptyPlayerRoundStats}
        roundId={20260709}
        todayRoundId={20260710}
        loadState="ready"
        loadError=""
        transaction={idleTransaction}
        pendingClaimIndex={null}
        pendingBoostIndex={null}
        onSelect={vi.fn()}
        onCloseSelection={vi.fn()}
        onColorChange={vi.fn()}
        onConnect={vi.fn()}
        onRefresh={vi.fn()}
        onRoundChange={vi.fn()}
        onClaim={vi.fn()}
        onBoost={vi.fn()}
      />
    );

    expect(
      screen.getByText(/Viewing past round .*UTC\. History is view only\./)
    ).toHaveAttribute("aria-atomic", "true");
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
