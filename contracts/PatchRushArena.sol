// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract PatchRushArena {
    uint8 public constant BOARD_SIZE = 6;
    uint8 public constant CELL_COUNT = BOARD_SIZE * BOARD_SIZE;
    uint8 public constant MAX_CLAIMS_PER_ROUND = 3;
    uint16 public constant BASE_SCORE = 10;
    uint16 public constant NEIGHBOR_BONUS = 3;

    struct Cell {
        address owner;
        uint24 color;
        uint16 score;
        uint64 createdAt;
        uint16 boosts;
    }

    error InvalidRound();
    error InvalidColor();
    error CoordinateOutOfBounds();
    error CellAlreadyClaimed();
    error CellNotClaimed();
    error ClaimLimitReached();
    error AlreadyBoosted();

    event CellClaimed(
        uint32 indexed roundId,
        uint8 indexed index,
        address indexed owner,
        uint24 color,
        uint16 score
    );
    event CellBoosted(
        uint32 indexed roundId,
        uint8 indexed index,
        address indexed actor,
        address owner,
        uint16 boosts
    );

    mapping(uint32 => mapping(uint8 => Cell)) private cells;
    mapping(uint32 => mapping(address => uint8)) private claimCounts;
    mapping(uint32 => mapping(address => uint32)) private playerScores;
    mapping(uint32 => uint8) private roundClaimedCounts;
    mapping(uint32 => mapping(uint8 => mapping(address => bool))) private boostedBy;

    function claimCell(
        uint32 roundId,
        uint8 x,
        uint8 y,
        uint24 color
    ) external returns (uint8 index) {
        _validateRound(roundId);
        if (color == 0) revert InvalidColor();
        if (x >= BOARD_SIZE || y >= BOARD_SIZE) revert CoordinateOutOfBounds();
        if (claimCounts[roundId][msg.sender] >= MAX_CLAIMS_PER_ROUND) {
            revert ClaimLimitReached();
        }

        index = _cellIndex(x, y);
        if (cells[roundId][index].owner != address(0)) revert CellAlreadyClaimed();

        uint16 score = BASE_SCORE + (NEIGHBOR_BONUS * _occupiedNeighborCount(roundId, x, y));
        cells[roundId][index] = Cell({
            owner: msg.sender,
            color: color,
            score: score,
            createdAt: uint64(block.timestamp),
            boosts: 0
        });

        claimCounts[roundId][msg.sender] += 1;
        playerScores[roundId][msg.sender] += score;
        roundClaimedCounts[roundId] += 1;

        emit CellClaimed(roundId, index, msg.sender, color, score);
    }

    function boostCell(uint32 roundId, uint8 index) external returns (uint16 boosts) {
        _validateRound(roundId);
        if (index >= CELL_COUNT) revert CoordinateOutOfBounds();

        Cell storage cell = cells[roundId][index];
        if (cell.owner == address(0)) revert CellNotClaimed();
        if (boostedBy[roundId][index][msg.sender]) revert AlreadyBoosted();

        boostedBy[roundId][index][msg.sender] = true;
        boosts = cell.boosts + 1;
        cell.boosts = boosts;
        playerScores[roundId][cell.owner] += 1;

        emit CellBoosted(roundId, index, msg.sender, cell.owner, boosts);
    }

    function getCell(uint32 roundId, uint8 index) external view returns (Cell memory) {
        if (index >= CELL_COUNT) revert CoordinateOutOfBounds();
        return cells[roundId][index];
    }

    function getPlayerScore(
        uint32 roundId,
        address player
    ) external view returns (uint32) {
        return playerScores[roundId][player];
    }

    function getClaimCount(
        uint32 roundId,
        address player
    ) external view returns (uint8) {
        return claimCounts[roundId][player];
    }

    function getRoundClaimedCount(uint32 roundId) external view returns (uint8) {
        return roundClaimedCounts[roundId];
    }

    function hasBoosted(
        uint32 roundId,
        uint8 index,
        address player
    ) external view returns (bool) {
        if (index >= CELL_COUNT) revert CoordinateOutOfBounds();
        return boostedBy[roundId][index][player];
    }

    function _validateRound(uint32 roundId) private pure {
        if (roundId < 20200101 || roundId > 20991231) revert InvalidRound();
    }

    function _cellIndex(uint8 x, uint8 y) private pure returns (uint8) {
        return y * BOARD_SIZE + x;
    }

    function _occupiedNeighborCount(
        uint32 roundId,
        uint8 x,
        uint8 y
    ) private view returns (uint16 neighbors) {
        if (x > 0 && cells[roundId][_cellIndex(x - 1, y)].owner != address(0)) {
            neighbors++;
        }
        if (x + 1 < BOARD_SIZE && cells[roundId][_cellIndex(x + 1, y)].owner != address(0)) {
            neighbors++;
        }
        if (y > 0 && cells[roundId][_cellIndex(x, y - 1)].owner != address(0)) {
            neighbors++;
        }
        if (y + 1 < BOARD_SIZE && cells[roundId][_cellIndex(x, y + 1)].owner != address(0)) {
            neighbors++;
        }
    }
}
