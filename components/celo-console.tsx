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
  colorSwatches,
  colorToHex,
  getTodayRoundId,
  mergeCells,
  normalizeRoundId,
  sampleCeloCells,
  shortAddress,
  type PatchCell
} from "@/lib/patchrush";
import { GameBoard } from "./game-board";
import { CellActionModal } from "./cell-action-modal";

type WalletState = {
  account: string;
  chainId: number | null;
  isMiniPay: boolean;
  hasProvider: boolean;
};

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const emptyWalletState: WalletState = {
  account: "",
  chainId: null,
  isMiniPay: false,
  hasProvider: false
};

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
  if (!window.ethereum) {
    throw new Error("No injected Celo wallet was found.");
  }

  if (window.ethereum.isMiniPay) {
    return;
  }

  const targetChainId = getCeloChainId();
  const targetHex = `0x${targetChainId.toString(16)}`;
  const currentHex = await window.ethereum.request<string>({
    method: "eth_chainId"
  });

  if (currentHex?.toLowerCase() === targetHex.toLowerCase()) {
    return;
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: targetHex }]
    });
  } catch (error) {
    const maybeProviderError = error as { code?: number };

    if (maybeProviderError.code !== 4902) {
      throw error;
    }

    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [getCeloAddChainParameters()]
    });
  }
}

