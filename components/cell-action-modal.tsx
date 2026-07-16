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

  const row = cell.y + 1;
  const column = cell.x + 1;
  const claimed = Boolean(cell.owner);
  const actionLabel = !walletConnected
    ? "Connect wallet"
    : claimed
      ? pending
        ? "Boosting"
        : "Boost patch"
      : pending
        ? "Claiming"
        : "Claim patch";
  const actionGlyph = !walletConnected ? "CON" : claimed ? "BST" : "CLM";
  const actionHelp = !walletConnected
    ? `Connect ${walletLabel} to continue. No transaction is sent yet.`
    : claimed
      ? "Boost this claimed patch once from your wallet."
      : "Claim this open patch with your selected color.";
  const actionButtonLabel = !walletConnected
    ? `Connect ${walletLabel} to act on row ${row}, column ${column}`
    : claimed
      ? `Boost row ${row}, column ${column}`
      : `Claim row ${row}, column ${column}`;

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
        aria-describedby="cell-action-summary cell-action-help"
      >
        <div className="modal-heading">
          <span className="hud-tag">{networkLabel}</span>
          <button
            type="button"
            className="modal-close"
            aria-label="Close cell action"
            title="Close cell action"
            onClick={onClose}
          >
            X
          </button>
        </div>

        <h2 id="cell-action-title">Row {row}, column {column}</h2>
        <p id="cell-action-summary">{claimed ? "Claimed patch selected." : "Open patch selected."}</p>

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
              <dt>Patch color</dt>
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
            aria-label={actionButtonLabel}
            disabled={pending}
            onClick={runAction}
            title={actionButtonLabel}
          >
            <span className="button-glyph" aria-hidden="true">
              {actionGlyph}
            </span>
            {actionLabel}
          </button>
          <p id="cell-action-help">{actionHelp}</p>
        </div>

        {message ? (
          <div className="message-line modal-message" role="status">
            {message}
          </div>
        ) : null}
        {txUrl ? (
          <a
            className="tx-link"
            href={txUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open the ${networkLabel} explorer receipt in a new tab`}
            title={`Open the ${networkLabel} explorer receipt in a new tab`}
          >
            Open explorer receipt
          </a>
        ) : null}
      </div>
    </div>
  );
}
