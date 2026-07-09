"use client";

import Link from "next/link";
import { useState } from "react";

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

  return (
    <>
      <button
        type="button"
        className="command-button landing-cta"
        onClick={() => setOpen(true)}
      >
        <span className="button-glyph" aria-hidden="true">
          GO
        </span>
        Play today&apos;s round
      </button>

      {open ? (
        <div className="modal-backdrop" role="presentation">
          <div
            className="network-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="network-picker-title"
          >
            <div className="modal-heading">
              <span className="hud-tag">Choose network</span>
              <button
                type="button"
                className="modal-close"
                aria-label="Close network picker"
                onClick={() => setOpen(false)}
              >
                X
              </button>
            </div>
            <h2 id="network-picker-title">Where do you want to play?</h2>
            <p>
              Both routes use the same board rules. Pick the wallet/network you
              want to use for this round.
            </p>

            <div className="network-choice-grid">
              <Link className="network-choice is-celo" href="/celo">
                <span>{celoReady ? "Contract configured" : "Sample mode"}</span>
                <strong>Celo</strong>
                <small>{celoNetworkLabel} / MiniPay-ready</small>
              </Link>
              <Link className="network-choice is-stacks" href="/stacks">
                <span>{stacksReady ? "Contract configured" : "Sample mode"}</span>
                <strong>Stacks</strong>
                <small>{stacksNetworkLabel} / Stacks Connect</small>
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
