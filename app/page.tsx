import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarClock, Grid3X3, Sparkles, Zap } from "lucide-react";
import { NetworkPickerModal } from "@/components/network-picker-modal";
import { GameBoard } from "@/components/game-board";
import { getCeloChainLabel, publicEnv } from "@/lib/env";
import { getBoardStats, sampleCeloCells } from "@/lib/patchrush";

export const metadata: Metadata = {
  title: "Preview Today's Board",
  description:
    "See today's PatchRush board, learn the rules, and jump into the live or demo arena on Celo or Stacks.",
  other: publicEnv.talentProjectVerification
    ? { "talentapp:project_verification": publicEnv.talentProjectVerification }
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
  const celoArenaLabel = `Open the ${celoReady ? "live" : "demo"} Celo arena`;
  const stacksArenaLabel = `Open the ${stacksReady ? "live" : "demo"} Stacks arena`;
  const celoArenaCta = `Open ${celoReady ? "live" : "demo"} Celo arena`;
  const stacksArenaCta = `Open ${stacksReady ? "live" : "demo"} Stacks arena`;

  return (
    <div className="landing-page">
      <section className="hero-section" aria-labelledby="home-title">
        <div className="hero-copy">
          <span className="eyebrow">
            <Sparkles aria-hidden="true" /> A fresh board every day at{" "}
            <time dateTime="00:00Z">00:00 UTC</time>
          </span>
          <h1 id="home-title">Claim territory.<br />Build your score.<br /><em>Return tomorrow.</em></h1>
          <p>
            Pick a patch, earn more for smart placement, and shape a shared 6×6 board—one
            quick on-chain move at a time.
          </p>
          <div className="hero-actions">
            <NetworkPickerModal
              celoNetworkLabel={getCeloChainLabel()}
              stacksNetworkLabel={stacksNetworkLabel}
              celoReady={celoReady}
              stacksReady={stacksReady}
            />
            <span>No signup. Just your wallet.</span>
          </div>
          <ul className="hero-proof" aria-label="Game highlights">
            <li><strong>3</strong> claims per day</li>
            <li><strong>36</strong> shared patches</li>
            <li><strong>2</strong> networks, same rules</li>
          </ul>
        </div>

        <div className="hero-board-wrap">
          <div className="hero-board-glow" aria-hidden="true" />
          <GameBoard
            cells={sampleCeloCells}
            selectedIndex={14}
            networkLabel="Today's board preview"
          />
          <div className="score-equation" aria-label="Selected patch scores 16 points">
            <span>Smart placement</span>
            <div><strong>10</strong><small>base</small><b>+</b><strong>2×3</strong><small>neighbors</small><b>=</b><strong>16</strong><small>points</small></div>
          </div>
        </div>
      </section>

      <section className="mechanics-section" aria-labelledby="how-title">
        <header className="section-heading">
          <span className="eyebrow">The whole game in 30 seconds</span>
          <h2 id="how-title">Simple to start.<br />Rewarding to place well.</h2>
          <p>Every move is clear before your wallet asks you to approve it.</p>
        </header>
        <div className="mechanics-grid">
          <article>
            <span className="step-icon"><Grid3X3 aria-hidden="true" /></span>
            <span className="step-number">01</span>
            <h3>Choose an open patch</h3>
            <p>Tap any open square. PatchRush shows its expected score before you commit.</p>
          </article>
          <article>
            <span className="step-icon"><Sparkles aria-hidden="true" /></span>
            <span className="step-number">02</span>
            <h3>Build beside others</h3>
            <p>Start with 10 points and add 3 for every occupied neighbor touching an edge.</p>
          </article>
          <article>
            <span className="step-icon"><Zap aria-hidden="true" /></span>
            <span className="step-number">03</span>
            <h3>Boost the board</h3>
            <p>Give a claimed patch one extra point. Every wallet can boost each patch once.</p>
          </article>
        </div>
      </section>

      <section className="daily-section" aria-labelledby="daily-title">
        <div>
          <span className="eyebrow"><CalendarClock aria-hidden="true" /> Made for a daily ritual</span>
          <h2 id="daily-title">Today matters.<br />Tomorrow resets.</h2>
          <p>
            You get three claims each UTC round. Browse earlier boards whenever you like;
            only today&apos;s board accepts new moves.
          </p>
        </div>
        <div className="daily-card">
          <span>Today&apos;s preview</span>
          <strong aria-label={`${stats.claimed} of 36 patches claimed today`}>
            {stats.claimed}
            <small aria-hidden="true">/36</small>
          </strong>
          <p>patches already claimed</p>
          <NetworkPickerModal
            celoNetworkLabel={getCeloChainLabel()}
            stacksNetworkLabel={stacksNetworkLabel}
            celoReady={celoReady}
            stacksReady={stacksReady}
          />
        </div>
      </section>

      <section className="network-explainer" aria-labelledby="network-title">
        <header className="section-heading compact">
          <span className="eyebrow">Your network, your choice</span>
          <h2 id="network-title">Same board rules.<br />Use the wallet you know.</h2>
        </header>
        <div className="network-summary-grid">
          <Link
            href="/celo"
            className="network-summary is-celo"
            aria-label={celoArenaLabel}
            title={celoArenaLabel}
          >
            <span className={celoReady ? "status-pill is-live" : "status-pill"}>{celoReady ? "Live" : "Demo"}</span>
            <strong>Celo</strong>
            <p>MiniPay-ready and designed for quick mobile play.</p>
            <span>{celoArenaCta} <ArrowRight aria-hidden="true" /></span>
          </Link>
          <Link
            href="/stacks"
            className="network-summary is-stacks"
            aria-label={stacksArenaLabel}
            title={stacksArenaLabel}
          >
            <span className={stacksReady ? "status-pill is-live" : "status-pill"}>{stacksReady ? "Live" : "Demo"}</span>
            <strong>Stacks</strong>
            <p>Connect with a Stacks wallet and play the same daily rules.</p>
            <span>{stacksArenaCta} <ArrowRight aria-hidden="true" /></span>
          </Link>
        </div>
      </section>
    </div>
  );
}
