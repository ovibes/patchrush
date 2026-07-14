"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  LoaderCircle,
  RefreshCw,
  Sparkles,
  Wallet,
  X,
  Zap
} from "lucide-react";
import {
  BASE_SCORE,
  NEIGHBOR_BONUS,
  colorSwatches,
  colorToHex,
  formatRoundId,
  getBoardStats,
  getPredictedClaimScore,
  shiftRoundId,
  shortAddress,
  type BoardLoadState,
  type GameNetwork,
  type PatchCell,
  type PlayerRoundStats,
  type TransactionState
} from "@/lib/patchrush";
import { AccessibleDialog } from "./accessible-dialog";
import { GameBoard } from "./game-board";

type ArenaExperienceProps = {
  network: GameNetwork;
  networkLabel: string;
  networkDetail: string;
  configured: boolean;
  cells: PatchCell[];
  selectedIndex: number | null;
  selectedHasBoosted: boolean | null;
  color: number;
  walletAddress: string;
  walletName: string;
  playerStats: PlayerRoundStats;
  roundId: number;
  todayRoundId: number;
  loadState: BoardLoadState;
  loadError: string;
  transaction: TransactionState;
  pendingClaimIndex: number | null;
  pendingBoostIndex: number | null;
  onSelect(cell: PatchCell): void;
  onCloseSelection(): void;
  onColorChange(color: number): void;
  onConnect(): void | Promise<void>;
  onDisconnect?(): void | Promise<void>;
  onRefresh(): void | Promise<void>;
  onRoundChange(roundId: number): void;
  onClaim(): void | Promise<void>;
  onBoost(): void | Promise<void>;
};

const busyPhases = new Set([
  "connecting",
  "awaiting-signature",
  "submitted",
  "confirming"
]);

function useMobileInspector() {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 820px)");
    const update = () => setMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return mobile;
}

function StatusIcon({ transaction }: { transaction: TransactionState }) {
  if (transaction.phase === "confirmed") return <Check aria-hidden="true" />;
  if (transaction.phase === "failed") return <CircleAlert aria-hidden="true" />;
  return <LoaderCircle className="spin" aria-hidden="true" />;
}

