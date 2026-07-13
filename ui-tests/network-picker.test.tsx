import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { NetworkPickerModal } from "@/components/network-picker-modal";

describe("NetworkPickerModal", () => {
  it("opens accessibly, closes with Escape, and restores focus", async () => {
    const user = userEvent.setup();
    render(
      <NetworkPickerModal
        celoNetworkLabel="Celo Mainnet"
        stacksNetworkLabel="Stacks Mainnet"
        celoReady
        stacksReady={false}
      />
    );
    const trigger = screen.getByRole("button", { name: /play today's round/i });
    await user.click(trigger);

    expect(screen.getByRole("dialog", { name: "Pick your network" })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /close network picker/i })).toHaveFocus();
    });
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
