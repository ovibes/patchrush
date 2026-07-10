import { describe, expect, it } from "vitest";
import {
  buildEmptyBoard,
  clampRoundIdToToday,
  formatRoundId,
  getPredictedClaimScore,
  isValidRoundId,
  normalizeRoundId,
  shiftRoundId
} from "@/lib/patchrush";

describe("round utilities", () => {
  it("rejects impossible calendar dates", () => {
    expect(isValidRoundId(20260229)).toBe(false);
    expect(isValidRoundId(20261310)).toBe(false);
    expect(normalizeRoundId(20260229)).not.toBe(20260229);
  });

  it("shifts rounds in UTC across month and leap-year boundaries", () => {
    expect(shiftRoundId(20240228, 1)).toBe(20240229);
    expect(shiftRoundId(20240229, 1)).toBe(20240301);
    expect(shiftRoundId(20260101, -1)).toBe(20251231);
  });

  it("clamps future navigation to today", () => {
    expect(clampRoundIdToToday(20260712, 20260710)).toBe(20260710);
    expect(clampRoundIdToToday(20260708, 20260710)).toBe(20260708);
  });

  it("formats a readable UTC label", () => {
    expect(formatRoundId(20260710)).toBe("Fri, Jul 10, 2026 · UTC");
  });
});

describe("claim score preview", () => {
  it("adds three points for each occupied orthogonal neighbor", () => {
    const cells = buildEmptyBoard("celo");
    cells[8] = { ...cells[8], owner: "0x1", color: 1, score: 10 };
    cells[13] = { ...cells[13], owner: "0x2", color: 1, score: 10 };

    expect(getPredictedClaimScore(cells, 14)).toBe(16);
  });

  it("does not count diagonal neighbors", () => {
    const cells = buildEmptyBoard("celo");
    cells[7] = { ...cells[7], owner: "0x1", color: 1, score: 10 };

    expect(getPredictedClaimScore(cells, 14)).toBe(10);
  });
});
