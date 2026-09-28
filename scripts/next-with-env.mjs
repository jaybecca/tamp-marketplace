import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

function parseEnv(text) {
  const out = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    out[key] = value;
  }
  return out;
}

const root = process.cwd();
const envExample = path.join(root, '.env.example');
const env = { ...parseEnv(fs.existsSync(envExample) ? fs.readFileSync(envExample, 'utf8') : ''), ...process.env };
const nextBin = path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next');
if (!fs.existsSync(nextBin)) {
  console.error('Next.js is not installed. Run npm install first.');
  process.exit(1);
}
const child = spawn(process.execPath, [nextBin, ...process.argv.slice(2)], { cwd: root, env, stdio: 'inherit' });
child.on('exit', (code, signal) => process.exit(signal ? 1 : (code ?? 1)));
