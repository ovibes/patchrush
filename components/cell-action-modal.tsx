"use client";

import { colorToHex, shortAddress, type PatchCell } from "@/lib/patchrush";

type CellActionModalProps = {
  cell: PatchCell | null;
  color: number;
  message: string;
  networkLabel: string;
  onClaim(): void | Promise<void>;
  onClose(): void;
  onConnect(): void | Promise<void>;
  onBoost(): void | Promise<void>;
  pending: boolean;
  roundId: number;
  txUrl: string;
  walletConnected: boolean;
  walletLabel: string;
};

export function CellActionModal({
  cell,
  color,
  message,
  networkLabel,
  onClaim,
  onClose,
  onConnect,
  onBoost,
  pending,
  roundId,
  txUrl,
  walletConnected,
  walletLabel
}: CellActionModalProps) {
  if (!cell) return null;

  const claimed = Boolean(cell.owner);
  const actionLabel = !walletConnected
    ? "Connect wallet"
    : claimed
      ? pending
        ? "Boosting"
        : "Boost cell"
      : pending
        ? "Claiming"
        : "Claim cell";
  const actionGlyph = !walletConnected ? "CON" : claimed ? "BST" : "CLM";
  const actionHelp = !walletConnected
    ? `Connect ${walletLabel} to continue. No transaction is sent yet.`
    : claimed
      ? "Boost this claimed cell once from your wallet."
      : "Claim this open cell with your selected color.";

  const runAction = () => {
    if (!walletConnected) {
      void onConnect();
      return;
    }

    if (claimed) {
      void onBoost();
      return;
    }

    void onClaim();
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <div
        className="cell-action-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cell-action-title"
      >
        <div className="modal-heading">
          <span className="hud-tag">{networkLabel}</span>
          <button
            type="button"
            className="modal-close"
            aria-label="Close cell action"
            onClick={onClose}
          >
            X
          </button>
        </div>

        <h2 id="cell-action-title">
          Cell {cell.x + 1}, {cell.y + 1}
        </h2>
        <p>{claimed ? "Claimed cell selected." : "Open cell selected."}</p>

        <dl className="modal-data-grid">
          <div>
            <dt>Round</dt>
            <dd>{roundId}</dd>
          </div>
          {claimed ? (
            <>
              <div>
                <dt>Owner</dt>
                <dd>{shortAddress(cell.owner)}</dd>
              </div>
              <div>
                <dt>Score</dt>
                <dd>{cell.score + cell.boosts}</dd>
              </div>
            </>
          ) : (
            <div>
              <dt>Claim color</dt>
              <dd className="modal-color-value">
                <span style={{ backgroundColor: colorToHex(color) }} aria-hidden="true" />
                {colorToHex(color)}
              </dd>
            </div>
          )}
        </dl>

        <div className="modal-action-panel">
          <button
            type="button"
            className={claimed ? "command-button magenta" : "command-button"}
            disabled={pending}
            onClick={runAction}
          >
            <span className="button-glyph" aria-hidden="true">
              {actionGlyph}
            </span>
            {actionLabel}
          </button>
          <p>{actionHelp}</p>
        </div>

        {message ? (
          <div className="message-line modal-message" role="status">
            {message}
          </div>
        ) : null}
        {txUrl ? (
          <a className="tx-link" href={txUrl} target="_blank" rel="noreferrer">
            Open explorer receipt
          </a>
        ) : null}
      </div>
    </div>
  );
}
