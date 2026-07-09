"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getStacksExplorerTxUrl, publicEnv } from "@/lib/env";
import {
  CELL_COUNT,
  colorSwatches,
  colorToHex,
  getTodayRoundId,
  mergeCells,
  normalizeRoundId,
  sampleStacksCells,
  shortAddress,
  type PatchCell
} from "@/lib/patchrush";
import type { StacksContractRef } from "@/lib/stacks-cell-parser";
import { CellActionModal } from "./cell-action-modal";
import { GameBoard } from "./game-board";

type StacksWalletState = {
  address: string;
  connected: boolean;
};

type StacksBoardResponse = {
  configured: boolean;
  roundId: number;
  cells: PatchCell[];
  source: string;
  error?: string;
};

const emptyWallet: StacksWalletState = {
  address: "",
  connected: false
};

function getStacksContract(): StacksContractRef | null {
  if (!publicEnv.stacksContractAddress || !publicEnv.stacksContractName) {
    return null;
  }

  return {
    address: publicEnv.stacksContractAddress,
    name: publicEnv.stacksContractName
  };
}

const configuredStacksContract = getStacksContract();

function getContractId(contract: StacksContractRef) {
  return `${contract.address}.${contract.name}` as `${string}.${string}`;
}

async function getConnectedAddress() {
  const { getLocalStorage, isConnected } = await import("@stacks/connect");

  if (!isConnected()) {
    return "";
  }

  const userData = getLocalStorage() as {
    addresses?: {
      stx?: Array<{ address: string }>;
    };
  } | null;

  return userData?.addresses?.stx?.[0]?.address || "";
}

function getTxId(response: unknown) {
  const record = response as { txid?: string; txId?: string };
  return record.txid || record.txId || "";
}

