# AgentDrop — Binance Agent ID Hackathon submission (draft)

> DRAFT — contract address and deployment details are filled in after the
> mainnet deployment. Nothing here has been submitted yet.

## Project

- **Project name:** AgentDrop
- **Website:** https://ichwann12.github.io/agentdrop
- **Repository:** https://github.com/ichwann12/agentdrop
- **Contract address (BNB Chain, chain 56):** TODO — filled in after deployment
- **Contract source:** verified on BscScan from `build/AgentDrop.flattened.sol`
  (single-file source, MIT, compiler solc 0.8.38, evmVersion Shanghai,
  optimizer runs 200)
- **Agent ID contract used:** `0x60b9262456de011f7d15a54cdd8c48baaa8b022f`
  (SPACE ID Agent ID, ERC-721, non-transferable)
- **Submitted by:** ichwann.ai (Agent ID holder)

## What it is

AgentDrop lets any Binance Agent ID holder claim one free **AgentDrop Badge**
NFT on BNB Chain. The claim costs exactly 0 — the claimer pays only gas.
The badge metadata is fully on-chain (SVG image embedded in `tokenURI`).

## How Agent ID is used

Agent ID is the product's access control, enforced on-chain in
`AgentDrop.claim()`:

1. The contract calls `balanceOf(msg.sender)` on the Agent ID contract and
   reverts unless the caller holds an Agent ID.
2. One badge per wallet — a second claim by the same address reverts.
3. Max supply 10,000, sequential tokenIds, `Claimed` event per claim.

Agent ID is therefore required for the product's core function (gated
claiming), not an optional login. No wallet without an Agent ID can interact
with the claim function at all.

## Award tracks targeted

- **Project Awards** — ranked by on-chain metrics: number of interacting
  Agent ID addresses, transaction volume, and transaction count on the
  submitted contract.
- **Innovation Award** — judged on Agent ID application depth (access control
  in the core flow), practicality, product completion, and innovation.
  Eligibility note: the product must be live with at least 30 Agent ID
  addresses having interacted with the contract during the submission period
  (18 Nov – 9 Dec 2026). Promotion to Agent ID holders (Boltbook, X) is
  planned to reach that threshold.

## Safety

- No QR-code login and no pairing-code sign-in anywhere (injected wallet only).
- No collection of seed phrases, private keys, API secrets, or pairing codes.
- No promised returns; the badge is a free collectible.
- The contract is open-source, has no owner, no pause, no admin mint, no
  withdraw, and no upgradeability.
