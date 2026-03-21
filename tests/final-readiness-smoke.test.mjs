import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

const repoRoot = path.resolve(import.meta.dirname, '..');

async function waitForServer(url, attempts = 30) {
  let lastError = null;
  for (let index = 0; index < attempts; index += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
      lastError = new Error(`Unexpected status: ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw lastError;
}

test('final readiness smoke: static app shell boots from local server and exposes all primary routes', async (t) => {
  const server = spawn('python3', ['-m', 'http.server', '4317'], {
    cwd: repoRoot,
    stdio: 'ignore',
  });

  t.after(() => {
    server.kill('SIGTERM');
  });

  const indexResponse = await waitForServer('http://127.0.0.1:4317/');
  const html = await indexResponse.text();
  const renderShell = await fs.readFile(path.join(repoRoot, 'render-shell.js'), 'utf8');

  assert.match(html, /<script type="module" src="\.?\/?app\.js"><\/script>/);

  [
    'start-screen',
    'quiz-screen',
    'board-game-screen',
    'qa-game-screen',
    'sentence-game-screen',
    'nav-lesson-btn',
    'nav-sentences-btn',
    'nav-sentence-game-btn',
    'nav-qa-game-btn',
    'nav-board-game-btn',
    'nav-stats-btn',
  ].forEach((requiredId) => {
    assert.match(html, new RegExp(`id="${requiredId}"`), `Missing required route id: ${requiredId}`);
  });

  ['stats-screen', 'profile-screen', 'end-screen'].forEach((mountedId) => {
    assert.match(renderShell, new RegExp(`id="${mountedId}"`), `render-shell should mount ${mountedId}`);
  });

  for (const assetPath of ['/app.js', '/script.js', '/script-support.js', '/app-bootstrap.js', '/render-shell.js']) {
    const response = await fetch(`http://127.0.0.1:4317${assetPath}`);
    assert.equal(response.status, 200, `${assetPath} should be served`);
  }
});

test('final readiness smoke: bootstrap and orchestration boundaries remain intact after cleanup', async () => {
  const [appJs, scriptJs, scriptSupportJs] = await Promise.all([
    fs.readFile(path.join(repoRoot, 'app.js'), 'utf8'),
    fs.readFile(path.join(repoRoot, 'script.js'), 'utf8'),
    fs.readFile(path.join(repoRoot, 'script-support.js'), 'utf8'),
  ]);

  assert.match(appJs, /mountAppShell\(\);/);
  assert.match(appJs, /await import\("\.\/script\.js"\)/);
  assert.match(appJs, /document\.documentElement\.dataset\.appBoot = "ready"/);

  assert.match(scriptJs, /createAppBootstrap/);
  assert.match(scriptJs, /createLessonFlow/);
  assert.match(scriptJs, /createQaFlow/);
  assert.match(scriptJs, /createBoardRuntime/);
  assert.match(scriptJs, /createSentenceGameClimbController/);
  assert.match(scriptJs, /createSentenceGameTipController/);
  assert.match(scriptJs, /export \{ initializeApp \};/);

  assert.doesNotMatch(scriptJs, /const\s+LESSON_PACKS\s*=/);
  assert.doesNotMatch(scriptJs, /const\s+QA_ROUNDS\s*=/);
  assert.doesNotMatch(scriptJs, /const\s+SENTENCE_BANKS\s*=/);

  assert.match(scriptSupportJs, /export function createSpeechStateController/);
  assert.match(scriptSupportJs, /export function createSentenceGameTipController/);
  assert.match(scriptSupportJs, /export function createSentenceGameClimbController/);
});
