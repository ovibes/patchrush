"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { publicEnv } from "@/lib/env";

type AppShellProps = {
  children: ReactNode;
};

const routes = [
  { href: "/", label: "Home" },
  { href: "/celo", label: "Celo" },
  { href: "/stacks", label: "Stacks" }
] as const;

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const onHomePage = pathname === "/";
  const celoReady = Boolean(publicEnv.celoContractAddress);
  const stacksReady = Boolean(
    publicEnv.stacksContractAddress && publicEnv.stacksContractName
  );
  const playHref = pathname.startsWith("/stacks") ? "/stacks" : "/celo";
  const playLabel = playHref === "/stacks" ? "Stacks" : "Celo";
  const viewingArena = pathname === playHref;
  const playLinkHref = onHomePage ? "/#network-title" : playHref;
  const currentArenaText = `Today's ${playLabel} arena`;
  const playLinkText = onHomePage ? "Compare Celo and Stacks" : currentArenaText;
  const playLinkLabel = onHomePage
    ? "Choose your arena by comparing Celo and Stacks"
    : viewingArena
      ? `Current page: ${currentArenaText}`
      : `Open ${currentArenaText}`;
  const celoFooterText = celoReady ? "Celo live arena" : "Celo demo arena";
  const stacksFooterText = stacksReady ? "Stacks live arena" : "Stacks demo arena";
  const celoFooterLabel = celoReady ? "Open live Celo arena" : "Open Celo demo arena";
  const stacksFooterLabel = stacksReady
    ? "Open live Stacks arena"
    : "Open Stacks demo arena";

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <header className="site-header">
        <Link
          href="/"
          className="site-brand"
          aria-label="PatchRush home"
          title="PatchRush home"
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
            <small>Daily territory</small>
          </span>
        </Link>

        <nav className="site-nav" aria-label="Primary navigation">
          {routes.map((route) => {
            const active = route.href === "/" ? pathname === "/" : pathname.startsWith(route.href);
            return (
              <Link href={route.href} key={route.href} aria-current={active ? "page" : undefined}>
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
          {viewingArena ? currentArenaText : playLinkText} <ArrowUpRight aria-hidden="true" />
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
          <Link
            href="/celo"
            aria-current={pathname.startsWith("/celo") ? "page" : undefined}
            aria-label={celoFooterLabel}
          >
            {celoFooterText}
          </Link>
          <Link
            href="/stacks"
            aria-current={pathname.startsWith("/stacks") ? "page" : undefined}
            aria-label={stacksFooterLabel}
          >
            {stacksFooterText}
          </Link>
        </nav>
      </footer>
    </div>
  );
}
