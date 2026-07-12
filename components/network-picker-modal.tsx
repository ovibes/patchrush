"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Gamepad2, Smartphone, Wallet, X } from "lucide-react";
import { AccessibleDialog } from "./accessible-dialog";

type NetworkPickerModalProps = {
  celoNetworkLabel: string;
  stacksNetworkLabel: string;
  celoReady: boolean;
  stacksReady: boolean;
};

export function NetworkPickerModal({
  celoNetworkLabel,
  stacksNetworkLabel,
  celoReady,
  stacksReady
}: NetworkPickerModalProps) {
  const [open, setOpen] = useState(false);
  const dialogId = "network-picker-dialog";

  return (
    <>
      <button
        type="button"
        className="primary-button hero-cta"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
        onClick={() => setOpen(true)}
      >
        <Gamepad2 aria-hidden="true" />
        Play today&apos;s round
        <ArrowRight aria-hidden="true" />
      </button>

      <AccessibleDialog
        id={dialogId}
        open={open}
        onClose={() => setOpen(false)}
        labelledBy="network-picker-title"
        describedBy="network-picker-description"
        className="network-dialog"
      >
        <header className="dialog-heading">
          <span className="eyebrow">Choose how you play</span>
          <button
            type="button"
            className="icon-button"
            aria-label="Close network picker"
            title="Close network picker"
            onClick={() => setOpen(false)}
          >
            <X aria-hidden="true" />
          </button>
        </header>
        <h2 id="network-picker-title">Pick your network</h2>
        <p id="network-picker-description">
          The game is identical on both networks. Choose the wallet already on your device.
        </p>

        <div className="network-choice-grid">
          <Link
            className="network-choice is-celo"
            href="/celo"
            aria-label={`Open ${celoReady ? "live" : "demo"} Celo game on ${celoNetworkLabel}`}
            title={`Open ${celoReady ? "live" : "demo"} Celo game on ${celoNetworkLabel}`}
          >
            <span className="choice-icon"><Smartphone aria-hidden="true" /></span>
            <span className={celoReady ? "status-pill is-live" : "status-pill"}>{celoReady ? "Live" : "Demo"}</span>
            <strong>Celo</strong>
            <small>Best with MiniPay or a Celo-compatible wallet</small>
            <span className="choice-meta">{celoNetworkLabel}<ArrowRight aria-hidden="true" /></span>
          </Link>
          <Link
            className="network-choice is-stacks"
            href="/stacks"
            aria-label={`Open ${stacksReady ? "live" : "demo"} Stacks game on ${stacksNetworkLabel}`}
            title={`Open ${stacksReady ? "live" : "demo"} Stacks game on ${stacksNetworkLabel}`}
          >
            <span className="choice-icon"><Wallet aria-hidden="true" /></span>
            <span className={stacksReady ? "status-pill is-live" : "status-pill"}>{stacksReady ? "Live" : "Demo"}</span>
            <strong>Stacks</strong>
            <small>Use Leather, Xverse, or another Stacks Connect wallet</small>
            <span className="choice-meta">{stacksNetworkLabel}<ArrowRight aria-hidden="true" /></span>
          </Link>
        </div>
      </AccessibleDialog>
    </>
  );
}
