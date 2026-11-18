// Compile AgentDrop.sol + MockAgentId.sol with solc-js.
// Resolves @openzeppelin imports from node_modules and relative imports
// inside OpenZeppelin by walking the import graph. Writes build/<Name>.json
// (ABI, creation + deployed bytecode, metadata, compiler version) and
// build/bytecode.sha256 (sha256 of the AgentDrop creation bytecode).
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import solc from 'solc';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUILD = path.join(ROOT, 'build');
const ENTRY_FILES = ['contracts/AgentDrop.sol', 'contracts/test/MockAgentId.sol'];
const WANTED = new Set(['AgentDrop', 'MockAgentId']);

function readSource(key) {
  const file = key.startsWith('@openzeppelin/')
    ? path.join(ROOT, 'node_modules', key)
    : path.join(ROOT, key);
  return fs.readFileSync(file, 'utf8');
}

function parseImports(source) {
  const imports = [];
  const re = /import\s+(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]\s*;/g;
  let m;
  while ((m = re.exec(source)) !== null) imports.push(m[1]);
  return imports;
}

function resolveImport(fromKey, importPath) {
  if (importPath.startsWith('@')) return importPath;
  const dir = path.posix.dirname(fromKey);
  return path.posix.normalize(path.posix.join(dir, importPath));
}

function collectSources() {
  const sources = {};
  const queue = [...ENTRY_FILES];
  const seen = new Set();
  while (queue.length > 0) {
    const key = queue.shift();
    if (seen.has(key)) continue;
    seen.add(key);
    sources[key] = { content: readSource(key) };
    for (const imp of parseImports(sources[key].content)) {
      queue.push(resolveImport(key, imp));
    }
  }
  return sources;
}

const input = {
  language: 'Solidity',
  sources: collectSources(),
  settings: {
    evmVersion: 'shanghai',
    optimizer: { enabled: true, runs: 200 },
    outputSelection: {
      '*': { '*': ['abi', 'evm.bytecode.object', 'evm.deployedBytecode.object', 'metadata'] },
    },
  },
};

console.log(`solc version: ${solc.version()}`);
const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
  for (const e of output.errors) {
    console.log(`${e.severity}: ${e.formattedMessage.trim()}`);
  }
  if (output.errors.some((e) => e.severity === 'error')) process.exit(1);
}

fs.mkdirSync(BUILD, { recursive: true });
let agentDropBytecode = null;
for (const [source, contracts] of Object.entries(output.contracts)) {
  for (const [name, c] of Object.entries(contracts)) {
    if (!WANTED.has(name)) continue;
    const artifact = {
      contractName: name,
      source,
      abi: c.abi,
      bytecode: `0x${c.evm.bytecode.object}`,
      deployedBytecode: `0x${c.evm.deployedBytecode.object}`,
      metadata: JSON.parse(c.metadata),
      compilerVersion: solc.version(),
    };
    fs.writeFileSync(path.join(BUILD, `${name}.json`), `${JSON.stringify(artifact, null, 2)}\n`);
    console.log(`wrote build/${name}.json (${artifact.bytecode.length / 2 - 1} bytes creation bytecode)`);
    if (name === 'AgentDrop') agentDropBytecode = artifact.bytecode;
  }
}

if (agentDropBytecode) {
  const hash = createHash('sha256').update(agentDropBytecode).digest('hex');
  fs.writeFileSync(path.join(BUILD, 'bytecode.sha256'), `${hash}  AgentDrop creation bytecode\n`);
  console.log(`AgentDrop creation bytecode sha256: ${hash}`);
}
console.log('compile OK');
