import type { Hex } from "viem";

export const CELO_MAINNET_CHAIN_ID = 42220;
export const CELO_SEPOLIA_CHAIN_ID = 11142220;

export type CeloNetwork = "celo" | "celoSepolia";
export type StacksNetwork = "mainnet" | "testnet";

function readPublicVar(value: string | undefined, fallback = "") {
  return value?.trim() || fallback;
}

function normalizeCeloNetwork(value: string): CeloNetwork {
  return value === "celo" ? "celo" : "celoSepolia";
}

function normalizeStacksNetwork(value: string): StacksNetwork {
  return value === "mainnet" ? "mainnet" : "testnet";
}

export const publicEnv = {
  // Use direct process.env.NEXT_PUBLIC_* reads so Next can inline values
  // into client bundles at build time.
  appUrl: readPublicVar(
    process.env.NEXT_PUBLIC_APP_URL,
    "http://localhost:3000"
  ),
  talentProjectVerification: readPublicVar(
    process.env.NEXT_PUBLIC_TALENT_PROJECT_VERIFICATION
  ),
  celoNetwork: normalizeCeloNetwork(
    readPublicVar(process.env.NEXT_PUBLIC_CELO_NETWORK, "celo")
  ),
  celoContractAddress: readPublicVar(
    process.env.NEXT_PUBLIC_PATCHRUSH_CELO_CONTRACT_ADDRESS
  ) as Hex | "",
  celoDeploymentBlock: readPublicVar(
    process.env.NEXT_PUBLIC_PATCHRUSH_CELO_DEPLOYMENT_BLOCK
  ),
  celoMainnetRpcUrl: readPublicVar(
    process.env.NEXT_PUBLIC_CELO_MAINNET_RPC_URL,
    "https://forno.celo.org"
  ),
  celoSepoliaRpcUrl: readPublicVar(
    process.env.NEXT_PUBLIC_CELO_SEPOLIA_RPC_URL,
    "https://forno.celo-sepolia.celo-testnet.org"
  ),
  stacksNetwork: normalizeStacksNetwork(
    readPublicVar(process.env.NEXT_PUBLIC_STACKS_NETWORK, "mainnet")
  ),
  stacksContractAddress: readPublicVar(
    process.env.NEXT_PUBLIC_PATCHRUSH_STACKS_CONTRACT_ADDRESS
  ),
  stacksContractName: readPublicVar(
    process.env.NEXT_PUBLIC_PATCHRUSH_STACKS_CONTRACT_NAME,
    "patchrush-arena"
  ),
  stacksApiMainnet: readPublicVar(
    process.env.NEXT_PUBLIC_STACKS_API_MAINNET,
    "https://api.hiro.so"
  ),
  stacksApiTestnet: readPublicVar(
    process.env.NEXT_PUBLIC_STACKS_API_TESTNET,
    "https://api.testnet.hiro.so"
  )
};

export function getCeloChainId(network = publicEnv.celoNetwork) {
  return network === "celo" ? CELO_MAINNET_CHAIN_ID : CELO_SEPOLIA_CHAIN_ID;
}

export function getCeloChainLabel(network = publicEnv.celoNetwork) {
  return network === "celo" ? "Celo Mainnet" : "Celo Sepolia";
}

export function getCeloRpcUrl(network = publicEnv.celoNetwork) {
  return network === "celo"
    ? publicEnv.celoMainnetRpcUrl
    : publicEnv.celoSepoliaRpcUrl;
}

export function getCeloExplorerBaseUrl(network = publicEnv.celoNetwork) {
  return network === "celo"
    ? "https://celoscan.io"
    : "https://celo-sepolia.blockscout.com";
}

export function getCeloAddChainParameters(network = publicEnv.celoNetwork) {
  const chainId = getCeloChainId(network);

  return {
    chainId: `0x${chainId.toString(16)}`,
    chainName: getCeloChainLabel(network),
    nativeCurrency: {
      name: "CELO",
      symbol: "CELO",
      decimals: 18
    },
    rpcUrls: [getCeloRpcUrl(network)],
    blockExplorerUrls: [getCeloExplorerBaseUrl(network)]
  };
}

export function getStacksApiUrl(network = publicEnv.stacksNetwork) {
  return network === "mainnet"
    ? publicEnv.stacksApiMainnet
    : publicEnv.stacksApiTestnet;
}

export function getStacksExplorerTxUrl(
  txId: string,
  network = publicEnv.stacksNetwork
) {
  const normalizedTxId = txId.startsWith("0x") ? txId : `0x${txId}`;
  return `https://explorer.stacks.co/txid/${normalizedTxId}?chain=${network}`;
}

export function getCeloExplorerTxUrl(
  txHash: string,
  network = publicEnv.celoNetwork
) {
  return `${getCeloExplorerBaseUrl(network)}/tx/${txHash}`;
}

export function hasCeloContract() {
  return Boolean(publicEnv.celoContractAddress);
}

export function hasStacksContract() {
  return Boolean(publicEnv.stacksContractAddress && publicEnv.stacksContractName);
}
