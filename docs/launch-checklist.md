# PatchRush Launch Checklist

- Add the project on Talent and set `NEXT_PUBLIC_TALENT_PROJECT_VERIFICATION`.
- Deploy `PatchRushArena.sol` on Celo mainnet.
- Save the Celo contract address, deployment block, deployment transaction hash, and explorer URL.
- Deploy `patchrush-arena.clar` on Stacks mainnet.
- Save the Stacks contract id, deployment transaction id, and explorer URL.
- Set the production `NEXT_PUBLIC_*` contract values before building the website.
- Open `/`, `/celo`, and `/stacks` on the deployed HTTPS origin.
- Create one live Celo claim and one live Celo boost from `/celo`, then save both explorer receipts.
- Create one live Stacks claim and one live Stacks boost from `/stacks`, then save both explorer receipts.
- Keep the website URL, both contract identifiers, all four live receipts, and both deploy receipts with the release notes.