export function ArenaExperience(props: ArenaExperienceProps) {
  const {
    network,
    networkLabel,
    networkDetail,
    configured,
    cells,
    selectedIndex,
    selectedHasBoosted,
    color,
    walletAddress,
    walletName,
    playerStats,
    roundId,
    todayRoundId,
    loadState,
    loadError,
    transaction,
    pendingClaimIndex,
    pendingBoostIndex,
    onSelect,
    onCloseSelection,
    onColorChange,
    onConnect,
    onDisconnect,
    onRefresh,
    onRoundChange,
    onClaim,
    onBoost
  } = props;
  const mobileInspector = useMobileInspector();
  const selectedCell = selectedIndex === null ? null : cells[selectedIndex] || null;
  const boardStats = getBoardStats(cells);
  const isToday = roundId === todayRoundId;
  const isBusy = busyPhases.has(transaction.phase);
  const modeLabel = configured ? "Live board" : "Demo board";
  const receiptLinkLabel = `View the ${networkLabel} transaction receipt in a new tab`;
  const refreshBoardLabel =
    loadState === "refreshing"
      ? `Refreshing the ${networkLabel} board`
      : `Refresh the ${networkLabel} board`;
  const retryBoardLabel = `Retry loading the ${networkLabel} board`;
  const predictedScore = selectedCell
    ? getPredictedClaimScore(cells, selectedCell.index)
    : BASE_SCORE;
  const occupiedNeighbors = Math.max(0, (predictedScore - BASE_SCORE) / NEIGHBOR_BONUS);

  const inspectorContent = useMemo<ReactNode>(() => {
    if (!selectedCell) {
      return (
        <div className="inspector-empty">
          <span className="inspector-orbit" aria-hidden="true">
            <Sparkles />
          </span>
          <h2>Choose a patch</h2>
          <p>
            Open patches show their estimated score. Claimed patches can receive one boost
            from each wallet.
          </p>
          <div className="mini-rule">
            <strong>10</strong>
            <span>base points</span>
          </div>
          <div className="mini-rule">
            <strong>+3</strong>
            <span>per adjacent patch</span>
          </div>
        </div>
      );
    }

    const claimed = Boolean(selectedCell.owner);
    const yours = Boolean(
      walletAddress && selectedCell.owner.toLowerCase() === walletAddress.toLowerCase()
    );
    let actionLabel = claimed ? "Boost this patch" : `Claim for ${predictedScore} pts`;
    let actionDisabled = isBusy;
    let actionHandler = claimed ? onBoost : onClaim;
    let actionHelp = claimed
      ? "A boost adds one point to the patch owner's score."
      : "Your wallet will ask you to approve the claim.";

    if (!configured) {
      actionLabel = "Demo preview";
      actionDisabled = true;
      actionHelp = "This route becomes playable when its contract address is configured.";
    } else if (!isToday) {
      actionLabel = "History is view-only";
      actionDisabled = true;
      actionHelp = "Return to today's board to claim or boost patches.";
    } else if (!walletAddress) {
      actionLabel = `Connect ${walletName}`;
      actionHandler = onConnect;
      actionHelp = "Connecting does not submit a transaction.";
    } else if (!claimed && playerStats.claimsRemaining === 0) {
      actionLabel = "All claims used";
      actionDisabled = true;
      actionHelp = "You can claim three patches per UTC round. You can still boost.";
    } else if (claimed && selectedHasBoosted === null) {
      actionLabel = "Checking boost…";
      actionDisabled = true;
    } else if (claimed && selectedHasBoosted) {
      actionLabel = "Already boosted";
      actionDisabled = true;
      actionHelp = "Each wallet can boost a patch once per round.";
    }

    return (
      <>
        <div className="inspector-heading">
          <div>
            <span className="eyebrow">Patch {selectedCell.y + 1}.{selectedCell.x + 1}</span>
            <h2 id="patch-inspector-title">{claimed ? "Claimed territory" : "Open territory"}</h2>
          </div>
          <button
            type="button"
            className="icon-button inspector-close"
            aria-label="Close patch details"
            title="Close patch details"
            onClick={onCloseSelection}
            data-autofocus={mobileInspector ? "true" : undefined}
          >
            <X aria-hidden="true" />
          </button>
        </div>

        {claimed ? (
          <>
            <div className="score-spotlight">
              <span>Total score</span>
              <strong>{selectedCell.score + selectedCell.boosts}</strong>
              <small>{selectedCell.score} claim + {selectedCell.boosts} boosts</small>
            </div>
            <dl className="inspector-data">
              <div>
                <dt>Owner</dt>
                <dd>{yours ? "You" : shortAddress(selectedCell.owner)}</dd>
              </div>
              <div>
                <dt>Your boost</dt>
                <dd>{!walletAddress ? "Connect to check" : selectedHasBoosted ? "Used" : "Available"}</dd>
              </div>
            </dl>
          </>
        ) : (
          <>
            <div className="score-spotlight is-open-score">
              <span>Estimated score</span>
              <strong>{predictedScore}</strong>
              <small>
                {BASE_SCORE} base + {occupiedNeighbors} × {NEIGHBOR_BONUS} adjacent
              </small>
            </div>
            <fieldset className="color-picker">
              <legend>Choose your patch color</legend>
              <div>
                {colorSwatches.map((swatch) => (
                  <button
                    type="button"
                    className={swatch.value === color ? "color-swatch is-selected" : "color-swatch"}
                    key={swatch.value}
                    style={{ backgroundColor: colorToHex(swatch.value) }}
                    aria-label={`Use ${swatch.label}`}
                    aria-pressed={swatch.value === color}
                    title={swatch.label}
                    onClick={() => onColorChange(swatch.value)}
                  >
                    {swatch.value === color ? <Check aria-hidden="true" /> : null}
                  </button>
                ))}
              </div>
            </fieldset>
          </>
        )}

        <div className="inspector-action">
          <button
            type="button"
            className="primary-button"
            disabled={actionDisabled}
            aria-describedby="patch-inspector-description"
            title={actionLabel}
            onClick={() => void actionHandler()}
          >
            {isBusy ? <LoaderCircle className="spin" aria-hidden="true" /> : claimed ? <Zap aria-hidden="true" /> : <Sparkles aria-hidden="true" />}
            {actionLabel}
          </button>
          <p id="patch-inspector-description">{actionHelp}</p>
        </div>
      </>
    );
  }, [
    selectedCell,
    walletAddress,
    configured,
    isToday,
    isBusy,
    walletName,
    playerStats.claimsRemaining,
    selectedHasBoosted,
    predictedScore,
    occupiedNeighbors,
    color,
    onBoost,
    onClaim,
    onConnect,
    onCloseSelection,
    onColorChange,
    mobileInspector
  ]);

  return (
    <div className={`play-page network-${network}`}>
      <section className="play-intro" aria-labelledby="arena-title">
        <div className="play-intro-copy">
          <span className="eyebrow">{networkLabel} · {networkDetail}</span>
          <h1 id="arena-title">{isToday ? "Today's arena" : "Round history"}</h1>
          <p>Choose a patch, see its score before you move, and make today count.</p>
        </div>
        <div className="network-switcher" aria-label="Choose network">
          <Link
            href="/celo"
            aria-current={network === "celo" ? "page" : undefined}
            aria-label="Switch to the Celo arena"
            title="Switch to the Celo arena"
          >
            Celo
          </Link>
          <Link
            href="/stacks"
            aria-current={network === "stacks" ? "page" : undefined}
            aria-label="Switch to the Stacks arena"
            title="Switch to the Stacks arena"
          >
            Stacks
          </Link>
        </div>
      </section>

      <section className="round-bar" aria-label="Round navigation">
        <div className="round-date">
          <CalendarDays aria-hidden="true" />
          <div>
            <span>{isToday ? "Playing now" : "Past round · view only"}</span>
            <strong>{formatRoundId(roundId)}</strong>
          </div>
        </div>
        <div className="round-controls">
          <button
            type="button"
            className="secondary-button"
            aria-label={`View the round before ${formatRoundId(roundId)}`}
            title={`View the round before ${formatRoundId(roundId)}`}
            onClick={() => onRoundChange(shiftRoundId(roundId, -1))}
          >
            <ChevronLeft aria-hidden="true" /> Previous
          </button>
          {!isToday ? (
            <button
              type="button"
              className="secondary-button"
              aria-label={`Return to today's round ${formatRoundId(todayRoundId)}`}
              title={`Return to today's round ${formatRoundId(todayRoundId)}`}
              onClick={() => onRoundChange(todayRoundId)}
            >
              Today
            </button>
          ) : null}
          <button
            type="button"
            className="secondary-button icon-only-mobile"
            disabled={roundId >= todayRoundId}
            aria-label={
              roundId >= todayRoundId
                ? `Already viewing today's round ${formatRoundId(todayRoundId)}`
                : `View the round after ${formatRoundId(roundId)}`
            }
            title={
              roundId >= todayRoundId
                ? `Already viewing today's round ${formatRoundId(todayRoundId)}`
                : `View the round after ${formatRoundId(roundId)}`
            }
            onClick={() => onRoundChange(Math.min(todayRoundId, shiftRoundId(roundId, 1)))}
          >
            Next <ChevronRight aria-hidden="true" />
          </button>
        </div>
      </section>

      {!isToday ? (
        <div className="info-banner" role="status">
          <CalendarDays aria-hidden="true" />
          <span>This round is part of history. Claims and boosts are available only on today&apos;s board.</span>
        </div>
      ) : null}

      {loadError ? (
        <div className="error-banner" role="alert">
          <CircleAlert aria-hidden="true" />
          <span>{loadError}</span>
          <button
            type="button"
            aria-label={retryBoardLabel}
            title={retryBoardLabel}
            onClick={() => void onRefresh()}
          >
            Reload board
          </button>
        </div>
      ) : null}

      {transaction.phase !== "idle" ? (
        <div
          className={`transaction-banner is-${transaction.phase}`}
          role={transaction.phase === "failed" ? "alert" : "status"}
          aria-live={transaction.phase === "failed" ? "assertive" : "polite"}
          aria-atomic="true"
        >
          <StatusIcon transaction={transaction} />
          <div>
            <strong>{transaction.phase === "confirmed" ? "Move complete" : transaction.phase === "failed" ? "Move not completed" : "Move in progress"}</strong>
            <span>{transaction.message}</span>
          </div>
          {transaction.txUrl ? (
            <a
              href={transaction.txUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={receiptLinkLabel}
              title={receiptLinkLabel}
            >
              Receipt <ArrowUpRight aria-hidden="true" />
            </a>
          ) : null}
        </div>
      ) : null}

      <section className="player-hud" aria-label="Player and board summary">
        <div className="hud-card wallet-hud">
          <span><Wallet aria-hidden="true" /> {walletName}</span>
          <strong className="mono">{walletAddress ? shortAddress(walletAddress) : configured ? "Not connected" : "Demo mode"}</strong>
          {configured ? (
            walletAddress && onDisconnect ? (
              <button
                type="button"
                aria-label={`Disconnect ${walletName}`}
                title={`Disconnect ${walletName}`}
                onClick={() => void onDisconnect()}
              >
                Disconnect
              </button>
            ) : !walletAddress ? (
              <button
                type="button"
                aria-label={`Connect ${walletName}`}
                title={`Connect ${walletName}`}
                onClick={() => void onConnect()}
              >
                Connect
              </button>
            ) : null
          ) : null}
        </div>
        <div className="hud-card">
          <span>Claims left</span>
          <strong
            aria-label={
              walletAddress
                ? `${playerStats.claimsRemaining} of 3 claims remaining`
                : "Claims remaining unavailable until wallet connects"
            }
          >
            {walletAddress ? playerStats.claimsRemaining : "—"}
            <small aria-hidden="true">/ 3</small>
          </strong>
        </div>
        <div className="hud-card">
          <span>Your score</span>
          <strong>{walletAddress ? playerStats.score : "—"}</strong>
        </div>
        <div className="hud-card">
          <span>{modeLabel}</span>
          <strong aria-label={`${boardStats.claimed} of 36 patches claimed`}>
            {boardStats.claimed}
            <small aria-hidden="true">/ 36</small>
          </strong>
          <button
            type="button"
            className="refresh-link"
            aria-label={refreshBoardLabel}
            title={refreshBoardLabel}
            onClick={() => void onRefresh()}
            disabled={loadState === "loading" || loadState === "refreshing"}
          >
            <RefreshCw className={loadState === "refreshing" ? "spin" : ""} aria-hidden="true" />
            {loadState === "refreshing" ? "Refreshing" : "Refresh"}
          </button>
        </div>
      </section>

      <main className="arena-layout">
        <GameBoard
          cells={cells}
          selectedIndex={selectedIndex}
          selectedHasBoosted={selectedHasBoosted}
          networkLabel={`${networkLabel} · ${modeLabel}`}
          walletAddress={walletAddress}
          onSelect={onSelect}
          pendingClaimIndex={pendingClaimIndex}
          pendingBoostIndex={pendingBoostIndex}
          loadState={loadState}
        />

        {!mobileInspector ? (
          <aside className="patch-inspector arena-inspector-desktop" aria-live="polite">
            {inspectorContent}
          </aside>
        ) : null}
      </main>

      {mobileInspector && selectedCell ? (
        <AccessibleDialog
          open
          onClose={onCloseSelection}
          labelledBy="patch-inspector-title"
          describedBy="patch-inspector-description"
          className="patch-inspector mobile-inspector"
        >
          {inspectorContent}
        </AccessibleDialog>
      ) : null}

      <details className="rules-panel">
        <summary>How scoring and limits work</summary>
        <div>
          <p>Every claim starts at 10 points and adds 3 for each occupied patch directly above, below, left, or right.</p>
          <p>Each wallet gets three claims per UTC round and can boost each claimed patch once.</p>
          <p>{configured ? `This is the live ${networkLabel} board.` : `This is a preview until the ${networkLabel} contract is configured.`}</p>
        </div>
      </details>
    </div>
  );
}
