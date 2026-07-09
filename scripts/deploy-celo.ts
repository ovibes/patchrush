import hre from "hardhat";

async function main() {
  const { ethers } = await hre.network.create();
  const connectedNetwork = await ethers.provider.getNetwork();
  const contract = await ethers.deployContract("PatchRushArena");
  const deploymentTx = contract.deploymentTransaction();

  await contract.waitForDeployment();
  const receipt = deploymentTx ? await deploymentTx.wait() : null;

  console.log("PatchRushArena deployed");
  console.log("network:", hre.globalOptions.network);
  console.log("chainId:", Number(connectedNetwork.chainId));
  console.log("address:", await contract.getAddress());
  console.log("deploymentTx:", deploymentTx?.hash ?? "");
  console.log("deploymentBlock:", receipt?.blockNumber ?? "");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
