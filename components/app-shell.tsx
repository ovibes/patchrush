"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

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
  const playHref = pathname.startsWith("/stacks") ? "/stacks" : "/celo";
  const playLabel = playHref === "/stacks" ? "Stacks" : "Celo";
  const playLinkLabel =
    pathname === playHref ? `Viewing ${playLabel} arena` : `Open ${playLabel} arena`;

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
          href={playHref}
          aria-label={playLinkLabel}
          title={playLinkLabel}
        >
          {playLinkLabel} <ArrowUpRight aria-hidden="true" />
        </Link>
      </header>

      <main className="site-content" id="main-content" tabIndex={-1}>
        {children}
      </main>

      <footer className="site-footer">
        <div>
          <strong>PatchRush</strong>
          <span>
            One board. Three claims. A fresh round starts at{" "}
            <time dateTime="00:00Z">00:00 UTC</time>.
          </span>
        </div>
        <nav className="footer-links" aria-label="Footer navigation">
          <Link href="/celo" aria-current={pathname.startsWith("/celo") ? "page" : undefined}>
            Play on Celo
          </Link>
          <Link
            href="/stacks"
            aria-current={pathname.startsWith("/stacks") ? "page" : undefined}
          >
            Play on Stacks
          </Link>
        </nav>
      </footer>
    </div>
  );
}
