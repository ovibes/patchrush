import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import {
  broadcastTransaction,
  makeContractDeploy,
  privateKeyToAddress
} from "@stacks/transactions";

const CONTRACT_NAME = "patchrush-arena";
const CONTRACT_PATH = path.join("stacks", "contracts", "patchrush-arena.clar");
const SUPPORTED_NETWORKS = new Set(["testnet", "mainnet"]);

function readRequiredEnv(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing ${name} in the environment.`);
  }

  return value;
}

async function main() {
  const network = process.env.STACKS_NETWORK || "testnet";

  if (!SUPPORTED_NETWORKS.has(network)) {
    throw new Error("STACKS_NETWORK must be either testnet or mainnet.");
  }

  const senderKey = readRequiredEnv("STACKS_PRIVATE_KEY");
  const fee = Number.parseInt(
    process.env.STACKS_DEPLOY_FEE_MICROSTX || "300000",
    10
  );

  if (!Number.isInteger(fee) || fee <= 0) {
    throw new Error("STACKS_DEPLOY_FEE_MICROSTX must be a positive integer.");
  }

  const codeBody = fs.readFileSync(CONTRACT_PATH, "utf8");
  const transaction = await makeContractDeploy({
    contractName: CONTRACT_NAME,
    codeBody,
    senderKey,
    network,
    fee
  });
  const response = await broadcastTransaction({ transaction, network });
  const senderAddress = privateKeyToAddress(senderKey, network);

  console.log("PatchRush Stacks contract submitted");
  console.log("network:", network);
  console.log("contractId:", `${senderAddress}.${CONTRACT_NAME}`);
  console.log("txId:", response.txid || response.txId || "");
  console.log(
    "explorer:",
    `https://explorer.stacks.co/txid/${response.txid || response.txId || ""}?chain=${network}`
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
