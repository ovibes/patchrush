"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BrowserProvider, Contract, JsonRpcProvider } from "ethers";
import {
  getCeloAddChainParameters,
  getCeloChainId,
  getCeloChainLabel,
  getCeloExplorerTxUrl,
  getCeloRpcUrl,
  publicEnv
} from "@/lib/env";
import { patchRushCeloAbi } from "@/lib/celo-abi";
import {
  CELL_COUNT,
  MAX_CLAIMS_PER_ROUND,
  buildEmptyBoard,
  colorSwatches,
  emptyPlayerRoundStats,
  getFriendlyActionError,
  getTodayRoundId,
  idleTransaction,
  mergeCells,
  sampleCeloCells,
  type BoardLoadState,
  type PatchCell,
  type PlayerRoundStats,
  type TransactionState
} from "@/lib/patchrush";
import { ArenaExperience } from "./arena-experience";

type WalletState = {
  account: string;
  chainId: number | null;
  isMiniPay: boolean;
};

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const emptyWalletState: WalletState = { account: "", chainId: null, isMiniPay: false };

function mapRawCell(raw: Record<string, unknown>, index: number): PatchCell | null {
  const owner = String(raw.owner || "");
  if (!owner || owner.toLowerCase() === ZERO_ADDRESS) return null;

  return {
    index,
    x: index % 6,
    y: Math.floor(index / 6),
    owner,
    color: Number(raw.color),
    score: Number(raw.score),
    createdAt: Number(raw.createdAt),
    boosts: Number(raw.boosts),
    network: "celo"
  };
}

async function ensureCeloChain() {
  if (!window.ethereum) throw new Error("No injected Celo wallet was found.");
  if (window.ethereum.isMiniPay) return;

  const targetChainId = getCeloChainId();
  const targetHex = `0x${targetChainId.toString(16)}`;
  const currentHex = await window.ethereum.request<string>({ method: "eth_chainId" });
  if (currentHex?.toLowerCase() === targetHex.toLowerCase()) return;

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: targetHex }]
    });
  } catch (error) {
    if ((error as { code?: number }).code !== 4902) throw error;
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [getCeloAddChainParameters()]
    });
  }
}

