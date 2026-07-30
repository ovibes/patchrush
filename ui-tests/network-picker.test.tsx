import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { NetworkPickerModal } from "@/components/network-picker-modal";

describe("NetworkPickerModal", () => {
  it("opens accessibly, focuses the first network choice, wraps focus from the dialog panel, closes with Escape, and restores focus", async () => {
    const user = userEvent.setup();
    render(
      <NetworkPickerModal
        celoNetworkLabel="Celo Mainnet"
        stacksNetworkLabel="Stacks Mainnet"
        celoReady
        stacksReady={false}
      />
    );
    const trigger = screen.getByRole("button", { name: /choose today's arena/i });
    await user.click(trigger);

    const dialog = screen.getByRole("dialog", { name: "Choose today's arena" });
    expect(dialog).toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen.getByRole("link", {
          name: /open today's live celo arena with minipay or another celo-compatible wallet/i
        })
      ).toHaveFocus();
    });
    dialog.focus();
    await user.tab();
    expect(
      screen.getByRole("link", {
        name: /open today's live celo arena with minipay or another celo-compatible wallet/i
      })
    ).toHaveFocus();
    dialog.focus();
    await user.tab({ shift: true });
    expect(
      screen.getByRole("link", {
        name: /open today's stacks demo arena and connect a stacks-compatible wallet when the live round opens at 00:00 utc/i
      })
    ).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("accepts a custom trigger label for distinct entry points", () => {
    render(
      <NetworkPickerModal
        celoNetworkLabel="Celo Mainnet"
        stacksNetworkLabel="Stacks Mainnet"
        celoReady
        stacksReady
        triggerLabel="Choose today's arena from the hero section"
        triggerText="Compare today's arenas"
      />
    );

    expect(
      screen.getByRole("button", { name: "Choose today's arena from the hero section" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Choose today's arena from the hero section" })).toHaveTextContent(
      "Compare today's arenas"
    );
  });

  it("uses plural preview copy when both networks are still in demo mode", async () => {
    const user = userEvent.setup();
    render(
      <NetworkPickerModal
        celoNetworkLabel="Celo Alfajores"
        stacksNetworkLabel="Stacks Testnet"
        celoReady={false}
        stacksReady={false}
      />
    );

    const trigger = screen.getByRole("button", { name: /preview today's arenas/i });
    expect(trigger).toHaveTextContent("Preview today's arenas");

    await user.click(trigger);
    expect(screen.getByRole("dialog", { name: /preview today's arenas/i })).toBeInTheDocument();
    expect(
      screen.getByText(
        "Both networks are in demo mode today. Start on either network now, then connect the wallet you plan to use when the live round opens at 00:00 UTC."
      )
    ).toBeInTheDocument();
  });

  it("describes which network is live and which stays in demo mode", async () => {
    const user = userEvent.setup();
    render(
      <NetworkPickerModal
        celoNetworkLabel="Celo Mainnet"
        stacksNetworkLabel="Stacks Mainnet"
        celoReady
        stacksReady={false}
      />
    );

    await user.click(screen.getByRole("button", { name: /choose today's arena/i }));
    expect(
      screen.getByText(
        "Celo is live today, while Stacks stays available in demo mode until the next round opens at 00:00 UTC. The game is identical on both networks, so start with the wallet you already use."
      )
    ).toBeInTheDocument();
  });

  it("keeps the both-live helper copy wallet-centric", async () => {
    const user = userEvent.setup();
    render(
      <NetworkPickerModal
        celoNetworkLabel="Celo Mainnet"
        stacksNetworkLabel="Stacks Mainnet"
        celoReady
        stacksReady
      />
    );

    await user.click(screen.getByRole("button", { name: /choose today's arena/i }));
    expect(
      screen.getByText(
        "Both Celo and Stacks are live today. The game is identical on both networks, so start with the wallet you already use."
      )
    ).toBeInTheDocument();
  });
});
