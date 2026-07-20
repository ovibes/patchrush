import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { NetworkPickerModal } from "@/components/network-picker-modal";

describe("NetworkPickerModal", () => {
  it("opens accessibly, wraps backward focus, closes with Escape, and restores focus", async () => {
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
      expect(screen.getByRole("button", { name: /close network picker/i })).toHaveFocus();
    });
    await user.tab({ shift: true });
    expect(
      screen.getByRole("link", { name: /open stacks demo arena on stacks mainnet/i })
    ).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
