# PatchRush

PatchRush is a tiny on-chain territory game for Celo and Stacks. Players claim
patches on a daily 6x6 board, start each move at 10 points, score +3 for each
edge-adjacent claimed patch, and boost claimed patches.

## Product

- `/`: board preview, rules, and network entry points
- `/celo`: MiniPay-ready Celo flow backed by `PatchRushArena.sol`, with a demo fallback until live values are configured
- `/stacks`: Stacks Connect flow backed by `patchrush-arena.clar`, with a demo fallback until live values are configured

The app has no database, no auth, and no indexer. It reads board state directly
from the contracts, with sample patches shown until live contract values are set.

## Quick Start

Use Node `22.13.0` or newer.

```bash
nvm install 22.13.0
nvm use 22.13.0
npm install
npm run dev
```

PatchRush runs in demo mode locally without any env file. Add a local
`.env.local` only when you want the app to read live on-chain state through
`NEXT_PUBLIC_PATCHRUSH_*` values.

For wallet testing on a phone over your local network, use:

```bash
npm run dev:mobile
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
receipt, one live Celo claim receipt, one live Celo boost receipt, one live
Stacks claim receipt, and one live Stacks boost receipt.
