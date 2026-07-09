import { initSimnet } from "@stacks/clarinet-sdk";

async function main() {
  const simnet = await initSimnet("./Clarinet.toml", true);
  const source = simnet.getContractSource("patchrush-arena");

  if (!source || !source.includes("define-public (claim-cell")) {
    throw new Error("patchrush-arena contract did not load from Clarinet.toml.");
  }

  console.log("Stacks contract check passed");
  console.log("contract: patchrush-arena");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
