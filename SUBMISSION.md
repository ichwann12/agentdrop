# AgentDrop — Binance Agent ID Hackathon submission

> **SUBMITTED 2026-11-20 17:58 WIB** — Agent ID Hackathon Project Submission
> Form (https://www.binance.com/en/survey/fb26d2bd25e04329b1ba77c7b3811d23),
> all 19 fields. Confirmation: "Survey already completed — You have already
> completed this survey. Thanks for your support to Binance." No reference ID
> shown. Demo video: https://ichwann12.github.io/agentdrop/agentdrop-demo.mp4
> (61 s, commit a93fcc1). Contact: Team AgentDrop, nurichwan81.dpk0715@gmail.com,
> Telegram @Ichwann1. Reward address 0x32fA58dFef0B2a6AE66BfcBE696D8175C5A8A64A.

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

- **SUBMITTED 2026-11-20 17:58 WIB** via the official "Agent ID Hackathon
  Project Submission Form":
  https://www.binance.com/en/survey/fb26d2bd25e04329b1ba77c7b3811d23
  (found 2026-11-20 09:29 WIB from the announcement page's "Submit Project
  Now" button and Binance Square). All 19 fields filled: project name
  AgentDrop, overview, BscScan contract link, website, X announcement,
  Agent ID usage description, use cases (Identity Recognition/Verification,
  Permission Management/Access Control, Agent Identity Binding/Identification),
  product launched Yes, contract address, BscScan link, on-chain interaction
  Yes, demo video https://ichwann12.github.io/agentdrop/agentdrop-demo.mp4,
  code repo, supporting materials, Team Name AgentDrop, contact email
  nurichwan81.dpk0715@gmail.com, Telegram @Ichwann1, reward receiving address
  `0x32fA58dFef0B2a6AE66BfcBE696D8175C5A8A64A`, participation declaration
  (all four statements checked). Confirmation page: "Survey already
  completed — You have already completed this survey. Thanks for your support
  to Binance." No submission reference ID was shown. Note: the submitted
  Agent ID description states "32 Agent ID holders have claimed so far"
  (the figure from 19 Nov); the on-chain count at submit time was 55.
- The **Agent Ecosystem Promotion (X) campaign survey**
  (https://app.binance.com/uni-qr/user-survey/ff6832f8d2984af289068c9450a3c98c)
  is for submitting X post links for the community promotion award, **not**
  for project submission. Do not confuse the two.
- **Submission deadline was 9 Dec 2026 08:00 UTC (15:00 WIB)** — submitted
  well before it. Internal review 9–17 Dec, public review 17–20 Dec.

## Safety

- No QR-code login and no pairing-code sign-in anywhere (injected wallet only).
- No collection of seed phrases, private keys, API secrets, or pairing codes.
- No promised returns; the badge is a free collectible.
- The contract is open-source, has no owner, no pause, no admin mint, no
  withdraw, and no upgradeability.
