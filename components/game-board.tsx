"use client";

import { useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { Check, Plus } from "lucide-react";
import {
  BOARD_SIZE,
  colorToHex,
  getBoardStats,
  getContrastTextColor,
  getPredictedClaimScore,
  shortAddress,
  type BoardLoadState,
  type PatchCell
} from "@/lib/patchrush";

type GameBoardProps = {
  cells: PatchCell[];
  selectedIndex: number | null;
  networkLabel: string;
  walletAddress?: string;
  selectedHasBoosted?: boolean | null;
  onSelect?(cell: PatchCell): void;
  pendingClaimIndex?: number | null;
  pendingBoostIndex?: number | null;
  loadState?: BoardLoadState;
};

export function GameBoard({
  cells,
  selectedIndex,
  networkLabel,
  walletAddress = "",
  selectedHasBoosted,
  onSelect,
  pendingClaimIndex,
  pendingBoostIndex,
  loadState = "ready"
}: GameBoardProps) {
  const stats = getBoardStats(cells);
  const [focusIndex, setFocusIndex] = useState(selectedIndex ?? 0);
  const cellRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const interactive = Boolean(onSelect);
  const boardHeading = interactive ? "Arena grid" : "Board preview";

  const moveFocus = (nextIndex: number) => {
    const clamped = Math.max(0, Math.min(cells.length - 1, nextIndex));
    setFocusIndex(clamped);
    cellRefs.current[clamped]?.focus();
  };

  const handleGridKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!interactive) return;

    let nextIndex: number | null = null;
    if (event.key === "ArrowLeft") nextIndex = index % BOARD_SIZE === 0 ? index : index - 1;
    if (event.key === "ArrowRight") {
      nextIndex = index % BOARD_SIZE === BOARD_SIZE - 1 ? index : index + 1;
    }
    if (event.key === "ArrowUp") nextIndex = index - BOARD_SIZE;
    if (event.key === "ArrowDown") nextIndex = index + BOARD_SIZE;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = cells.length - 1;

    if (nextIndex !== null) {
      event.preventDefault();
      moveFocus(nextIndex);
    }
  };

  return (
    <section className="board-card" aria-label={`${networkLabel} board`}>
      <header className="board-card-header">
        <div>
          <span className="eyebrow">{networkLabel}</span>
          <h2>{boardHeading}</h2>
        </div>
        <div
          className="board-count"
          aria-label={`${stats.claimed} of 36 patches claimed`}
          aria-live="polite"
          aria-atomic="true"
        >
          <strong>{stats.claimed}</strong>
          <span>/ 36 claimed</span>
        </div>
      </header>

      <div
        className={`patch-board ${loadState === "loading" ? "is-loading" : ""}`}
        role="grid"
        aria-label={`${networkLabel} PatchRush board`}
        aria-rowcount={BOARD_SIZE}
        aria-colcount={BOARD_SIZE}
        aria-readonly={!interactive}
        aria-busy={loadState === "loading" || loadState === "refreshing"}
      >
        {cells.map((cell) => {
          const claimed = Boolean(cell.owner);
          const selected = selectedIndex === cell.index;
          const pending = pendingClaimIndex === cell.index || pendingBoostIndex === cell.index;
          const yours = Boolean(
            claimed && walletAddress && cell.owner.toLowerCase() === walletAddress.toLowerCase()
          );
          const predictedScore = getPredictedClaimScore(cells, cell.index);
          const totalScore = cell.score + cell.boosts;
          const style = claimed
            ? ({
                "--cell-color": colorToHex(cell.color),
                "--cell-foreground": getContrastTextColor(cell.color)
              } as CSSProperties)
            : undefined;
          const actionText = claimed
            ? selected && selectedHasBoosted
              ? "Already boosted by you."
              : "Select to view boost details."
            : `Estimated claim score ${predictedScore} points.`;
          const cellLabel = claimed
            ? `Patch row ${cell.y + 1}, column ${cell.x + 1}. ${
                yours ? "Owned by you" : `Owned by ${shortAddress(cell.owner)}`
              }. ${totalScore} points including ${cell.boosts} boosts. ${actionText}`
            : `Open patch row ${cell.y + 1}, column ${cell.x + 1}. ${actionText}`;

          return (
            <button
              type="button"
              role="gridcell"
              className={[
                "patch-cell",
                claimed ? "is-claimed" : "is-open",
                yours ? "is-yours" : "",
                selected ? "is-selected" : "",
                selected && selectedHasBoosted ? "is-boosted-by-you" : "",
                pending ? "is-pending" : ""
              ]
                .filter(Boolean)
                .join(" ")}
              key={cell.index}
              ref={(node) => {
                cellRefs.current[cell.index] = node;
              }}
              style={style}
              aria-rowindex={cell.y + 1}
              aria-colindex={cell.x + 1}
              aria-selected={selected}
              aria-label={cellLabel}
              title={cellLabel}
              disabled={!interactive}
              tabIndex={interactive ? (focusIndex === cell.index ? 0 : -1) : -1}
              onFocus={() => setFocusIndex(cell.index)}
              onKeyDown={(event) => handleGridKey(event, cell.index)}
              onClick={onSelect ? () => onSelect(cell) : undefined}
            >
              <span className="cell-coordinate">
                {cell.y + 1}.{cell.x + 1}
              </span>
              {claimed ? (
                <>
                  <strong>{cell.score}</strong>
                  <span className="cell-owner">{yours ? "Yours" : shortAddress(cell.owner)}</span>
                  {cell.boosts ? <span className="cell-boost-count">+{cell.boosts}</span> : null}
                  {selected && selectedHasBoosted ? (
                    <span className="cell-state-badge" aria-hidden="true">
                      <Check size={12} strokeWidth={3} /> Boosted
                    </span>
                  ) : null}
                </>
              ) : (
                <span className="open-score">
                  <Plus size={13} strokeWidth={3} /> {predictedScore}
                </span>
              )}
            </button>
          );
        })}
        {loadState === "loading" ? (
          <div className="board-loading" role="status">
            Loading board…
          </div>
        ) : null}
      </div>
    </section>
  );
}
