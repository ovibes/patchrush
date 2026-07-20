# Deploy PatchRush

Use Node `22.13.0` or newer before running Hardhat or Next:

```bash
nvm install 22.13.0
nvm use 22.13.0
node -v
npm install
```

Create a local `.env.local` only before deployment work or live contract checks.
The app can run in demo mode locally without any env file.

## Celo Mainnet

1. Set these values in `.env.local`:

```bash
PRIVATE_KEY=0x<your-celo-deployer-private-key>
CELO_MAINNET_RPC_URL=https://forno.celo.org
NEXT_PUBLIC_CELO_NETWORK=celo
```

2. Compile and deploy:

```bash
npm run compile:celo
npm run deploy:celo:mainnet
```

3. Copy the printed contract address, deployment transaction hash, deployment block, and explorer URL. Set:

```bash
NEXT_PUBLIC_PATCHRUSH_CELO_CONTRACT_ADDRESS=<mainnet-address>
NEXT_PUBLIC_PATCHRUSH_CELO_DEPLOYMENT_BLOCK=<mainnet-deploy-block>
PATCHRUSH_CELO_CONTRACT_ADDRESS_MAINNET=<mainnet-address>
```

4. Optional verification:

```bash
# set CELOSCAN_API_KEY or ETHERSCAN_API_KEY first
npm run verify:celo:mainnet
```

## Stacks Mainnet

1. Set these values in `.env.local`:

```bash
STACKS_PRIVATE_KEY=<your-stacks-private-key>
STACKS_NETWORK=mainnet
STACKS_DEPLOY_FEE_MICROSTX=300000
NEXT_PUBLIC_STACKS_NETWORK=mainnet
NEXT_PUBLIC_PATCHRUSH_STACKS_CONTRACT_NAME=patchrush-arena
```

2. Check and deploy:

```bash
npm run check:stacks
npm run deploy:stacks:mainnet
```

3. Copy the printed contract id and transaction id. Set:

```bash
NEXT_PUBLIC_PATCHRUSH_STACKS_CONTRACT_ADDRESS=<mainnet-deployer-address>
PATCHRUSH_STACKS_CONTRACT_ID_MAINNET=<mainnet-deployer-address>.patchrush-arena
```

## Talent Verification

After adding the project on Talent, copy the website verification token and set:

```bash
NEXT_PUBLIC_TALENT_PROJECT_VERIFICATION=<talent-verification-token>
```

The home page emits this as `talentapp:project_verification` metadata when set.

## Vercel

Set these production environment variables:

```bash
NEXT_PUBLIC_APP_URL=https://your-domain.example
NEXT_PUBLIC_TALENT_PROJECT_VERIFICATION=<talent-verification-token>
NEXT_PUBLIC_CELO_NETWORK=celo
NEXT_PUBLIC_PATCHRUSH_CELO_CONTRACT_ADDRESS=<mainnet-address>
NEXT_PUBLIC_PATCHRUSH_CELO_DEPLOYMENT_BLOCK=<mainnet-deploy-block>
NEXT_PUBLIC_CELO_MAINNET_RPC_URL=https://forno.celo.org
NEXT_PUBLIC_STACKS_NETWORK=mainnet
NEXT_PUBLIC_PATCHRUSH_STACKS_CONTRACT_ADDRESS=<mainnet-deployer-address>
NEXT_PUBLIC_PATCHRUSH_STACKS_CONTRACT_NAME=patchrush-arena
NEXT_PUBLIC_STACKS_API_MAINNET=https://api.hiro.so
```

Do not put deployer private keys in Vercel for normal app hosting.

## Final Checks

```bash
npm run lint
npm run typecheck
npm run build
npm test
npm run check:stacks
```

Create one live claim from `/celo` and one live claim from `/stacks`, then save
both explorer receipts with the release notes.
