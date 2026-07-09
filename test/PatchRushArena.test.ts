import { expect } from "chai";
import { network } from "hardhat";

type NetworkConnection = Awaited<ReturnType<typeof network.create>>;

const ROUND_ID = 20260708;

describe("PatchRushArena", function () {
  let ethers: NetworkConnection["ethers"];

  async function deployFixture() {
    const [player, booster, rival] = await ethers.getSigners();
    const PatchRushArena = await ethers.getContractFactory("PatchRushArena");
    // Hardhat generates runtime contract methods after compile; typechain is not used in this small app.
    const arena = (await PatchRushArena.deploy()) as any;
    await arena.waitForDeployment();

    return { arena, booster, player, rival };
  }

  before(async function () {
    ({ ethers } = await network.create());
  });

  it("claims a cell and stores the base score", async function () {
    const { arena, player } = await deployFixture();

    await expect(arena.connect(player).claimCell(ROUND_ID, 2, 3, 0x36d399))
      .to.emit(arena, "CellClaimed")
      .withArgs(ROUND_ID, 20, player.address, 0x36d399, 10);

    const cell = await arena.getCell(ROUND_ID, 20);
    expect(cell.owner).to.equal(player.address);
    expect(cell.color).to.equal(0x36d399);
    expect(cell.score).to.equal(10);
    expect(await arena.getPlayerScore(ROUND_ID, player.address)).to.equal(10n);
    expect(await arena.getClaimCount(ROUND_ID, player.address)).to.equal(1n);
    expect(await arena.getRoundClaimedCount(ROUND_ID)).to.equal(1n);
  });

  it("adds adjacency points from occupied orthogonal neighbors", async function () {
    const { arena, player, rival } = await deployFixture();

    await arena.connect(player).claimCell(ROUND_ID, 2, 1, 0x36d399);
    await arena.connect(rival).claimCell(ROUND_ID, 3, 2, 0xff7a35);
    await arena.connect(player).claimCell(ROUND_ID, 2, 2, 0x2d6cdf);

    const cell = await arena.getCell(ROUND_ID, 14);
    expect(cell.score).to.equal(16);
    expect(await arena.getPlayerScore(ROUND_ID, player.address)).to.equal(26n);
  });

  it("rejects occupied cells and out-of-bounds coordinates", async function () {
    const { arena, player, rival } = await deployFixture();

    await arena.connect(player).claimCell(ROUND_ID, 0, 0, 0x36d399);

    await expect(
      arena.connect(rival).claimCell(ROUND_ID, 0, 0, 0xff7a35)
    ).to.be.revertedWithCustomError(arena, "CellAlreadyClaimed");

    await expect(
      arena.connect(rival).claimCell(ROUND_ID, 6, 0, 0xff7a35)
    ).to.be.revertedWithCustomError(arena, "CoordinateOutOfBounds");
  });

  it("limits each wallet to three claims per round", async function () {
    const { arena, player } = await deployFixture();

    await arena.connect(player).claimCell(ROUND_ID, 0, 0, 0x36d399);
    await arena.connect(player).claimCell(ROUND_ID, 1, 0, 0x36d399);
    await arena.connect(player).claimCell(ROUND_ID, 2, 0, 0x36d399);

    await expect(
      arena.connect(player).claimCell(ROUND_ID, 3, 0, 0x36d399)
    ).to.be.revertedWithCustomError(arena, "ClaimLimitReached");
  });

  it("boosts a claimed cell once per wallet", async function () {
    const { arena, booster, player } = await deployFixture();

    await arena.connect(player).claimCell(ROUND_ID, 4, 4, 0x36d399);

    await expect(arena.connect(booster).boostCell(ROUND_ID, 28))
      .to.emit(arena, "CellBoosted")
      .withArgs(ROUND_ID, 28, booster.address, player.address, 1);

    const cell = await arena.getCell(ROUND_ID, 28);
    expect(cell.boosts).to.equal(1);
    expect(await arena.getPlayerScore(ROUND_ID, player.address)).to.equal(11n);
    expect(await arena.hasBoosted(ROUND_ID, 28, booster.address)).to.equal(true);

    await expect(
      arena.connect(booster).boostCell(ROUND_ID, 28)
    ).to.be.revertedWithCustomError(arena, "AlreadyBoosted");
  });

  it("rejects missing-cell boosts and invalid rounds/colors", async function () {
    const { arena, player } = await deployFixture();

    await expect(
      arena.connect(player).boostCell(ROUND_ID, 3)
    ).to.be.revertedWithCustomError(arena, "CellNotClaimed");

    await expect(
      arena.connect(player).claimCell(19991231, 0, 0, 0x36d399)
    ).to.be.revertedWithCustomError(arena, "InvalidRound");

    await expect(
      arena.connect(player).claimCell(ROUND_ID, 0, 0, 0)
    ).to.be.revertedWithCustomError(arena, "InvalidColor");
  });
});
