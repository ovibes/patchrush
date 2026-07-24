import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarClock, Grid3X3, Sparkles, Zap } from "lucide-react";
import { NetworkPickerModal } from "@/components/network-picker-modal";
import { GameBoard } from "@/components/game-board";
import { getCeloChainLabel, publicEnv } from "@/lib/env";
import { getBoardStats, sampleCeloCells } from "@/lib/patchrush";

export const metadata: Metadata = {
  title: "Choose Today's Arena",
  description:
    "Preview today's PatchRush board, compare Celo and Stacks, and choose the live or demo arena that fits your wallet.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "Choose Today's Arena | PatchRush",
    description:
      "Preview today's PatchRush board, compare Celo and Stacks, and choose the live or demo arena that fits your wallet.",
    url: "/",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "PatchRush board preview and network comparison"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Choose Today's Arena | PatchRush",
    description:
      "Preview today's PatchRush board, compare Celo and Stacks, and choose the live or demo arena that fits your wallet.",
    images: [
      {
        url: "/og.png",
        alt: "PatchRush board preview and network comparison"
      }
    ]
  },
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
  const celoArenaCta = celoReady ? "Open today's live Celo arena" : "Open today's Celo demo arena";
  const stacksArenaCta = stacksReady
    ? "Open today's live Stacks arena"
    : "Open today's Stacks demo arena";
  const celoCardAriaLabel = celoReady
    ? "Open today's live Celo arena with MiniPay or another Celo-compatible wallet"
    : "Open today's Celo demo arena and connect a Celo-compatible wallet when live";
  const stacksCardAriaLabel = stacksReady
    ? "Open today's live Stacks arena with Leather, Xverse, or another Stacks-compatible wallet"
    : "Open today's Stacks demo arena and connect a Stacks wallet when live";
  const celoCardDescription = celoReady
    ? "MiniPay-ready and designed for quick mobile play."
    : "Open the demo now, then connect a Celo-compatible wallet for quick mobile play when live.";
  const stacksCardDescription = stacksReady
    ? "Built for Leather, Xverse, and other Stacks wallets."
    : "Open the demo now, then connect a Stacks wallet for the same daily rules when live.";

  return (
    <div className="landing-page">
      <section className="hero-section" aria-labelledby="home-title">
        <div className="hero-copy">
          <span className="eyebrow">
            <Sparkles aria-hidden="true" /> A fresh arena every day at{" "}
            <time dateTime="00:00" aria-label="midnight UTC">
              00:00 UTC
            </time>
          </span>
          <h1 id="home-title">Claim territory.<br />Build your score.<br /><em>Return tomorrow.</em></h1>
          <p>
            Pick a patch, earn more for smart placement, and shape a shared 6×6 arena one
            quick move at a time, whether you start in demo mode or jump into the live round.
          </p>
          <div className="hero-actions">
            <NetworkPickerModal
              celoNetworkLabel={getCeloChainLabel()}
              stacksNetworkLabel={stacksNetworkLabel}
              celoReady={celoReady}
              stacksReady={stacksReady}
              triggerLabel="Choose today's arena from the hero section"
            />
            <span>No signup required. Start in demo mode, then connect a wallet when you&apos;re ready.</span>
          </div>
          <ul className="hero-proof" aria-label="Game highlights">
            <li><strong>3</strong> claims per UTC day</li>
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
          <div
            className="score-equation"
            role="img"
            aria-label="Example scoring: a selected patch earns 16 points from a base 10 plus 3 points for each of 2 claimed patches touching one of its edges."
          >
            <span aria-hidden="true">Smart placement</span>
            <div aria-hidden="true"><strong>10</strong><small>base</small><b>+</b><strong>3×2</strong><small>edge-touching</small><b>=</b><strong>16</strong><small>points</small></div>
          </div>
        </div>
      </section>

      <section className="mechanics-section" aria-labelledby="how-title">
        <header className="section-heading">
          <span className="eyebrow">The whole game in 30 seconds</span>
          <h2 id="how-title">Simple to start.<br />Rewarding to place well.</h2>
          <p>Every move is clear before you preview it in demo mode or approve it live from your wallet.</p>
        </header>
        <div className="mechanics-grid">
          <article>
            <span className="step-icon"><Grid3X3 aria-hidden="true" /></span>
            <span className="step-number">01</span>
            <h3>Choose an open patch</h3>
            <p>Select any open patch. PatchRush shows its expected score before you commit.</p>
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
            You get three claims each UTC round. Browse earlier arenas whenever you like;
            only today&apos;s arena accepts new moves.
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
            triggerLabel="Choose an arena from the board preview"
          />
        </div>
      </section>

      <section className="network-explainer" aria-labelledby="network-title">
        <header className="section-heading compact">
          <span className="eyebrow">Your network, your choice</span>
          <h2 id="network-title" tabIndex={-1}>Same arena rules.<br />Use the wallet you know.</h2>
        </header>
        <div className="network-summary-grid">
          <Link
            href="/celo"
            className="network-summary is-celo"
            aria-label={celoCardAriaLabel}
          >
            <span className={celoReady ? "status-pill is-live" : "status-pill"}>{celoReady ? "Live" : "Demo"}</span>
            <strong>Celo</strong>
            <p>{celoCardDescription}</p>
            <span>{celoArenaCta} <ArrowRight aria-hidden="true" /></span>
          </Link>
          <Link
            href="/stacks"
            className="network-summary is-stacks"
            aria-label={stacksCardAriaLabel}
          >
            <span className={stacksReady ? "status-pill is-live" : "status-pill"}>{stacksReady ? "Live" : "Demo"}</span>
            <strong>Stacks</strong>
            <p>{stacksCardDescription}</p>
            <span>{stacksArenaCta} <ArrowRight aria-hidden="true" /></span>
          </Link>
        </div>
      </section>
    </div>
  );
}