export function CeloConsole() {
  const contractAddress = publicEnv.celoContractAddress;
  const configured = Boolean(contractAddress);
  const todayRoundId = useMemo(() => getTodayRoundId(), []);
  const [wallet, setWallet] = useState<WalletState>(emptyWalletState);
  const [cells, setCells] = useState<PatchCell[]>(
    configured ? buildEmptyBoard("celo") : sampleCeloCells
  );
  const [roundId, setRoundId] = useState(todayRoundId);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedHasBoosted, setSelectedHasBoosted] = useState<boolean | null>(false);
  const [color, setColor] = useState(colorSwatches[0].value);
  const [playerStats, setPlayerStats] = useState<PlayerRoundStats>(emptyPlayerRoundStats);
  const [loadState, setLoadState] = useState<BoardLoadState>(configured ? "idle" : "ready");
  const [loadError, setLoadError] = useState("");
  const [transaction, setTransaction] = useState<TransactionState>(idleTransaction);
  const [pendingClaimIndex, setPendingClaimIndex] = useState<number | null>(null);
  const [pendingBoostIndex, setPendingBoostIndex] = useState<number | null>(null);

  const selectedCell = selectedIndex === null ? null : cells[selectedIndex] || null;

  const refreshWallet = useCallback(async () => {
    if (!window.ethereum) {
      setWallet(emptyWalletState);
      return "";
    }

    const [accounts, chainHex] = await Promise.all([
      window.ethereum.request<string[]>({ method: "eth_accounts", params: [] }),
      window.ethereum.request<string>({ method: "eth_chainId" })
    ]);
    const nextWallet = {
      account: accounts[0] || "",
      chainId: chainHex ? Number.parseInt(chainHex, 16) : null,
      isMiniPay: Boolean(window.ethereum.isMiniPay)
    };
    setWallet(nextWallet);
    return nextWallet.account;
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error("No injected Celo wallet was found.");
    }
    const accounts = await window.ethereum.request<string[]>({
      method: "eth_requestAccounts",
      params: []
    });
    await refreshWallet();
    return accounts[0] || "";
  }, [refreshWallet]);

  const loadBoard = useCallback(async () => {
    if (!contractAddress) {
      setCells(sampleCeloCells);
      setPlayerStats(emptyPlayerRoundStats);
      setLoadError("");
      setLoadState("ready");
      return;
    }

    setLoadState((current) => (current === "ready" ? "refreshing" : "loading"));
    setLoadError("");
    try {
      const provider = new JsonRpcProvider(getCeloRpcUrl());
      const contract = new Contract(contractAddress, patchRushCeloAbi, provider);
      const [claimed, score, claimsUsed] = await Promise.all([
        Promise.all(
          Array.from({ length: CELL_COUNT }, async (_, index) => {
            const raw = await contract.getCell(roundId, index);
            return mapRawCell(raw, index);
          })
        ),
        wallet.account ? contract.getPlayerScore(roundId, wallet.account) : Promise.resolve(0),
        wallet.account ? contract.getClaimCount(roundId, wallet.account) : Promise.resolve(0)
      ]);
      const claimCount = Number(claimsUsed);

      setCells(mergeCells("celo", claimed.filter(Boolean) as PatchCell[]));
      setPlayerStats({
        score: Number(score),
        claimsUsed: claimCount,
        claimsRemaining: Math.max(0, MAX_CLAIMS_PER_ROUND - claimCount)
      });
      setLoadState("ready");
    } catch (error) {
      setLoadError(
        getFriendlyActionError(error, "We could not refresh the Celo board. Your last board is still shown.")
      );
      setLoadState("error");
    }
  }, [contractAddress, roundId, wallet.account]);

  useEffect(() => {
    const timer = window.setTimeout(() => void refreshWallet(), 0);
    const provider = window.ethereum;
    const handleWalletChange = () => void refreshWallet();
    provider?.on?.("accountsChanged", handleWalletChange);
    provider?.on?.("chainChanged", handleWalletChange);
    return () => {
      window.clearTimeout(timer);
      provider?.removeListener?.("accountsChanged", handleWalletChange);
      provider?.removeListener?.("chainChanged", handleWalletChange);
    };
  }, [refreshWallet]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadBoard(), 0);
    return () => window.clearTimeout(timer);
  }, [loadBoard]);

  useEffect(() => {
    if (
      !configured ||
      !wallet.account ||
      !selectedCell?.owner ||
      roundId !== todayRoundId
    ) {
      return;
    }

    let cancelled = false;
    const check = async () => {
      try {
        const provider = new JsonRpcProvider(getCeloRpcUrl());
        const contract = new Contract(contractAddress, patchRushCeloAbi, provider);
        const hasBoosted = await contract.hasBoosted(roundId, selectedCell.index, wallet.account);
        if (!cancelled) setSelectedHasBoosted(Boolean(hasBoosted));
      } catch {
        if (!cancelled) setSelectedHasBoosted(false);
      }
    };
    void check();
    return () => {
      cancelled = true;
    };
  }, [configured, contractAddress, roundId, selectedCell, todayRoundId, wallet.account]);

  const connectFromInterface = async () => {
    setTransaction({ phase: "connecting", message: "Opening your Celo wallet…" });
    try {
      const account = await connect();
      if (!account) throw new Error("No Celo account was selected.");
      setTransaction(idleTransaction);
    } catch (error) {
      setTransaction({
        phase: "failed",
        message: getFriendlyActionError(error, "We could not connect your Celo wallet.")
      });
    }
  };

  const claimSelected = async () => {
    if (!selectedCell || selectedCell.owner || !configured || roundId !== todayRoundId) return;

    setPendingClaimIndex(selectedCell.index);
    try {
      let account = wallet.account;
      if (!account) {
        setTransaction({ phase: "connecting", message: "Opening your Celo wallet…" });
        account = await connect();
      }
      if (!account || !window.ethereum) throw new Error("No Celo wallet available.");

      await ensureCeloChain();
      setTransaction({
        phase: "awaiting-signature",
        message: "Review the claim in your wallet. Nothing is submitted until you approve."
      });
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, patchRushCeloAbi, signer);
      const tx = await contract.claimCell(roundId, selectedCell.x, selectedCell.y, color);
      const txUrl = getCeloExplorerTxUrl(tx.hash);
      setTransaction({
        phase: "confirming",
        message: "Claim submitted. Waiting for Celo to confirm it…",
        txUrl
      });
      const receipt = await tx.wait();

      setTransaction({
        phase: "confirmed",
        message: `Patch ${selectedCell.y + 1}.${selectedCell.x + 1} is now yours.`,
        txUrl: getCeloExplorerTxUrl(receipt.hash)
      });
      await refreshWallet();
      await loadBoard();
    } catch (error) {
      setTransaction({
        phase: "failed",
        message: getFriendlyActionError(error, "The Celo claim was not completed.")
      });
    } finally {
      setPendingClaimIndex(null);
    }
  };

  const boostSelected = async () => {
    if (!selectedCell?.owner || !configured || roundId !== todayRoundId) return;

    setPendingBoostIndex(selectedCell.index);
    try {
      let account = wallet.account;
      if (!account) {
        setTransaction({ phase: "connecting", message: "Opening your Celo wallet…" });
        account = await connect();
      }
      if (!account || !window.ethereum) throw new Error("No Celo wallet available.");

      await ensureCeloChain();
      setTransaction({
        phase: "awaiting-signature",
        message: "Review the boost in your wallet. Nothing is submitted until you approve."
      });
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, patchRushCeloAbi, signer);
      const tx = await contract.boostCell(roundId, selectedCell.index);
      const txUrl = getCeloExplorerTxUrl(tx.hash);
      setTransaction({
        phase: "confirming",
        message: "Boost submitted. Waiting for Celo to confirm it…",
        txUrl
      });
      const receipt = await tx.wait();

      setSelectedHasBoosted(true);
      setTransaction({
        phase: "confirmed",
        message: `Patch ${selectedCell.y + 1}.${selectedCell.x + 1} received your boost.`,
        txUrl: getCeloExplorerTxUrl(receipt.hash)
      });
      await loadBoard();
    } catch (error) {
      setTransaction({
        phase: "failed",
        message: getFriendlyActionError(error, "The Celo boost was not completed.")
      });
    } finally {
      setPendingBoostIndex(null);
    }
  };

  return (
    <ArenaExperience
      network="celo"
      networkLabel="Celo"
      networkDetail={getCeloChainLabel()}
      configured={configured}
      cells={cells}
      selectedIndex={selectedIndex}
      selectedHasBoosted={selectedHasBoosted}
      color={color}
      walletAddress={wallet.account}
      walletName={wallet.isMiniPay ? "MiniPay" : "Celo wallet"}
      playerStats={playerStats}
      roundId={roundId}
      todayRoundId={todayRoundId}
      loadState={loadState}
      loadError={loadError}
      transaction={transaction}
      pendingClaimIndex={pendingClaimIndex}
      pendingBoostIndex={pendingBoostIndex}
      onSelect={(cell) => {
        setSelectedHasBoosted(cell.owner && wallet.account ? null : false);
        setSelectedIndex(cell.index);
      }}
      onCloseSelection={() => setSelectedIndex(null)}
      onColorChange={setColor}
      onConnect={connectFromInterface}
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
