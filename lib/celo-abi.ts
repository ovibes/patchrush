export const patchRushCeloAbi = [
  "function claimCell(uint32 roundId, uint8 x, uint8 y, uint24 color) returns (uint8)",
  "function boostCell(uint32 roundId, uint8 index) returns (uint16)",
  "function getCell(uint32 roundId, uint8 index) view returns (tuple(address owner, uint24 color, uint16 score, uint64 createdAt, uint16 boosts))",
  "function getPlayerScore(uint32 roundId, address player) view returns (uint32)",
  "function getClaimCount(uint32 roundId, address player) view returns (uint8)",
  "function getRoundClaimedCount(uint32 roundId) view returns (uint8)",
  "function hasBoosted(uint32 roundId, uint8 index, address player) view returns (bool)",
  "event CellClaimed(uint32 indexed roundId, uint8 indexed index, address indexed owner, uint24 color, uint16 score)",
  "event CellBoosted(uint32 indexed roundId, uint8 indexed index, address indexed actor, address owner, uint16 boosts)"
] as const;
