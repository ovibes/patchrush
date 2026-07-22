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
};

export function NetworkPickerModal({
  celoNetworkLabel,
  stacksNetworkLabel,
  celoReady,
  stacksReady,
  triggerLabel
}: NetworkPickerModalProps) {
  const [open, setOpen] = useState(false);
  const dialogId = useId();
  const titleId = `${dialogId}-title`;
  const descriptionId = `${dialogId}-description`;
  const hasLiveNetwork = celoReady || stacksReady;
  const defaultTriggerLabel = hasLiveNetwork
    ? "Choose today's arena"
    : "Preview today's arena";
  const triggerText = hasLiveNetwork ? "Choose today's arena" : "Preview today's arena";
  const descriptionText = hasLiveNetwork
    ? "The game is identical on both networks. Choose the wallet already on your device, or open a demo arena first."
    : "The game is identical on both networks. Start in demo mode and pick the wallet flow that best fits your device.";
  const celoChoiceText = celoReady
    ? "Best with MiniPay or a Celo-compatible wallet"
    : "Open the demo now, then connect a Celo-compatible wallet when live";
  const stacksChoiceText = stacksReady
    ? "Use Leather, Xverse, or another Stacks-compatible wallet"
    : "Open the demo now, then connect a Stacks wallet when live";
  const celoChoiceLabel = celoReady
    ? `Open today's live Celo arena on ${celoNetworkLabel} with MiniPay or another Celo-compatible wallet`
    : `Open today's Celo demo arena on ${celoNetworkLabel} and connect a Celo-compatible wallet when live`;
  const stacksChoiceLabel = stacksReady
    ? `Open today's live Stacks arena on ${stacksNetworkLabel} with Leather, Xverse, or another Stacks-compatible wallet`
    : `Open today's Stacks demo arena on ${stacksNetworkLabel} and connect a Stacks wallet when live`;
  return (
    <>
      <button
        type="button"
        className="primary-button hero-cta"
        aria-label={triggerLabel || defaultTriggerLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
        onClick={() => setOpen(true)}
      >
        <Gamepad2 aria-hidden="true" />
        {triggerText}
        <ArrowRight aria-hidden="true" />
      </button>

      <AccessibleDialog
        id={dialogId}
        open={open}
        onClose={() => setOpen(false)}
        labelledBy={titleId}
        describedBy={descriptionId}
        className="network-dialog"
      >
        <header className="dialog-heading">
          <span className="eyebrow">Choose how you play</span>
          <button
            type="button"
            className="icon-button"
            aria-label="Close network picker"
            title="Close network picker"
            data-autofocus="true"
            onClick={() => setOpen(false)}
          >
            <X aria-hidden="true" />
          </button>
        </header>
        <h2 id={titleId}>{hasLiveNetwork ? "Choose today's arena" : "Preview today's arena"}</h2>
        <p id={descriptionId}>{descriptionText}</p>

        <div className="network-choice-grid">
          <Link
            className="network-choice is-celo"
            href="/celo"
            aria-label={celoChoiceLabel}
          >
            <span className="choice-icon"><Smartphone aria-hidden="true" /></span>
            <span className={celoReady ? "status-pill is-live" : "status-pill"}>{celoReady ? "Live" : "Demo"}</span>
            <strong>Celo</strong>
            <small>{celoChoiceText}</small>
            <span className="choice-meta">{celoNetworkLabel}<ArrowRight aria-hidden="true" /></span>
          </Link>
          <Link
            className="network-choice is-stacks"
            href="/stacks"
            aria-label={stacksChoiceLabel}
          >
            <span className="choice-icon"><Wallet aria-hidden="true" /></span>
            <span className={stacksReady ? "status-pill is-live" : "status-pill"}>{stacksReady ? "Live" : "Demo"}</span>
            <strong>Stacks</strong>
            <small>{stacksChoiceText}</small>
            <span className="choice-meta">{stacksNetworkLabel}<ArrowRight aria-hidden="true" /></span>
          </Link>
        </div>
      </AccessibleDialog>
    </>
  );
}
