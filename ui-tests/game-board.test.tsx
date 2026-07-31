import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { GameBoard } from "@/components/game-board";
import { buildEmptyBoard } from "@/lib/patchrush";

describe("GameBoard", () => {
  it("supports roving keyboard focus and selection", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const cells = buildEmptyBoard("celo");
    render(
      <GameBoard
        cells={cells}
        selectedIndex={null}
        networkLabel="Celo"
        onSelect={onSelect}
      />
    );

    const gridCells = screen.getAllByRole("gridcell");
    gridCells[0].focus();
    await user.keyboard("{ArrowRight}");
    expect(gridCells[1]).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(gridCells[7]).toHaveFocus();
    await user.keyboard("{End}");
    expect(gridCells[11]).toHaveFocus();
    await user.keyboard("{Meta>}{End}{/Meta}");
    expect(gridCells[35]).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledWith(cells[35]);
  });

  it("announces ownership, score, and available action", () => {
    const cells = buildEmptyBoard("celo");
    cells[0] = {
      ...cells[0],
      owner: "0x1234567890abcdef",
      color: 0x36d399,
      score: 13,
      boosts: 2
    };
    render(
      <GameBoard
        cells={cells}
        selectedIndex={0}
        selectedHasBoosted={false}
        networkLabel="Celo"
        walletAddress="0x1234567890abcdef"
        onSelect={() => undefined}
      />
    );

    expect(screen.getByRole("gridcell", { name: /owned by you/i })).toHaveAccessibleName(
      /15 points including 2 boosts/i
    );
  });

  it("moves the roving tab stop when selection changes externally", () => {
    const cells = buildEmptyBoard("celo");
    const { rerender } = render(
      <GameBoard
        cells={cells}
        selectedIndex={null}
        networkLabel="Celo"
        onSelect={() => undefined}
      />
    );

    rerender(
      <GameBoard
        cells={cells}
        selectedIndex={14}
        networkLabel="Celo"
        onSelect={() => undefined}
      />
    );

    const gridCells = screen.getAllByRole("gridcell");
    expect(gridCells[14]).toHaveAttribute("tabindex", "0");
    expect(gridCells[0]).toHaveAttribute("tabindex", "-1");
  });

  it("publishes keyboard shortcuts for assistive technology", () => {
    const cells = buildEmptyBoard("celo");
    render(
      <GameBoard
        cells={cells}
        selectedIndex={null}
        networkLabel="Celo"
        onSelect={() => undefined}
      />
    );

    expect(screen.getByRole("grid")).toHaveAttribute(
      "aria-keyshortcuts",
      "ArrowLeft ArrowRight ArrowUp ArrowDown Home End Control+Home Control+End Meta+Home Meta+End Enter Space"
    );
  });

  it("announces when a patch action is pending", () => {
    const cells = buildEmptyBoard("celo");
    render(
      <GameBoard
        cells={cells}
        selectedIndex={null}
        networkLabel="Celo"
        onSelect={() => undefined}
        pendingClaimIndex={0}
      />
    );

    expect(screen.getByRole("gridcell", { name: /transaction pending/i })).toHaveAccessibleName(
      /estimated claim score 10 points\. transaction pending\./i
    );
  });

  it("describes the board preview without calling it a sample board", () => {
    const cells = buildEmptyBoard("celo");
    cells[0] = {
      ...cells[0],
      owner: "0x1234567890abcdef",
      color: 0x36d399,
      score: 10,
      boosts: 0
    };

    render(
      <GameBoard
        cells={cells}
        selectedIndex={0}
        networkLabel="Today's board preview"
      />
    );

    expect(
      screen.getByText(/preview only\. 1 of 36 patches are already claimed in this board preview\./i)
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Today's board preview" })).toBeInTheDocument();
    expect(screen.getByRole("grid", { name: "Today's board preview grid" })).toBeInTheDocument();
    expect(screen.queryByText(/sample board/i)).not.toBeInTheDocument();
  });
});
