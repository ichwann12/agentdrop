# AgentDrop — Binance Agent ID Hackathon submission

> Submission draft. Contract is deployed and verified on BNB Chain mainnet.
> Project submission to Binance is NOT done yet — see "Submission channel"
> below. Nothing here has been submitted yet.

## Project

- **Project name:** AgentDrop
- **Website:** https://ichwann12.github.io/agentdrop
- **Repository:** https://github.com/ichwann12/agentdrop
- **Contract address (BNB Chain, chain 56):** [0xa399068Ad8b5359BE1c53d51219DD3E0809e526C](https://bscscan.com/address/0xa399068Ad8b5359BE1c53d51219DD3E0809e526C)
- **Contract name / symbol:** AgentDrop Badge / AGENTDROP
- **Deployed:** 2026-11-18 22:11 WIB, block 134333129, deploy tx
  [0xbc687b877f4d7a3bee5d8468f5c750e8b770b120958adc2470de7021e0c2fd7e](https://bscscan.com/tx/0xbc687b877f4d7a3bee5d8468f5c750e8b770b120958adc2470de7021e0c2fd7e)
  (fee 0.0001795 BNB), via the EIP-2470 Singleton Factory
  `0xce0042B868300000d44A59004Da54A005ffdcf9f`
- **Deployer / reward receiving address (Agentic Wallet):**
  `0x32fA58dFef0B2a6AE66BfcBE696D8175C5A8A64A`
- **Contract source:** **VERIFIED on BscScan** — verified 2026-11-19 01:23 WIB
  via the BscScan API, result "Pass - Verified". Single-file source from
  `build/AgentDrop.flattened.sol` (1,669 lines, 60,853 bytes), MIT license,
  compiler solc **v0.8.38+commit.1835d247**, optimizer enabled, **200 runs**,
  EVM version **shanghai**, constructor argument = Agent ID contract address
  `0x60b9262456de011f7d15a54cdd8c48baaa8b022f` (ABI-encoded). BscScan source
  page: https://bscscan.com/address/0xa399068Ad8b5359BE1c53d51219DD3E0809e526C#code
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

## Submission channel

- **Status (checked 2026-11-19 01:30 WIB): no official project submission
  form or link has been published.** The hackathon announcement
  (https://www.binance.com/en/support/announcement/detail/95f5dbe0ea674a48a739b59e046648bf)
  instructs projects to submit "project name, website, contract address(es),
  Agent ID usage description, and other required materials" during the
  submission period, but links no form. The same is true of the Binance
  Square version of the announcement and the @BinanceWallet X pinned post,
  which both link back to the announcement only.
- The only survey linked anywhere in the announcement is the **Agent
  Ecosystem Promotion (X) campaign survey**
  (https://app.binance.com/uni-qr/user-survey/ff6832f8d2984af289068c9450a3c98c)
  — that survey is for submitting X post links for the community promotion
  award, **not** for project submission. Do not confuse the two.
- **Submission deadline: 9 Dec 2026 08:00 UTC (15:00 WIB).** Re-check the
  announcement page and @BinanceWallet for a project submission form before
  the deadline, and add its URL here when it appears.

## Safety

- No QR-code login and no pairing-code sign-in anywhere (injected wallet only).
- No collection of seed phrases, private keys, API secrets, or pairing codes.
- No promised returns; the badge is a free collectible.
- The contract is open-source, has no owner, no pause, no admin mint, no
  withdraw, and no upgradeability.
