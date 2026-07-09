export const BOARD_SIZE = 6;
export const CELL_COUNT = BOARD_SIZE * BOARD_SIZE;
export const MAX_CLAIMS_PER_ROUND = 3;
export const BASE_SCORE = 10;
export const NEIGHBOR_BONUS = 3;

export type GameNetwork = "celo" | "stacks";

export type PatchCell = {
  index: number;
  x: number;
  y: number;
  owner: string;
  color: number;
  score: number;
  createdAt: number;
  boosts: number;
  network: GameNetwork;
};

export type BoardStats = {
  claimed: number;
  boosts: number;
  topScore: number;
};

export type ColorSwatch = {
  label: string;
  value: number;
};

export const colorSwatches: ColorSwatch[] = [
  { label: "Mint", value: 0x36d399 },
  { label: "Signal", value: 0x2d6cdf },
  { label: "Heat", value: 0xff7a35 },
  { label: "Gold", value: 0xf5c542 },
  { label: "Berry", value: 0xcf3d7a }
];

export function cellIndex(x: number, y: number) {
  return y * BOARD_SIZE + x;
}

export function cellCoordinates(index: number) {
  return {
    x: index % BOARD_SIZE,
    y: Math.floor(index / BOARD_SIZE)
  };
}

export function normalizeRoundId(value: string | number | null | undefined) {
  const raw = String(value || "").replace(/\D/g, "");
  if (/^20\d{6}$/.test(raw)) return Number(raw);
  return getTodayRoundId();
}

export function getTodayRoundId(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return Number(`${year}${month}${day}`);
}

export function formatRoundId(roundId: number) {
  const raw = String(roundId);
  if (!/^20\d{6}$/.test(raw)) return String(roundId);
  return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)} UTC`;
}

export function colorToHex(color: number) {
  return `#${Math.max(0, color).toString(16).padStart(6, "0").slice(-6)}`;
}

export function shortAddress(address = "") {
  if (!address) return "Not connected";
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function buildEmptyBoard(network: GameNetwork): PatchCell[] {
  return Array.from({ length: CELL_COUNT }, (_, index) => {
    const { x, y } = cellCoordinates(index);
    return {
      index,
      x,
      y,
      owner: "",
      color: 0,
      score: 0,
      createdAt: 0,
      boosts: 0,
      network
    };
  });
}

export function mergeCells(network: GameNetwork, claimedCells: PatchCell[]) {
  const board = buildEmptyBoard(network);

  for (const cell of claimedCells) {
    if (cell.index >= 0 && cell.index < board.length) {
      board[cell.index] = {
        ...cell,
        network,
        ...cellCoordinates(cell.index)
      };
    }
  }

  return board;
}

export function getBoardStats(cells: PatchCell[]): BoardStats {
  return cells.reduce(
    (stats, cell) => {
      if (!cell.owner) return stats;

      return {
        claimed: stats.claimed + 1,
        boosts: stats.boosts + cell.boosts,
        topScore: Math.max(stats.topScore, cell.score + cell.boosts)
      };
    },
    { claimed: 0, boosts: 0, topScore: 0 }
  );
}

export function createSampleCells(network: GameNetwork): PatchCell[] {
  const owners =
    network === "celo"
      ? [
          "0x8b7d5f432957e37a6a083701f9349c0619c1a684",
          "0x70f21aa287324b37930ad2fa9f942b5bb6f4ed31",
          "0xd187cfd910b8a9dc11e73d9ef7c50f8b3b19781b"
        ]
      : [
          "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
          "SP3FBR2AGK56HEK0T3DGB5Q3RF3P4F5G6Q0KJ9T2V",
          "SP1X7ZT5S1Q70XKZ0RHRP5AQ3QM8DSEK5M3W8JNA"
        ];

  const base = Math.floor(Date.now() / 1000) - 3600;
  const samples = [
    { index: 7, owner: owners[0], color: 0x36d399, score: 10, boosts: 2 },
    { index: 8, owner: owners[1], color: 0xff7a35, score: 13, boosts: 1 },
    { index: 14, owner: owners[0], color: 0x2d6cdf, score: 16, boosts: 3 },
    { index: 21, owner: owners[2], color: 0xf5c542, score: 10, boosts: 0 },
    { index: 22, owner: owners[1], color: 0xcf3d7a, score: 13, boosts: 1 }
  ];

  return samples.map((sample, order) => {
    const { x, y } = cellCoordinates(sample.index);
    return {
      ...sample,
      x,
      y,
      createdAt: base + order * 420,
      network
    };
  });
}

export const sampleCeloCells = mergeCells("celo", createSampleCells("celo"));
export const sampleStacksCells = mergeCells(
  "stacks",
  createSampleCells("stacks")
);
