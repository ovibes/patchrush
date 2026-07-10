"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getStacksExplorerTxUrl, publicEnv } from "@/lib/env";
import {
  CELL_COUNT,
  buildEmptyBoard,
  colorSwatches,
  emptyPlayerRoundStats,
  getFriendlyActionError,
  getTodayRoundId,
  idleTransaction,
  mergeCells,
  sampleStacksCells,
  type BoardLoadState,
  type PatchCell,
  type PlayerRoundStats,
  type TransactionState
} from "@/lib/patchrush";
import type { StacksContractRef } from "@/lib/stacks-cell-parser";
import { ArenaExperience } from "./arena-experience";

type StacksWalletState = { address: string; connected: boolean };
type StacksBoardResponse = {
  configured: boolean;
  roundId: number;
  cells: PatchCell[];
  claimedCount: number;
  player?: PlayerRoundStats | null;
  error?: string;
};
type TxStatusResponse = { phase: "pending" | "confirmed" | "failed"; status?: string };

const emptyWallet: StacksWalletState = { address: "", connected: false };

function getStacksContract(): StacksContractRef | null {
  if (!publicEnv.stacksContractAddress || !publicEnv.stacksContractName) return null;
  return { address: publicEnv.stacksContractAddress, name: publicEnv.stacksContractName };
}

const configuredStacksContract = getStacksContract();

function getContractId(contract: StacksContractRef) {
  return `${contract.address}.${contract.name}` as `${string}.${string}`;
}

async function getConnectedAddress() {
  const { getLocalStorage, isConnected } = await import("@stacks/connect");
  if (!isConnected()) return "";
  const userData = getLocalStorage() as {
    addresses?: { stx?: Array<{ address: string }> };
  } | null;
  return userData?.addresses?.stx?.[0]?.address || "";
}

function getTxId(response: unknown) {
  const record = response as { txid?: string; txId?: string };
  return record.txid || record.txId || "";
}

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));

async function waitForStacksTransaction(txId: string) {
  for (let attempt = 0; attempt < 24; attempt += 1) {
    try {
      const response = await fetch(`/api/stacks/tx/${encodeURIComponent(txId)}`, {
        cache: "no-store"
      });
      const body = (await response.json()) as TxStatusResponse;
      if (body.phase === "confirmed" || body.phase === "failed") return body.phase;
    } catch {
      // A temporary status read failure should not turn a submitted transaction into an error.
    }
    await wait(5000);
  }
  return "pending" as const;
}

