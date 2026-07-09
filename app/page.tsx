import type { Metadata } from "next";
import { NetworkPickerModal } from "@/components/network-picker-modal";
import { GameBoard } from "@/components/game-board";
import { getCeloChainLabel, publicEnv } from "@/lib/env";
import {
  getBoardStats,
  sampleCeloCells
} from "@/lib/patchrush";

export const metadata: Metadata = {
  other: publicEnv.talentProjectVerification
    ? {
        "talentapp:project_verification": publicEnv.talentProjectVerification
      }
    : undefined
};

export default function HomePage() {
  const stats = getBoardStats(sampleCeloCells);
  const celoReady = Boolean(publicEnv.celoContractAddress);
  const stacksReady = Boolean(
    publicEnv.stacksContractAddress && publicEnv.stacksContractName
  );
  const stacksNetworkLabel =
    publicEnv.stacksNetwork === "mainnet" ? "Stacks Mainnet" : "Stacks Testnet";

  return (
    <div className="landing-page">
      <section className="landing-hero" aria-labelledby="home-title">
        <div className="landing-hero-copy">
          <span className="hud-tag">Daily on-chain territory</span>
          <h1 id="home-title">PatchRush</h1>
          <p>
            Claim cells on a shared daily board, score adjacency bonuses, and
            boost territory on Celo or Stacks.
          </p>
          <NetworkPickerModal
            celoNetworkLabel={getCeloChainLabel()}
            stacksNetworkLabel={stacksNetworkLabel}
            celoReady={celoReady}
            stacksReady={stacksReady}
          />
        </div>

        <div className="landing-hero-panel" aria-label="PatchRush quick facts">
          <span>6x6 board</span>
          <strong>{stats.claimed}/36 claimed in preview</strong>
          <small>Celo and Stacks routes share the same rules.</small>
        </div>
      </section>

      <section className="landing-layer" aria-labelledby="how-title">
        <div className="section-heading-clean">
          <span className="hud-tag">How it works</span>
          <h2 id="how-title">Three moves, one daily board.</h2>
        </div>
        <div className="how-grid">
          <article>
            <span>1</span>
            <h3>Pick a cell</h3>
            <p>Open cells can be claimed. Claimed cells can be boosted.</p>
          </article>
          <article>
            <span>2</span>
            <h3>Score placement</h3>
            <p>Every claim starts at 10 and gets +3 per occupied neighbor.</p>
          </article>
          <article>
            <span>3</span>
            <h3>Return daily</h3>
            <p>Each UTC round has a fresh board and a three-claim limit.</p>
          </article>
        </div>
      </section>

      <section className="landing-preview" aria-labelledby="preview-title">
        <GameBoard
          cells={sampleCeloCells}
          selectedIndex={14}
          networkLabel="Demo board preview"
        />

        <aside className="hud-panel scoreboard-panel">
          <span className="hud-tag">Preview</span>
          <h2 id="preview-title">Board shape</h2>
          <p>
            This sample board shows the scoring texture. The real play routes
            keep the board first and open a cell modal when you click.
          </p>
          <dl className="score-ledger" aria-label="Preview board stats">
            <div>
              <dt>Cells</dt>
              <dd>{stats.claimed}/36</dd>
            </div>
            <div>
              <dt>Boosts</dt>
              <dd>{stats.boosts}</dd>
            </div>
            <div>
              <dt>Peak</dt>
              <dd>{stats.topScore}</dd>
            </div>
          </dl>
          <div className="rules-stack" aria-label="Round rules">
            <span>3 claims / wallet</span>
            <span>+3 orthogonal bonus</span>
            <span>1 boost / wallet / cell</span>
          </div>
        </aside>
      </section>

      <section className="network-readiness" aria-label="Network readiness">
        <div>
          <span className="hud-tag">Celo</span>
          <strong>{getCeloChainLabel()}</strong>
          <p>{celoReady ? "Contract configured." : "Sample mode until deployment."}</p>
        </div>
        <div>
          <span className="hud-tag">Stacks</span>
          <strong>{stacksNetworkLabel}</strong>
          <p>{stacksReady ? "Contract configured." : "Sample mode until deployment."}</p>
        </div>
      </section>
    </div>
  );
}
