"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { publicEnv } from "@/lib/env";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const onHomePage = pathname === "/";
  const homeLinkLabel = onHomePage ? "Current page: PatchRush home" : "Open PatchRush home";
  const celoReady = Boolean(publicEnv.celoContractAddress);
  const stacksReady = Boolean(
    publicEnv.stacksContractAddress && publicEnv.stacksContractName
  );
  const playHref = pathname.startsWith("/stacks") ? "/stacks" : "/celo";
  const playLabel = playHref === "/stacks" ? "Stacks" : "Celo";
  const playReady = playHref === "/stacks" ? stacksReady : celoReady;
  const viewingArena = pathname === playHref;
  const playLinkHref = onHomePage ? "/#network-title" : playHref;
  const currentArenaText = `Today's ${playReady ? "live" : "demo"} ${playLabel} arena`;
  const playLinkText = onHomePage
    ? celoReady || stacksReady
      ? "Choose today's arena"
      : "Preview today's arenas"
    : currentArenaText;
  const playLinkLabel = onHomePage
    ? celoReady || stacksReady
      ? "Jump to today's arena chooser section"
      : "Jump to today's arena preview section"
    : viewingArena
      ? `Current page: ${currentArenaText}`
      : `Open ${currentArenaText}`;
  const homeFooterLabel = homeLinkLabel;
  const celoFooterTextShort = "Celo arena";
  const celoFooterText = celoReady ? "Today's Celo live arena" : "Today's Celo demo arena";
  const stacksFooterTextShort = "Stacks arena";
  const stacksFooterText = stacksReady
    ? "Today's Stacks live arena"
    : "Today's Stacks demo arena";
  const viewingCeloArena = pathname.startsWith("/celo");
  const viewingStacksArena = pathname.startsWith("/stacks");
  const celoFooterLabel = viewingCeloArena
    ? `Current page: ${celoFooterText}`
    : celoReady
      ? "Open today's live Celo arena"
      : "Open today's Celo demo arena";
  const stacksFooterLabel = viewingStacksArena
    ? `Current page: ${stacksFooterText}`
    : stacksReady
      ? "Open today's live Stacks arena"
      : "Open today's Stacks demo arena";
  const routes = [
    {
      href: "/",
      label: "Home",
      currentLabel: "Current page: PatchRush home",
      openLabel: "Open PatchRush home"
    },
    {
      href: "/celo",
      label: "Celo",
      currentLabel: `Current page: ${celoFooterText}`,
      openLabel: celoFooterLabel
    },
    {
      href: "/stacks",
      label: "Stacks",
      currentLabel: `Current page: ${stacksFooterText}`,
      openLabel: stacksFooterLabel
    }
  ] as const;

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <header className="site-header">
        <Link
          href="/"
          className="site-brand"
          aria-current={onHomePage ? "page" : undefined}
          aria-label={homeLinkLabel}
          title={homeLinkLabel}
        >
          <Image
            src="/patchrush-logo.png"
            alt=""
            width={52}
            height={52}
            priority
            className="brand-mark"
          />
          <span>
            <strong>PatchRush</strong>
            <small>Daily territory game</small>
          </span>
        </Link>

        <nav className="site-nav" aria-label="Primary navigation">
          {routes.map((route) => {
            const active = route.href === "/" ? pathname === "/" : pathname.startsWith(route.href);
            const navLinkLabel = active ? route.currentLabel : route.openLabel;
            return (
              <Link
                href={route.href}
                key={route.href}
                aria-current={active ? "page" : undefined}
                aria-label={navLinkLabel}
              >
                {route.label}
              </Link>
            );
          })}
        </nav>

        <Link
          className="header-play-link"
          href={playLinkHref}
          aria-current={!onHomePage && viewingArena ? "page" : undefined}
          aria-label={playLinkLabel}
          title={playLinkLabel}
        >
          {viewingArena ? currentArenaText : playLinkText} <ArrowRight aria-hidden="true" />
        </Link>
      </header>

      <main className="site-content" id="main-content" tabIndex={-1}>
        {children}
      </main>

      <footer className="site-footer">
        <div>
          <strong>PatchRush</strong>
          <span>
            Two networks. One arena. Three claims per UTC day. A fresh round starts at{" "}
            <time dateTime="00:00" aria-label="midnight UTC">
              00:00 UTC
            </time>
            .
          </span>
        </div>
        <nav className="footer-links" aria-label="Footer navigation">
          <Link href="/" aria-current={pathname === "/" ? "page" : undefined} aria-label={homeFooterLabel}>
            Home
          </Link>
          <Link
            href="/celo"
            aria-current={viewingCeloArena ? "page" : undefined}
            aria-label={celoFooterLabel}
          >
            {celoFooterTextShort}
          </Link>
          <Link
            href="/stacks"
            aria-current={viewingStacksArena ? "page" : undefined}
            aria-label={stacksFooterLabel}
          >
            {stacksFooterTextShort}
          </Link>
        </nav>
      </footer>
    </div>
  );
}
