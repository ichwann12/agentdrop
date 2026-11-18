// Local tests for AgentDrop against an in-memory Ganache chain.
// Deploys a MockAgentId (stand-in for the real SPACE ID Agent ID contract),
// then AgentDrop pointing at it, and exercises the claim rules:
//   - non-holder cannot claim
//   - holder claims once (tokenId 1), event + state correct
//   - second claim by the same wallet reverts
//   - second holder claims tokenId 2
//   - tokenURI is a valid on-chain JSON data URI with a base64 SVG badge
//   - tokenURI for a nonexistent token reverts
//   - no owner/admin functions exist in the ABI
//   - constants: MAX_SUPPLY 10000, name/symbol correct
// Run: npm test (requires `npm run compile` first)
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ganache from 'ganache';
import { ethers } from 'ethers';

const load = (name) =>
  JSON.parse(fs.readFileSync(new URL(`../build/${name}.json`, import.meta.url), 'utf8'));

const drop = load('AgentDrop');
const mock = load('MockAgentId');

const server = ganache.server({ logging: { quiet: true }, chain: { hardfork: 'shanghai' } });
await server.listen(8545);
const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
const deployer = await provider.getSigner(0);
const alice = await provider.getSigner(1);
const bob = await provider.getSigner(2);
const [deployerAddr, aliceAddr, bobAddr] = await Promise.all([
  deployer.getAddress(),
  alice.getAddress(),
  bob.getAddress(),
]);

async function expectRevert(promise, name) {
  try {
    await promise;
    assert.fail(`expected revert ${name}, but the call succeeded`);
  } catch (err) {
    const text = `${err.message || ''}`;
    const okName =
      text.includes(name) ||
      err?.revert?.name === name ||
      (err?.revert?.signature || '').startsWith(name);
    assert.ok(okName, `expected revert ${name}, got: ${String(err.message || err).slice(0, 300)}`);
  }
}

let passed = 0;
const check = async (label, fn) => {
  await fn();
  passed += 1;
  console.log(`  ok - ${label}`);
};

// Deploy MockAgentId, give Alice an Agent ID; Bob gets none.
const mockFactory = new ethers.ContractFactory(mock.abi, mock.bytecode, deployer);
const mockAgentId = await mockFactory.deploy();
await mockAgentId.waitForDeployment();
const mockAddr = await mockAgentId.getAddress();
await (await mockAgentId.mint(aliceAddr)).wait();
assert.equal(await mockAgentId.balanceOf(aliceAddr), 1n);
assert.equal(await mockAgentId.balanceOf(bobAddr), 0n);
console.log(`MockAgentId deployed at ${mockAddr}; Alice holds 1 Agent ID, Bob holds 0`);

// Deploy AgentDrop pointing at the mock.
const dropFactory = new ethers.ContractFactory(drop.abi, drop.bytecode, deployer);
const agentDrop = await dropFactory.deploy(mockAddr);
const deployReceipt = await agentDrop.deploymentTransaction().wait();
await agentDrop.waitForDeployment();
const dropAddr = await agentDrop.getAddress();
console.log(`AgentDrop deployed at ${dropAddr} (deploy gas: ${deployReceipt.gasUsed})`);

// 1. Non-holder cannot claim.
await expectRevert(agentDrop.connect(bob).claim.staticCall(), 'NotAgentIdHolder');
passed += 1;
console.log('  ok - non-holder claim reverts NotAgentIdHolder');

// 2. Holder claims once.
const tx1 = await agentDrop.connect(alice).claim();
const receipt1 = await tx1.wait();
console.log(`  claim gas used: ${receipt1.gasUsed}`);
await check('totalClaimed is 1 after first claim', async () =>
  assert.equal(await agentDrop.totalClaimed(), 1n));
await check('claimed[alice] is true', async () => assert.equal(await agentDrop.claimed(aliceAddr), true));
await check('alice balance is 1', async () => assert.equal(await agentDrop.balanceOf(aliceAddr), 1n));
await check('owner of token 1 is alice', async () => assert.equal(await agentDrop.ownerOf(1), aliceAddr));
const claimedEvents = await agentDrop.queryFilter(agentDrop.filters.Claimed, receipt1.blockNumber, receipt1.blockNumber);
await check('Claimed event emitted (claimer=alice, tokenId=1)', async () => {
  assert.equal(claimedEvents.length, 1);
  assert.equal(claimedEvents[0].args.claimer, aliceAddr);
  assert.equal(claimedEvents[0].args.tokenId, 1n);
});

// 3. Same wallet cannot claim twice.
await expectRevert(agentDrop.connect(alice).claim.staticCall(), 'AlreadyClaimed');
passed += 1;
console.log('  ok - second claim by same wallet reverts AlreadyClaimed');

// 4. A second holder claims tokenId 2.
await (await mockAgentId.mint(bobAddr)).wait();
await (await agentDrop.connect(bob).claim()).wait();
await check('totalClaimed is 2 after second holder claims', async () =>
  assert.equal(await agentDrop.totalClaimed(), 2n));
await check('owner of token 2 is bob', async () => assert.equal(await agentDrop.ownerOf(2), bobAddr));

// 5. tokenURI is a valid on-chain JSON data URI with an SVG badge.
const uri1 = await agentDrop.tokenURI(1);
await check('tokenURI starts with data:application/json;base64,', async () =>
  assert.ok(uri1.startsWith('data:application/json;base64,')));
const meta = JSON.parse(Buffer.from(uri1.split(',')[1], 'base64').toString('utf8'));
await check('metadata name is "AgentDrop Badge #1"', async () =>
  assert.equal(meta.name, 'AgentDrop Badge #1'));
await check('metadata image is a base64 SVG data URI', async () =>
  assert.ok(meta.image.startsWith('data:image/svg+xml;base64,')));
const svg = Buffer.from(meta.image.split(',')[1], 'base64').toString('utf8');
await check('SVG badge contains "AgentDrop" and "Badge #1"', async () => {
  assert.ok(svg.includes('AgentDrop'));
  assert.ok(svg.includes('Badge #1'));
});

// 6. tokenURI for a nonexistent token reverts.
await expectRevert(agentDrop.tokenURI.staticCall(999), 'ERC721NonexistentToken');
passed += 1;
console.log('  ok - tokenURI(999) reverts ERC721NonexistentToken');

// 7. No owner/admin functions in the ABI.
const fnNames = new Set(drop.abi.filter((e) => e.type === 'function').map((e) => e.name));
await check('ABI has no owner/pause/withdraw/mint functions', async () => {
  for (const banned of ['owner', 'pause', 'unpause', 'withdraw', 'mint', 'setBaseURI', 'setAgentId']) {
    assert.ok(!fnNames.has(banned), `unexpected admin function in ABI: ${banned}`);
  }
});

// 8. Constants and identity.
await check('MAX_SUPPLY is 10000', async () => assert.equal(await agentDrop.MAX_SUPPLY(), 10000n));
await check('name is "AgentDrop Badge"', async () => assert.equal(await agentDrop.name(), 'AgentDrop Badge'));
await check('symbol is "AGENTDROP"', async () => assert.equal(await agentDrop.symbol(), 'AGENTDROP'));
await check('AGENT_ID points at the mock contract', async () =>
  assert.equal(await agentDrop.AGENT_ID(), mockAddr));

console.log(`\nAll ${passed} checks passed.`);
await server.close();
