"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { ArrowRight, Gamepad2, Smartphone, Wallet, X } from "lucide-react";
import { AccessibleDialog } from "./accessible-dialog";

type NetworkPickerModalProps = {
  celoNetworkLabel: string;
  stacksNetworkLabel: string;
  celoReady: boolean;
  stacksReady: boolean;
  triggerLabel?: string;
  triggerText?: string;
  triggerDescribedBy?: string;
};

export function NetworkPickerModal({
  celoNetworkLabel,
  stacksNetworkLabel,
  celoReady,
  stacksReady,
  triggerLabel,
  triggerText,
  triggerDescribedBy
}: NetworkPickerModalProps) {
  const [open, setOpen] = useState(false);
  const closeDialog = () => setOpen(false);
  const dialogId = useId();
  const titleId = `${dialogId}-title`;
  const descriptionId = `${dialogId}-description`;
  const celoDescriptionId = `${dialogId}-celo-description`;
  const stacksDescriptionId = `${dialogId}-stacks-description`;
  const hasLiveNetwork = celoReady || stacksReady;
  const defaultTriggerLabel = hasLiveNetwork
    ? "Choose today's arena"
    : "Preview today's arenas";
  const defaultTriggerText = hasLiveNetwork ? "Choose today's arena" : "Preview today's arenas";
  const descriptionText = celoReady && stacksReady
    ? "Both Celo and Stacks are live today. The game is identical on both networks, so start with the wallet you already use."
    : celoReady
      ? "Celo is live today, while Stacks stays available in demo mode until the next round opens at 00:00 UTC. The game is identical on both networks, so start with the wallet you already use."
      : stacksReady
        ? "Stacks is live today, while Celo stays available in demo mode until the next round opens at 00:00 UTC. The game is identical on both networks, so start with the wallet you already use."
        : "Both networks are in demo mode today. Start on either network now, then connect the wallet you plan to use when the live round opens at 00:00 UTC.";
  const celoChoiceText = celoReady
    ? "Best with MiniPay or a Celo-compatible wallet"
    : "Open the demo now. Connect a Celo-compatible wallet when the live round opens.";
  const stacksChoiceText = stacksReady
    ? "Use Leather, Xverse, or another Stacks-compatible wallet"
    : "Open the demo now. Connect a Stacks-compatible wallet when the live round opens.";
  const celoChoiceAriaLabel = celoReady
    ? "Open today's live Celo arena with MiniPay or another Celo-compatible wallet"
    : "Open today's Celo demo arena and connect a Celo-compatible wallet when the live round opens at 00:00 UTC";
  const stacksChoiceAriaLabel = stacksReady
    ? "Open today's live Stacks arena with Leather, Xverse, or another Stacks-compatible wallet"
    : "Open today's Stacks demo arena and connect a Stacks-compatible wallet when the live round opens at 00:00 UTC";
  return (
    <>
      <button
        type="button"
        className="primary-button hero-cta"
        aria-label={triggerLabel || defaultTriggerLabel}
        aria-describedby={triggerDescribedBy}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
        onClick={() => setOpen(true)}
      >
        <Gamepad2 aria-hidden="true" />
        {triggerText || defaultTriggerText}
        <ArrowRight aria-hidden="true" />
      </button>

      <AccessibleDialog
        id={dialogId}
        open={open}
        onClose={closeDialog}
        labelledBy={titleId}
        describedBy={descriptionId}
        className="network-dialog"
      >
        <header className="dialog-heading">
          <span className="eyebrow">Choose how you play</span>
          <button
            type="button"
            className="icon-button"
            aria-label="Close arena chooser"
            title="Close arena chooser"
            onClick={closeDialog}
          >
            <X aria-hidden="true" />
          </button>
        </header>
        <h2 id={titleId}>{hasLiveNetwork ? "Choose today's arena" : "Preview today's arenas"}</h2>
        <p id={descriptionId}>{descriptionText}</p>

        <div className="network-choice-grid">
          <Link
            className="network-choice is-celo"
            href="/celo"
            aria-label={celoChoiceAriaLabel}
            aria-describedby={celoDescriptionId}
            data-autofocus="true"
            onClick={closeDialog}
          >
            <span className="choice-icon"><Smartphone aria-hidden="true" /></span>
            <span className={celoReady ? "status-pill is-live" : "status-pill"}>{celoReady ? "Live" : "Demo"}</span>
            <strong>Celo</strong>
            <small id={celoDescriptionId}>{celoChoiceText}</small>
            <span className="choice-meta">{celoNetworkLabel}<ArrowRight aria-hidden="true" /></span>
          </Link>
          <Link
            className="network-choice is-stacks"
            href="/stacks"
            aria-label={stacksChoiceAriaLabel}
            aria-describedby={stacksDescriptionId}
            onClick={closeDialog}
          >
            <span className="choice-icon"><Wallet aria-hidden="true" /></span>
            <span className={stacksReady ? "status-pill is-live" : "status-pill"}>{stacksReady ? "Live" : "Demo"}</span>
            <strong>Stacks</strong>
            <small id={stacksDescriptionId}>{stacksChoiceText}</small>
            <span className="choice-meta">{stacksNetworkLabel}<ArrowRight aria-hidden="true" /></span>
          </Link>
        </div>
      </AccessibleDialog>
    </>
  );
}
