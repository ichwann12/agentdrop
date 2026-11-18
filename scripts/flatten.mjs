// Flatten contracts/AgentDrop.sol into a single file (build/AgentDrop.flattened.sol)
// for BscScan source verification. Inlines every import (post-order, deduped),
// strips duplicate SPDX lines and pragmas, and emits a single pragma using the
// highest ^0.8.x minor version required by any inlined file.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ENTRY = 'contracts/AgentDrop.sol';

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

const visited = new Set();
const chunks = [];
let maxMinor = 20;

function processFile(key) {
  if (visited.has(key)) return;
  visited.add(key);
  const source = readSource(key);
  for (const imp of parseImports(source)) processFile(resolveImport(key, imp));
  for (const m of source.matchAll(/pragma solidity\s*\^0\.8\.(\d+)\s*;/g)) {
    maxMinor = Math.max(maxMinor, parseInt(m[1], 10));
  }
  const body = source
    .replace(/import\s+(?:[^'"]*?\s+from\s+)?['"][^'"]+['"]\s*;/g, '')
    .replace(/\/\/\s*SPDX-License-Identifier:[^\n]*\n/g, '')
    .replace(/pragma solidity[^;]+;/g, '')
    .trim();
  chunks.push(`// ---- ${key} ----\n${body}`);
}

processFile(ENTRY);

const out = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.${maxMinor};

${chunks.join('\n\n')}
`;
fs.mkdirSync(path.join(ROOT, 'build'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'build', 'AgentDrop.flattened.sol'), out);
console.log(`wrote build/AgentDrop.flattened.sol (${out.length} bytes, pragma ^0.8.${maxMinor}, ${visited.size} files inlined)`);
