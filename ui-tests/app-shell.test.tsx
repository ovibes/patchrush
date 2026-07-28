import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppShell } from "@/components/app-shell";

const usePathname = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => usePathname()
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}));

vi.mock("next/image", () => ({
  default: ({
    alt,
    src,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & { src: string }) => (
    <img alt={alt} src={src} {...props} />
  )
}));

vi.mock("@/lib/env", () => ({
  publicEnv: {
    celoContractAddress: "0xcafe",
    stacksContractAddress: "ST1234",
    stacksContractName: "patchrush"
  }
}));

describe("AppShell", () => {
  beforeEach(() => {
    usePathname.mockReset();
  });

  it("announces the brand link as the current page on home", () => {
    usePathname.mockReturnValue("/");
    const { container } = render(
      <AppShell>
        <div>Content</div>
      </AppShell>
    );

    const brandLink = container.querySelector(".site-brand");

    expect(brandLink).toHaveAttribute("aria-label", "Current page: PatchRush home");
    expect(brandLink).toHaveAttribute("aria-current", "page");
  });

  it("announces the active footer arena link as the current page", () => {
    usePathname.mockReturnValue("/celo");
    render(
      <AppShell>
        <div>Content</div>
      </AppShell>
    );

    expect(
      screen.getByRole("link", { name: "Current page: Today's Celo live arena" })
    ).toHaveAttribute("aria-current", "page");
    expect(
      screen.getByRole("link", { name: "Open today's live Stacks arena" })
    ).not.toHaveAttribute("aria-current");
  });

  it("announces the active header navigation link as the current page", () => {
    usePathname.mockReturnValue("/stacks");
    render(
      <AppShell>
        <div>Content</div>
      </AppShell>
    );

    expect(screen.getByRole("link", { name: "Current page: Stacks" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("link", { name: "Open Home" })).not.toHaveAttribute(
      "aria-current"
    );
  });

  it("uses choose wording for the home header action when a live arena is available", () => {
    usePathname.mockReturnValue("/");
    render(
      <AppShell>
        <div>Content</div>
      </AppShell>
    );

    expect(
      screen.getByRole("link", { name: "Jump to today's arena comparison section" })
    ).toHaveTextContent("Choose today's arena");
  });
});