export function StacksConsole() {
  const contract = configuredStacksContract;
  const configured = Boolean(contract);
  const todayRoundId = useMemo(() => getTodayRoundId(), []);
  const [wallet, setWallet] = useState<StacksWalletState>(emptyWallet);
  const [cells, setCells] = useState<PatchCell[]>(
    configured ? buildEmptyBoard("stacks") : sampleStacksCells
  );
  const [roundId, setRoundId] = useState(todayRoundId);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedHasBoosted, setSelectedHasBoosted] = useState<boolean | null>(false);
  const [color, setColor] = useState(colorSwatches[1].value);
  const [playerStats, setPlayerStats] = useState<PlayerRoundStats>(emptyPlayerRoundStats);
  const [loadState, setLoadState] = useState<BoardLoadState>(configured ? "idle" : "ready");
  const [loadError, setLoadError] = useState("");
  const [transaction, setTransaction] = useState<TransactionState>(idleTransaction);
  const [pendingClaimIndex, setPendingClaimIndex] = useState<number | null>(null);
  const [pendingBoostIndex, setPendingBoostIndex] = useState<number | null>(null);

  const selectedCell = selectedIndex === null ? null : cells[selectedIndex] || null;

  const refreshWallet = useCallback(async () => {
    try {
      const address = await getConnectedAddress();
      setWallet({ address, connected: Boolean(address) });
      return address;
    } catch {
      setWallet(emptyWallet);
      return "";
    }
  }, []);

  const connectWallet = useCallback(async () => {
    const { connect } = await import("@stacks/connect");
    await connect();
    const address = await getConnectedAddress();
    setWallet({ address, connected: Boolean(address) });
    return address;
  }, []);

  const disconnectWallet = useCallback(async () => {
    const { disconnect } = await import("@stacks/connect");
    disconnect();
    setWallet(emptyWallet);
    setPlayerStats(emptyPlayerRoundStats);
    setSelectedHasBoosted(false);
    setTransaction(idleTransaction);
  }, []);

  const loadBoard = useCallback(async () => {
    if (!contract) {
      setCells(sampleStacksCells);
      setPlayerStats(emptyPlayerRoundStats);
      setLoadError("");
      setLoadState("ready");
      return;
    }

    setLoadState((current) => (current === "ready" ? "refreshing" : "loading"));
    setLoadError("");
    try {
      const params = new URLSearchParams({ round: String(roundId) });
      if (wallet.address) params.set("sender", wallet.address);
      params.set("refresh", Date.now().toString());
      const response = await fetch(`/api/stacks/board?${params.toString()}`, {
        cache: "no-store"
      });
      const body = (await response.json()) as StacksBoardResponse;
      if (!response.ok || body.error) throw new Error(body.error || "Could not load board.");

      setCells(
        body.cells.length === CELL_COUNT ? body.cells : mergeCells("stacks", body.cells || [])
      );
      setPlayerStats(body.player || emptyPlayerRoundStats);
      setLoadState("ready");
    } catch (error) {
      setLoadError(
        getFriendlyActionError(error, "We could not refresh the Stacks board. Your last board is still shown.")
      );
      setLoadState("error");
    }
  }, [contract, roundId, wallet.address]);

  useEffect(() => {
    const timer = window.setTimeout(() => void refreshWallet(), 0);
    return () => window.clearTimeout(timer);
  }, [refreshWallet]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadBoard(), 0);
    return () => window.clearTimeout(timer);
  }, [loadBoard]);

  useEffect(() => {
    if (
      !configured ||
      !wallet.address ||
      !selectedCell?.owner ||
      roundId !== todayRoundId
    ) {
      return;
    }

    let cancelled = false;
    const params = new URLSearchParams({
      round: String(roundId),
      sender: wallet.address,
      cell: String(selectedCell.index)
    });
    const check = async () => {
      try {
        const response = await fetch(`/api/stacks/action-state?${params.toString()}`, {
          cache: "no-store"
        });
        const body = (await response.json()) as { hasBoosted?: boolean };
        if (!response.ok) throw new Error("Could not check boost status.");
        if (!cancelled) setSelectedHasBoosted(Boolean(body.hasBoosted));
      } catch {
        if (!cancelled) setSelectedHasBoosted(false);
      }
    };
    void check();
    return () => {
      cancelled = true;
    };
  }, [configured, roundId, selectedCell, todayRoundId, wallet.address]);

  const connectFromInterface = async () => {
    setTransaction({ phase: "connecting", message: "Opening Stacks Connect…" });
    try {
      const address = await connectWallet();
      if (!address) throw new Error("No Stacks account was selected.");
      setTransaction(idleTransaction);
    } catch (error) {
      setTransaction({
        phase: "failed",
        message: getFriendlyActionError(error, "We could not connect your Stacks wallet.")
      });
    }
  };

  const finishStacksTransaction = async (txId: string, successMessage: string) => {
    const txUrl = getStacksExplorerTxUrl(txId);
    setTransaction({
      phase: "submitted",
      message: "Submitted to Stacks. Confirmation can take a little while.",
      txUrl
    });
    const finalPhase = await waitForStacksTransaction(txId);
    if (finalPhase === "failed") {
      throw new Error("Stacks rejected the submitted transaction.");
    }
    if (finalPhase === "confirmed") {
      setTransaction({ phase: "confirmed", message: successMessage, txUrl });
      await refreshWallet();
      await loadBoard();
      return;
    }
    setTransaction({
      phase: "submitted",
      message: "Still processing on Stacks. You can leave this page and follow the receipt.",
      txUrl
    });
  };

  const claimSelected = async () => {
    if (!selectedCell || selectedCell.owner || !contract || roundId !== todayRoundId) return;

    setPendingClaimIndex(selectedCell.index);
    try {
      let address = wallet.address;
      if (!address) {
        setTransaction({ phase: "connecting", message: "Opening Stacks Connect…" });
        address = await connectWallet();
      }
      if (!address) throw new Error("Connect a Stacks wallet before claiming.");

      setTransaction({
        phase: "awaiting-signature",
        message: "Review the claim in your wallet. Nothing is submitted until you approve."
      });
      const { request } = await import("@stacks/connect");
      const { Cl } = await import("@stacks/transactions");
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
      if (!txId) throw new Error("The wallet did not return a transaction ID.");
      await finishStacksTransaction(
        txId,
        `Patch ${selectedCell.y + 1}.${selectedCell.x + 1} is now yours.`
      );
    } catch (error) {
      setTransaction({
        phase: "failed",
        message: getFriendlyActionError(error, "The Stacks claim was not completed.")
      });
    } finally {
      setPendingClaimIndex(null);
    }
  };

  const boostSelected = async () => {
    if (!selectedCell?.owner || !contract || roundId !== todayRoundId) return;

    setPendingBoostIndex(selectedCell.index);
    try {
      let address = wallet.address;
      if (!address) {
        setTransaction({ phase: "connecting", message: "Opening Stacks Connect…" });
        address = await connectWallet();
      }
      if (!address) throw new Error("Connect a Stacks wallet before boosting.");

      setTransaction({
        phase: "awaiting-signature",
        message: "Review the boost in your wallet. Nothing is submitted until you approve."
      });
      const { request } = await import("@stacks/connect");
      const { Cl } = await import("@stacks/transactions");
      const response = await request("stx_callContract", {
        contract: getContractId(contract),
        functionName: "boost-cell",
        functionArgs: [Cl.uint(roundId), Cl.uint(selectedCell.index)],
        network: publicEnv.stacksNetwork
      });
      const txId = getTxId(response);
      if (!txId) throw new Error("The wallet did not return a transaction ID.");
      await finishStacksTransaction(
        txId,
        `Patch ${selectedCell.y + 1}.${selectedCell.x + 1} received your boost.`
      );
      setSelectedHasBoosted(true);
    } catch (error) {
      setTransaction({
        phase: "failed",
        message: getFriendlyActionError(error, "The Stacks boost was not completed.")
      });
    } finally {
      setPendingBoostIndex(null);
    }
  };

  return (
    <ArenaExperience
      network="stacks"
      networkLabel="Stacks"
      networkDetail={publicEnv.stacksNetwork === "mainnet" ? "Mainnet" : "Testnet"}
      configured={configured}
      cells={cells}
      selectedIndex={selectedIndex}
      selectedHasBoosted={selectedHasBoosted}
      color={color}
      walletAddress={wallet.address}
      walletName="Stacks wallet"
      playerStats={playerStats}
      roundId={roundId}
      todayRoundId={todayRoundId}
      loadState={loadState}
      loadError={loadError}
      transaction={transaction}
      pendingClaimIndex={pendingClaimIndex}
      pendingBoostIndex={pendingBoostIndex}
      onSelect={(cell) => {
        setSelectedHasBoosted(cell.owner && wallet.address ? null : false);
        setSelectedIndex(cell.index);
      }}
      onCloseSelection={() => setSelectedIndex(null)}
      onColorChange={setColor}
      onConnect={connectFromInterface}
      onDisconnect={disconnectWallet}
      onRefresh={loadBoard}
      onRoundChange={(nextRoundId) => {
        setRoundId(nextRoundId);
        setSelectedIndex(null);
        setSelectedHasBoosted(false);
        setTransaction(idleTransaction);
        setLoadError("");
      }}
      onClaim={claimSelected}
      onBoost={boostSelected}
    />
  );
}
