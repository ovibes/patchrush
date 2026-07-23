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
});
