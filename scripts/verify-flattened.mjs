// Verify build/AgentDrop.flattened.sol reproduces the artifact:
// compiles the single flattened file and compares its ABI and its
// deployed bytecode (minus the trailing metadata hash, which differs
// because the source file paths differ) against build/AgentDrop.json.
// Run: node scripts/verify-flattened.mjs
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import solc from 'solc';

const flat = fs.readFileSync('build/AgentDrop.flattened.sol', 'utf8');
const input = {
  language: 'Solidity',
  sources: { 'AgentDrop.flattened.sol': { content: flat } },
  settings: {
    evmVersion: 'shanghai',
    optimizer: { enabled: true, runs: 200 },
    outputSelection: {
      '*': { '*': ['abi', 'evm.deployedBytecode.object'] },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));
if (output.errors?.some((e) => e.severity === 'error')) {
  for (const e of output.errors) console.log(e.formattedMessage);
  process.exit(1);
}

const flatContract = output.contracts['AgentDrop.flattened.sol']['AgentDrop'];
const artifact = JSON.parse(fs.readFileSync('build/AgentDrop.json', 'utf8'));

const abiEqual = JSON.stringify(flatContract.abi) === JSON.stringify(artifact.abi);
console.log(`ABI identical: ${abiEqual}`);

// The deployed bytecode ends with a 53-byte metadata hash (IPFS + solc
// version) that depends on source file paths, so strip it before comparing.
const strip = (hex) => hex.slice(0, -106);
const flatCode = strip(flatContract.evm.deployedBytecode.object);
const artifactCode = strip(artifact.deployedBytecode.slice(2));
const codeEqual = flatCode === artifactCode;
console.log(`deployed bytecode identical (metadata hash stripped): ${codeEqual}`);
console.log(`flattened deployed bytes: ${flatContract.evm.deployedBytecode.object.length / 2}`);
console.log(
  `flattened deployed sha256 (stripped): ${createHash('sha256').update(flatCode).digest('hex')}`,
);

if (!abiEqual || !codeEqual) {
  console.log('MISMATCH — flattened source does not reproduce the artifact');
  process.exit(1);
}
console.log('verify-flattened OK — the flattened file is a faithful single-file source');
