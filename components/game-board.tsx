"use client";

import type { CSSProperties } from "react";
import {
  colorToHex,
  getBoardStats,
  shortAddress,
  type PatchCell
} from "@/lib/patchrush";

type GameBoardProps = {
  cells: PatchCell[];
  selectedIndex: number | null;
  networkLabel: string;
  onSelect?(cell: PatchCell): void;
  pendingClaimIndex?: number | null;
  pendingBoostIndex?: number | null;
};

export function GameBoard({
  cells,
  selectedIndex,
  networkLabel,
  onSelect,
  pendingClaimIndex,
  pendingBoostIndex
}: GameBoardProps) {
  const stats = getBoardStats(cells);

  return (
    <div className="arena-board-panel">
      <div className="arena-board-header">
        <div>
          <span className="hud-tag">{networkLabel}</span>
          <h2>Arena grid</h2>
        </div>
        <dl className="telemetry-row" aria-label="Board stats">
          <div>
            <dt>Claimed</dt>
            <dd>{stats.claimed}/36</dd>
          </div>
          <div>
            <dt>Boost</dt>
            <dd>{stats.boosts}</dd>
          </div>
          <div>
            <dt>Top</dt>
            <dd>{stats.topScore}</dd>
          </div>
        </dl>
      </div>

      <div className="patch-board" role="grid" aria-label={`${networkLabel} PatchRush board`}>
        {cells.map((cell) => {
          const claimed = Boolean(cell.owner);
          const selected = selectedIndex === cell.index;
          const pending = pendingClaimIndex === cell.index || pendingBoostIndex === cell.index;
          const style = claimed
            ? ({
                "--cell-color": colorToHex(cell.color)
              } as CSSProperties)
            : undefined;

          return (
            <button
              type="button"
              role="gridcell"
              className={[
                "patch-cell",
                claimed ? "is-claimed" : "is-open",
                selected ? "is-selected" : "",
                pending ? "is-pending" : ""
              ]
                .filter(Boolean)
                .join(" ")}
              key={cell.index}
              style={style}
              aria-selected={selected}
              aria-label={
                claimed
                  ? `Cell ${cell.x + 1}, ${cell.y + 1}, claimed by ${shortAddress(
                      cell.owner
                    )}, score ${cell.score}, boosts ${cell.boosts}`
                  : `Open cell ${cell.x + 1}, ${cell.y + 1}`
              }
              disabled={!onSelect}
              onClick={onSelect ? () => onSelect(cell) : undefined}
            >
              <span className="cell-coordinate">
                X{cell.x + 1} Y{cell.y + 1}
              </span>
              {claimed ? (
                <>
                  {selected ? <span className="cell-status-label">Boost</span> : null}
                  <strong>{cell.score + cell.boosts}</strong>
                  <small>{shortAddress(cell.owner)}</small>
                </>
              ) : (
                <span className={selected ? "open-marker is-selected" : "open-marker"}>
                  {selected ? "Claim" : "+"}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