export function CeloConsole() {
  const [wallet, setWallet] = useState<WalletState>(emptyWalletState);
  const [cells, setCells] = useState<PatchCell[]>(sampleCeloCells);
  const [roundInput, setRoundInput] = useState(String(getTodayRoundId()));
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [cellModalOpen, setCellModalOpen] = useState(false);
  const [color, setColor] = useState(colorSwatches[0].value);
  const [message, setMessage] = useState("");
  const [txUrl, setTxUrl] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pendingClaimIndex, setPendingClaimIndex] = useState<number | null>(null);
  const [pendingBoostIndex, setPendingBoostIndex] = useState<number | null>(null);

  const contractAddress = publicEnv.celoContractAddress;
  const isConfigured = Boolean(contractAddress);
  const roundId = useMemo(() => normalizeRoundId(roundInput), [roundInput]);
  const selectedCell =
    selectedIndex === null ? null : cells.find((cell) => cell.index === selectedIndex);
  const hasWallet = Boolean(wallet.account);
  const pendingCellAction =
    selectedCell &&
    (pendingClaimIndex === selectedCell.index || pendingBoostIndex === selectedCell.index);

  const refreshWallet = useCallback(async () => {
    if (!window.ethereum) {
      setWallet(emptyWalletState);
      return;
    }

    const [accounts, chainHex] = await Promise.all([
      window.ethereum.request<string[]>({
        method: "eth_accounts",
        params: []
      }),
      window.ethereum.request<string>({
        method: "eth_chainId"
      })
    ]);

    setWallet({
      account: accounts[0] || "",
      chainId: chainHex ? Number.parseInt(chainHex, 16) : null,
      isMiniPay: Boolean(window.ethereum.isMiniPay),
      hasProvider: true
    });
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setMessage("Install MiniPay or another Celo wallet to play PatchRush.");
      return "";
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
      return;
    }

    setIsRefreshing(true);
    try {
      const provider = new JsonRpcProvider(getCeloRpcUrl());
      const contract = new Contract(contractAddress, patchRushCeloAbi, provider);
      const claimed = await Promise.all(
        Array.from({ length: CELL_COUNT }, async (_, index) => {
          const raw = await contract.getCell(roundId, index);
          return mapRawCell(raw, index);
        })
      );

      setCells(mergeCells("celo", claimed.filter(Boolean) as PatchCell[]));
      setMessage("Loaded live Celo board.");
    } catch (error) {
      setCells(sampleCeloCells);
      setMessage(
        error instanceof Error
          ? `Could not load Celo board: ${error.message}`
          : "Could not load Celo board."
      );
    } finally {
      setIsRefreshing(false);
    }
  }, [contractAddress, roundId]);

  const claimSelected = useCallback(async () => {
    if (!selectedCell) {
      setMessage("Pick a cell before claiming.");
      return;
    }

    if (selectedCell.owner) {
      setMessage("That patch is already claimed. Boost it instead.");
      return;
    }

    if (!contractAddress) {
      setMessage("Live Celo contract is not configured yet. Sample board is shown.");
      return;
    }

    setPendingClaimIndex(selectedCell.index);
    setMessage("");
    setTxUrl("");

    try {
      await ensureCeloChain();
      const account = wallet.account || (await connect());
      if (!account || !window.ethereum) {
        throw new Error("Connect a Celo wallet before claiming.");
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, patchRushCeloAbi, signer);
      const tx = await contract.claimCell(roundId, selectedCell.x, selectedCell.y, color);
      const receipt = await tx.wait();

      setTxUrl(getCeloExplorerTxUrl(receipt.hash));
      setMessage(`Claimed patch ${selectedCell.x + 1},${selectedCell.y + 1}.`);
      await refreshWallet();
      await loadBoard();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Celo claim transaction was rejected."
      );
    } finally {
      setPendingClaimIndex(null);
    }
  }, [
    color,
    connect,
    contractAddress,
    loadBoard,
    refreshWallet,
    roundId,
    selectedCell,
    wallet.account
  ]);

  const boostCell = useCallback(
    async (cell: PatchCell) => {
      if (!contractAddress) {
        setMessage("Live Celo boosts are not configured yet.");
        return;
      }

      setPendingBoostIndex(cell.index);
      setMessage("");
      setTxUrl("");

      try {
        await ensureCeloChain();
        const account = wallet.account || (await connect());
        if (!account || !window.ethereum) throw new Error("No Celo wallet available.");

        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new Contract(contractAddress, patchRushCeloAbi, signer);
        const tx = await contract.boostCell(roundId, cell.index);
        const receipt = await tx.wait();

        setTxUrl(getCeloExplorerTxUrl(receipt.hash));
        setMessage(`Boosted patch ${cell.x + 1},${cell.y + 1}.`);
        await loadBoard();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not boost cell.");
      } finally {
        setPendingBoostIndex(null);
      }
    },
    [connect, contractAddress, loadBoard, roundId, wallet.account]
  );

  useEffect(() => {
    const refreshId = window.setTimeout(() => {
      void refreshWallet();
      void loadBoard();
    }, 0);

    return () => window.clearTimeout(refreshId);
  }, [loadBoard, refreshWallet]);

  return (
    <section className="play-page celo-play" aria-labelledby="celo-title">
      <div className="play-topbar">
        <div className="play-title-block">
          <span className="hud-tag">CELO // {getCeloChainLabel()}</span>
          <h1 id="celo-title">Celo arena</h1>
          <p>Pick a cell. Claim open cells. Boost claimed cells.</p>
        </div>

        <div className="play-toolbar" aria-label="Celo controls">
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
            <span>{wallet.isMiniPay ? "MiniPay" : "Wallet"}</span>
            <strong>{hasWallet ? shortAddress(wallet.account) : "Not connected"}</strong>
            {!hasWallet ? (
              <button type="button" className="ghost-button" onClick={() => void connect()}>
                Connect
              </button>
            ) : null}
          </div>

          <button type="button" className="ghost-button" onClick={() => void loadBoard()}>
            <span className="button-glyph" aria-hidden="true">
              RLD
            </span>
            {isRefreshing ? "Refreshing" : "Refresh"}
          </button>
        </div>
      </div>

      <GameBoard
        cells={cells}
        selectedIndex={selectedIndex}
        networkLabel="Celo arena"
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
        <p>
          {isConfigured
            ? "Live Celo board is configured."
            : "Sample board shown until the Celo contract address is set."}
        </p>
      </details>

      {cellModalOpen ? (
        <CellActionModal
          cell={selectedCell || null}
          color={color}
          message={message}
          networkLabel="Celo"
          onClaim={() => void claimSelected()}
          onClose={() => setCellModalOpen(false)}
          onConnect={() => void connect()}
          onBoost={() => {
            if (selectedCell) void boostCell(selectedCell);
          }}
          pending={Boolean(pendingCellAction)}
          roundId={roundId}
          txUrl={txUrl}
          walletConnected={hasWallet}
          walletLabel="Celo wallet"
        />
      ) : null}
    </section>
  );
}
