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

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link href="/" className="site-brand" aria-label="PatchRush home">
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

        <Link className="header-play-link" href={pathname.startsWith("/stacks") ? "/stacks" : "/celo"}>
          Play now <ArrowUpRight aria-hidden="true" />
        </Link>
      </header>

      <div className="site-content">{children}</div>

      <footer className="site-footer">
        <div>
          <strong>PatchRush</strong>
          <span>One board. Three claims. A fresh round every UTC day.</span>
        </div>
        <div className="footer-links">
          <Link href="/celo">Play on Celo</Link>
          <Link href="/stacks">Play on Stacks</Link>
        </div>
      </footer>
    </div>
  );
}
