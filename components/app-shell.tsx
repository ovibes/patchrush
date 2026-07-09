import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

const routes = [
  { href: "/", label: "Arena", code: "00" },
  { href: "/celo", label: "Celo", code: "CE" },
  { href: "/stacks", label: "Stacks", code: "ST" }
] as const;

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="arcade-frame">
      <header className="machine-rail">
        <Link href="/" className="machine-brand" aria-label="PatchRush arena">
          <Image
            src="/patchrush-logo.png"
            alt=""
            width={64}
            height={64}
            priority
            className="brand-token"
          />
          <span className="brand-type">
            <strong>PatchRush</strong>
            <small>Dual-chain arcade grid</small>
          </span>
        </Link>
        <nav className="machine-nav" aria-label="Primary navigation">
          {routes.map((route) => (
            <Link href={route.href} key={route.href} data-code={route.code}>
              {route.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="machine-screen">{children}</main>
      <footer className="system-footer">
        <span>BOARD STATE: CONTRACT</span>
        <span>CHAINS: CELO / STACKS</span>
      </footer>
    </div>
  );
}
