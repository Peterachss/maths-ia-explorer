// scripts/crosscheck.mjs
// Run the Python cross-check with whichever Python 3 interpreter is available.
// Windows often has `python` and the `py -3` launcher but no `python3` alias,
// while Linux and macOS normally provide `python3`.
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const script = join(here, 'crosscheck.py');

const candidates = [
  { command: 'python3', args: [] },
  { command: 'python', args: [] },
  { command: 'py', args: ['-3'] }
];

function isPython3({ command, args }) {
  const probe = spawnSync(command, [...args, '--version'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 5000
  });
  if (probe.error || probe.status !== 0) return false;
  return /Python 3\./.test(`${probe.stdout} ${probe.stderr}`);
}

const chosen = candidates.find(isPython3);
if (!chosen) {
  console.error('No Python 3 interpreter found. Tried: python3, python, py -3.');
  process.exit(1);
}

console.log(`Running scripts/crosscheck.py with ${[chosen.command, ...chosen.args].join(' ')}`);
const result = spawnSync(chosen.command, [...chosen.args, script], { stdio: 'inherit' });
if (result.error) {
  console.error(`Failed to run ${chosen.command}: ${result.error.message}`);
  process.exit(1);
}
process.exit(result.status ?? 1);
