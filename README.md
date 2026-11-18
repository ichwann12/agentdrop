# AgentDrop

**One free badge for Binance Agent ID holders.**

AgentDrop is a dApp for the [Binance Agent ID Hackathon](https://www.binance.com/en/support/announcement/detail/95f5dbe0ea674a48a739b59e046648bf)
(submission 18 Nov – 9 Dec 2026). Anyone holding a Binance Agent ID (`name.ai`)
can claim one free **AgentDrop Badge** NFT on BNB Chain. The price is exactly 0 —
the claimer only pays gas. No fees, no promises, no owner privileges.

- **Website:** https://ichwann12.github.io/agentdrop
- **Repository:** https://github.com/ichwann12/agentdrop
- **Contract:** *not deployed yet* (address added here after deployment)

## How Agent ID is used

Agent ID is the access control for the whole product — it is not a cosmetic check:

- `AgentDrop.claim()` reads `balanceOf(msg.sender)` on the SPACE ID Agent ID
  contract (`0x60b9262456de011f7d15a54cdd8c48baaa8b022f`, BNB Chain mainnet,
  ERC-721, non-transferable) and reverts with `NotAgentIdHolder()` unless the
  caller holds an Agent ID.
- One badge per wallet: `claimed[msg.sender]` is set on the first claim and
  any second claim reverts with `AlreadyClaimed()`.
- Max supply is 10,000 badges, sequential tokenIds starting at 1. When the
  supply is reached, `claim()` reverts with `MaxSupplyReached()`.
- Every claim emits `Claimed(address indexed claimer, uint256 indexed tokenId)`,
  so the interacting Agent ID addresses are countable on-chain.

## Contract

`contracts/AgentDrop.sol` (Solidity ^0.8.20, SPDX MIT, OpenZeppelin 5.0.2):

| Item | Value |
| --- | --- |
| Name / symbol | AgentDrop Badge / AGENTDROP |
| Price | 0 (gas only) |
| Max supply | 10,000 |
| Functions | `claim()`, `claimed(address)`, `totalClaimed()`, `MAX_SUPPLY()`, `AGENT_ID()`, standard ERC-721 views, `tokenURI(uint256)` |
| Metadata | Fully on-chain: `tokenURI` returns a `data:application/json;base64` URI with a base64 SVG badge |
| Constructor | `constructor(address agentIdContract)` — pass the Agent ID contract address |

### No owner privileges — by design

The contract has **no owner at all**: no `Ownable`, no pause, no admin mint,
no withdraw function (there is nothing to withdraw — claiming is free), no
upgradeability, no way to change the Agent ID contract or the supply after
deployment. The Agent ID address is `immutable`, set once in the constructor.
Verified in the test suite: the ABI contains no `owner`, `pause`, `withdraw`,
`mint` or similar admin function.

### Build outputs (`build/`)

- `AgentDrop.json` — ABI, creation + deployed bytecode, metadata, compiler version
- `AgentDrop.flattened.sol` — single-file source for BscScan verification
- `bytecode.sha256` — sha256 of the creation bytecode
- `MockAgentId.json` — test-only mock of the Agent ID contract (not deployed)

Compiler: solc 0.8.38, `evmVersion: shanghai`, optimizer enabled (runs 200).
Creation bytecode: 7,288 bytes. Creation bytecode sha256:
`6cd148e987c3a4474e24ba47cd11a5e7c89811e2e57c6102ddb75f06e5f7acd9`.
Deployment measured locally at 1,553,970 gas; a claim costs ~120,246 gas.
At the ~0.05 gwei BSC gas price seen on 18 Nov 2026, deployment is roughly
0.00008 BNB and a claim roughly 0.000006 BNB.

> Note on the toolchain: OpenZeppelin 5.6 uses the Cancun-only `MCOPY`
> opcode, which this project's local test chain (Ganache 7.9.2) does not
> support, so the project pins OpenZeppelin **5.0.2** and compiles for the
> **Shanghai** EVM. Shanghai-target bytecode runs unchanged on BNB Chain
> mainnet. See `scripts/compile.mjs`.

## Website

`index.html` is a static page (no build step) served by GitHub Pages. It
connects a wallet through the **injected provider only** (`window.ethereum` —
MetaMask / Binance Wallet extension). It reads the Agent ID balance, the
claim status, and the total claimed from a public BSC RPC, and sends the
`claim()` transaction through the connected wallet.

Run it locally:

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Development

```sh
npm install
npm run compile    # compile contracts -> build/
npm run flatten    # single-file source -> build/AgentDrop.flattened.sol
node scripts/verify-flattened.mjs   # prove the flattened file reproduces the artifact
npm test           # 19 checks on a local Ganache chain (mock Agent ID)
```

Tests cover: non-holder reverts, one claim per wallet, sequential tokenIds,
`Claimed` event, on-chain `tokenURI` JSON + SVG, nonexistent-token revert,
no admin functions in the ABI, and the constants (supply, name, symbol).

## Safety and hackathon red-line compliance

- **No QR-code login.** The site never shows a QR code and never asks for a
  pairing code. Wallet connection is injected-provider only.
- **No credential collection.** AgentDrop never asks for seed phrases, private
  keys, API secrets, or pairing codes — not on the site, not in the contract.
- **No promised returns.** The badge is a free collectible. Nothing here
  promises income, yield, or any financial return.
- **Contracts open-source.** The full source is in this repository and the
  flattened file is published for BscScan verification.
- **No brand impersonation.** "AgentDrop" uses no Binance/BNB branding in its
  name or token name. It only reads the public Agent ID contract.

## Hackathon submission summary

See [SUBMISSION.md](SUBMISSION.md) for the draft submission: project name,
website, contract address (to be filled after deployment), Agent ID usage
description, and the two award tracks targeted (Project Awards and Innovation
Award).

## License

MIT — see [LICENSE](LICENSE).
