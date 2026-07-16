# PatchRush

PatchRush is a tiny on-chain territory game for Celo and Stacks. Players claim
patches on a daily 6x6 board, score adjacency bonuses, and boost claimed patches.

## Product

- `/`: board preview, rules, and network entry points
- `/celo`: MiniPay-ready Celo flow backed by `PatchRushArena.sol`
- `/stacks`: Stacks Connect flow backed by `patchrush-arena.clar`

The app has no database, no auth, and no indexer. It reads board state directly
from the contracts, with sample cells shown until live contract values are set.

## Quick Start

Use Node `22.13.0` or newer.

```bash
nvm install 22.13.0
nvm use 22.13.0
npm install
cp .env.example .env
npm run dev
```

Local routes:

- `http://localhost:3000`
- `http://localhost:3000/celo`
- `http://localhost:3000/stacks`

## Contracts

Celo:

```bash
npm run compile:celo
npm run test:celo
npm run deploy:celo:mainnet
```

Stacks:

```bash
brew install clarinet
npm run check:stacks
npm run test:stacks
npm run deploy:stacks:mainnet
```

See [docs/deploy.md](./docs/deploy.md) for deployment values and launch notes.

## Release Checks

```bash
npm run lint
npm run typecheck
npm run build
npm test
```

For production launch, save the Celo deployment receipt, the Stacks deployment
receipt, one live Celo claim/boost receipt, and one live Stacks claim/boost
receipt.
