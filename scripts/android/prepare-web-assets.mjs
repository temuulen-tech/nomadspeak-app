import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const outputDir = path.join(repoRoot, 'android', 'app', 'src', 'main', 'assets', 'public');

const EXCLUDED_ROOT_NAMES = new Set([
  '.git',
  'android',
  'node_modules',
  'docs',
  'tests',
  'content-packs'
]);

const EXCLUDED_SUFFIXES = ['.md', '.ts'];
const REQUIRED_FILES = ['index.html', 'manifest.json', 'service-worker.js', 'privacy-policy.html'];

function shouldCopyRootEntry(name) {
  if (EXCLUDED_ROOT_NAMES.has(name)) {
    return false;
  }
  if (name.startsWith('.')) {
    return false;
  }
  return true;
}

function shouldCopyPath(filePath) {
  return !EXCLUDED_SUFFIXES.some((suffix) => filePath.endsWith(suffix));
}

async function copyRootEntry(name) {
  const source = path.join(repoRoot, name);
  const destination = path.join(outputDir, name);
  await cp(source, destination, {
    recursive: true,
    filter: (src) => shouldCopyPath(src)
  });
}

async function ensureRequiredFiles() {
  for (const fileName of REQUIRED_FILES) {
    const source = path.join(repoRoot, fileName);
    const destination = path.join(outputDir, fileName);
    await cp(source, destination);
  }
}

async function main() {
  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });

  const rootEntries = await readdir(repoRoot, { withFileTypes: true });
  for (const entry of rootEntries) {
    if (!shouldCopyRootEntry(entry.name)) {
      continue;
    }
    await copyRootEntry(entry.name);
  }

  await ensureRequiredFiles();
  console.log(`Prepared Android web assets in ${path.relative(repoRoot, outputDir)}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