export function StacksConsole() {
  const [wallet, setWallet] = useState<StacksWalletState>(emptyWallet);
  const [cells, setCells] = useState<PatchCell[]>(sampleStacksCells);
  const [roundInput, setRoundInput] = useState(String(getTodayRoundId()));
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [cellModalOpen, setCellModalOpen] = useState(false);
  const [color, setColor] = useState(colorSwatches[1].value);
  const [message, setMessage] = useState("");
  const [txUrl, setTxUrl] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pendingClaimIndex, setPendingClaimIndex] = useState<number | null>(null);
  const [pendingBoostIndex, setPendingBoostIndex] = useState<number | null>(null);

  const contract = configuredStacksContract;
  const isConfigured = Boolean(contract);
  const roundId = useMemo(() => normalizeRoundId(roundInput), [roundInput]);
  const selectedCell =
    selectedIndex === null ? null : cells.find((cell) => cell.index === selectedIndex);
  const hasWallet = wallet.connected && Boolean(wallet.address);
  const pendingCellAction =
    selectedCell &&
    (pendingClaimIndex === selectedCell.index || pendingBoostIndex === selectedCell.index);

  const refreshWallet = useCallback(async () => {
    try {
      const address = await getConnectedAddress();
      setWallet({
        address,
        connected: Boolean(address)
      });
    } catch {
      setWallet(emptyWallet);
    }
  }, []);

  const connectWallet = useCallback(async () => {
    const { connect } = await import("@stacks/connect");
    await connect();
    const address = await getConnectedAddress();
    setWallet({
      address,
      connected: Boolean(address)
    });
    return address;
  }, []);

  const disconnectWallet = useCallback(async () => {
    const { disconnect } = await import("@stacks/connect");
    disconnect();
    setWallet(emptyWallet);
  }, []);

  const loadBoard = useCallback(async (forceFresh = false) => {
    if (!contract) {
      setCells(sampleStacksCells);
      return;
    }

    setIsRefreshing(true);
    try {
      const params = new URLSearchParams();
      params.set("round", String(roundId));
      if (wallet.address) params.set("sender", wallet.address);
      if (forceFresh) params.set("refresh", Date.now().toString());
      const response = await fetch(`/api/stacks/board?${params.toString()}`);
      const body = (await response.json()) as StacksBoardResponse;

      if (!response.ok || body.error) {
        throw new Error(body.error || "Could not load Stacks board.");
      }

      setCells(mergeCells("stacks", body.cells || []));
      setMessage("Loaded live Stacks board.");
    } catch (error) {
      setCells(sampleStacksCells);
      setMessage(
        error instanceof Error
          ? `Could not load Stacks board: ${error.message}`
          : "Could not load Stacks board."
      );
    } finally {
      setIsRefreshing(false);
    }
  }, [contract, roundId, wallet.address]);

  const claimSelected = useCallback(async () => {
    if (!selectedCell) {
      setMessage("Pick a cell before claiming.");
      return;
    }

    if (selectedCell.owner) {
      setMessage("That patch is already claimed. Boost it instead.");
      return;
    }

    if (!contract) {
      setMessage("Live Stacks contract is not configured yet. Sample board is shown.");
      return;
    }

    setPendingClaimIndex(selectedCell.index);
    setMessage("");
    setTxUrl("");

    try {
      const { request } = await import("@stacks/connect");
      const { Cl } = await import("@stacks/transactions");
      const address = wallet.address || (await connectWallet());

      if (!address) {
        throw new Error("Connect a Stacks wallet before claiming.");
      }

      const response = await request("stx_callContract", {
        contract: getContractId(contract),
        functionName: "claim-cell",
        functionArgs: [
          Cl.uint(roundId),
          Cl.uint(selectedCell.x),
          Cl.uint(selectedCell.y),
          Cl.uint(color)
        ],
        network: publicEnv.stacksNetwork
      });
      const txId = getTxId(response);

      if (txId) setTxUrl(getStacksExplorerTxUrl(txId));
      setMessage(`Submitted claim for patch ${selectedCell.x + 1},${selectedCell.y + 1}.`);
      await refreshWallet();
      await loadBoard(true);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Stacks claim transaction was rejected."
      );
    } finally {
      setPendingClaimIndex(null);
    }
  }, [
    color,
    connectWallet,
    contract,
    loadBoard,
    refreshWallet,
    roundId,
    selectedCell,
    wallet.address
  ]);

  const boostCell = useCallback(
    async (cell: PatchCell) => {
      if (!contract) {
        setMessage("Live Stacks boosts are not configured yet.");
        return;
      }

      setPendingBoostIndex(cell.index);
      setMessage("");
      setTxUrl("");

      try {
        const { request } = await import("@stacks/connect");
        const { Cl } = await import("@stacks/transactions");
        if (!wallet.address) await connectWallet();
        const response = await request("stx_callContract", {
          contract: getContractId(contract),
          functionName: "boost-cell",
          functionArgs: [Cl.uint(roundId), Cl.uint(cell.index)],
          network: publicEnv.stacksNetwork
        });
        const txId = getTxId(response);

        if (txId) setTxUrl(getStacksExplorerTxUrl(txId));
        setMessage(`Submitted boost for patch ${cell.x + 1},${cell.y + 1}.`);
        await loadBoard(true);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not boost cell.");
      } finally {
        setPendingBoostIndex(null);
      }
    },
    [connectWallet, contract, loadBoard, roundId, wallet.address]
  );

  useEffect(() => {
    const refreshId = window.setTimeout(() => {
      void refreshWallet();
      void loadBoard();
    }, 0);

    return () => window.clearTimeout(refreshId);
  }, [loadBoard, refreshWallet]);

  return (
    <section className="play-page stacks-play" aria-labelledby="stacks-title">
      <div className="play-topbar">
        <div className="play-title-block">
          <span className="hud-tag">STACKS // {publicEnv.stacksNetwork}</span>
          <h1 id="stacks-title">Stacks arena</h1>
          <p>Pick a cell. Claim open cells. Boost claimed cells.</p>
        </div>

        <div className="play-toolbar" aria-label="Stacks controls">
          <label className="round-control">
            <span>Round</span>
            <input
              value={roundInput}
              onChange={(event) => setRoundInput(event.target.value)}
              inputMode="numeric"
              maxLength={8}
              placeholder="20260708"
            />
          </label>

          <div className="swatch-group compact" aria-label="Claim color">
            <span>Color</span>
            <div>
              {colorSwatches.map((swatch) => (
                <button
                  type="button"
                  className={swatch.value === color ? "swatch is-selected" : "swatch"}
                  key={swatch.value}
                  style={{ backgroundColor: colorToHex(swatch.value) }}
                  aria-label={`Use ${swatch.label}`}
                  title={swatch.label}
                  onClick={() => setColor(swatch.value)}
                />
              ))}
            </div>
          </div>

          <div className="wallet-chip">
            <span>Wallet</span>
            <strong>{hasWallet ? shortAddress(wallet.address) : "Not connected"}</strong>
            {hasWallet ? (
              <button
                type="button"
                className="ghost-button"
                onClick={() => void disconnectWallet()}
              >
                Disconnect
              </button>
            ) : (
              <button
                type="button"
                className="ghost-button"
                onClick={() => void connectWallet()}
              >
                Connect
              </button>
            )}
          </div>

          <button
            type="button"
            className="ghost-button"
            onClick={() => void loadBoard(true)}
          >
            <span className="button-glyph" aria-hidden="true">
              RLD
            </span>
            {isRefreshing ? "Refreshing" : "Refresh"}
          </button>
        </div>
      </div>

      <GameBoard
        cells={cells.length === CELL_COUNT ? cells : mergeCells("stacks", cells)}
        selectedIndex={selectedIndex}
        networkLabel="Stacks arena"
        onSelect={(cell) => {
          setSelectedIndex(cell.index);
          setMessage("");
          setTxUrl("");
          setCellModalOpen(true);
        }}
        pendingClaimIndex={pendingClaimIndex}
        pendingBoostIndex={pendingBoostIndex}
      />

      <details className="help-panel">
        <summary>Scoring and limits</summary>
        <p>Every claim starts at 10 points. Each occupied orthogonal neighbor adds 3.</p>
        <p>Boosts add one point to the patch owner and are limited to once per wallet.</p>
        <p className="color-readout">
          <span style={{ backgroundColor: colorToHex(color) }} aria-hidden="true" />
          Current color{" "}
          <strong>{colorToHex(color)}</strong>
        </p>
        <p>
          {isConfigured
            ? "Live Stacks board is configured."
            : "Sample board shown until the Stacks contract id is set."}
        </p>
      </details>

      {cellModalOpen ? (
        <CellActionModal
          cell={selectedCell || null}
          color={color}
          message={message}
          networkLabel="Stacks"
          onClaim={() => void claimSelected()}
          onClose={() => setCellModalOpen(false)}
          onConnect={() => void connectWallet()}
          onBoost={() => {
            if (selectedCell) void boostCell(selectedCell);
          }}
          pending={Boolean(pendingCellAction)}
          roundId={roundId}
          txUrl={txUrl}
          walletConnected={hasWallet}
          walletLabel="Stacks wallet"
        />
      ) : null}
    </section>
  );
}
