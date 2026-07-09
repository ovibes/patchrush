import { beforeEach, describe, expect, it } from "vitest";
import { initSimnet, type Simnet } from "@stacks/clarinet-sdk";
import { Cl } from "@stacks/transactions";

const CONTRACT = "patchrush-arena";
const ROUND_ID = 20260708;

let simnet: Simnet;
let wallet1: string;
let wallet2: string;
let wallet3: string;

function claimCell(
  x = 0,
  y = 0,
  color = 0x36d399,
  sender = wallet1,
  roundId = ROUND_ID
) {
  return simnet.callPublicFn(
    CONTRACT,
    "claim-cell",
    [Cl.uint(roundId), Cl.uint(x), Cl.uint(y), Cl.uint(color)],
    sender
  );
}

describe("patchrush-arena", () => {
  beforeEach(async () => {
    simnet = await initSimnet("./Clarinet.toml", true);
    const accounts = simnet.getAccounts();
    wallet1 = accounts.get("wallet_1")!;
    wallet2 = accounts.get("wallet_2")!;
    wallet3 = accounts.get("wallet_3")!;
  });

  it("claims a cell and updates round/player counters", () => {
    const result = claimCell(2, 3);

    expect(Cl.prettyPrint(result.result)).toBe("(ok u20)");
    expect(result.events).toHaveLength(1);

    const stored = simnet.callReadOnlyFn(
      CONTRACT,
      "get-cell",
      [Cl.uint(ROUND_ID), Cl.uint(20)],
      wallet1
    );
    const score = simnet.callReadOnlyFn(
      CONTRACT,
      "get-player-score",
      [Cl.uint(ROUND_ID), Cl.principal(wallet1)],
      wallet1
    );
    const claims = simnet.callReadOnlyFn(
      CONTRACT,
      "get-claim-count",
      [Cl.uint(ROUND_ID), Cl.principal(wallet1)],
      wallet1
    );
    const roundClaims = simnet.callReadOnlyFn(
      CONTRACT,
      "get-round-claimed-count",
      [Cl.uint(ROUND_ID)],
      wallet1
    );

    expect(Cl.prettyPrint(stored.result)).toContain("owner: ");
    expect(Cl.prettyPrint(stored.result)).toContain("score: u10");
    expect(Cl.prettyPrint(score.result)).toBe("(ok u10)");
    expect(Cl.prettyPrint(claims.result)).toBe("(ok u1)");
    expect(Cl.prettyPrint(roundClaims.result)).toBe("(ok u1)");
  });

  it("scores occupied orthogonal neighbors", () => {
    claimCell(2, 1, 0x36d399, wallet1);
    claimCell(3, 2, 0xff7a35, wallet2);
    claimCell(2, 2, 0x2d6cdf, wallet1);

    const stored = simnet.callReadOnlyFn(
      CONTRACT,
      "get-cell",
      [Cl.uint(ROUND_ID), Cl.uint(14)],
      wallet1
    );
    const score = simnet.callReadOnlyFn(
      CONTRACT,
      "get-player-score",
      [Cl.uint(ROUND_ID), Cl.principal(wallet1)],
      wallet1
    );

    expect(Cl.prettyPrint(stored.result)).toContain("score: u16");
    expect(Cl.prettyPrint(score.result)).toBe("(ok u26)");
  });

  it("rejects occupied cells and out-of-bounds coordinates", () => {
    claimCell(0, 0, 0x36d399, wallet1);

    expect(Cl.prettyPrint(claimCell(0, 0, 0xff7a35, wallet2).result)).toBe(
      "(err u403)"
    );
    expect(Cl.prettyPrint(claimCell(6, 0, 0xff7a35, wallet2).result)).toBe(
      "(err u402)"
    );
  });

  it("limits each wallet to three claims per round", () => {
    claimCell(0, 0, 0x36d399, wallet1);
    claimCell(1, 0, 0x36d399, wallet1);
    claimCell(2, 0, 0x36d399, wallet1);

    expect(Cl.prettyPrint(claimCell(3, 0, 0x36d399, wallet1).result)).toBe(
      "(err u405)"
    );
  });

  it("boosts a claimed cell once per wallet", () => {
    claimCell(4, 4, 0x36d399, wallet1);

    const boost = simnet.callPublicFn(
      CONTRACT,
      "boost-cell",
      [Cl.uint(ROUND_ID), Cl.uint(28)],
      wallet2
    );
    const duplicate = simnet.callPublicFn(
      CONTRACT,
      "boost-cell",
      [Cl.uint(ROUND_ID), Cl.uint(28)],
      wallet2
    );
    const boosted = simnet.callReadOnlyFn(
      CONTRACT,
      "has-boosted",
      [Cl.uint(ROUND_ID), Cl.uint(28), Cl.principal(wallet2)],
      wallet1
    );
    const score = simnet.callReadOnlyFn(
      CONTRACT,
      "get-player-score",
      [Cl.uint(ROUND_ID), Cl.principal(wallet1)],
      wallet1
    );

    expect(Cl.prettyPrint(boost.result)).toBe("(ok u1)");
    expect(Cl.prettyPrint(duplicate.result)).toBe("(err u406)");
    expect(Cl.prettyPrint(boosted.result)).toBe("(ok true)");
    expect(Cl.prettyPrint(score.result)).toBe("(ok u11)");
  });

  it("rejects missing-cell boosts and invalid round/color input", () => {
    const missing = simnet.callPublicFn(
      CONTRACT,
      "boost-cell",
      [Cl.uint(ROUND_ID), Cl.uint(3)],
      wallet3
    );

    expect(Cl.prettyPrint(missing.result)).toBe("(err u404)");
    expect(Cl.prettyPrint(claimCell(0, 0, 0x36d399, wallet1, 19991231).result)).toBe(
      "(err u400)"
    );
    expect(Cl.prettyPrint(claimCell(0, 0, 0, wallet1).result)).toBe("(err u401)");
  });
});
