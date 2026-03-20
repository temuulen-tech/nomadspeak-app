import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const constants = await import('../constants.js');

async function readJson(path) {
  return JSON.parse(await readFile(new URL(`../${path}`, import.meta.url), 'utf8'));
}

test('content handoff template file paths stay registered in constants', () => {
  assert.equal(constants.CONTENT_TEMPLATE_FILES.lessonPack, 'content-packs/templates/lesson-pack.template.json');
  assert.equal(constants.CONTENT_TEMPLATE_FILES.wordBank, 'content-packs/templates/word-bank.template.json');
  assert.equal(constants.CONTENT_TEMPLATE_FILES.sentenceBank, 'content-packs/templates/sentence-bank.template.json');
  assert.equal(constants.CONTENT_TEMPLATE_FILES.qaSet, 'content-packs/templates/qa-set.template.json');
  assert.equal(constants.CONTENT_TEMPLATE_FILES.contentPackManifest, 'content-packs/templates/content-pack-manifest.template.json');
});

test('lesson, word-bank, sentence-bank, and QA templates provide the expected replacement structure', async () => {
  const lessonPack = await readJson(constants.CONTENT_TEMPLATE_FILES.lessonPack);
  const wordBank = await readJson(constants.CONTENT_TEMPLATE_FILES.wordBank);
  const sentenceBank = await readJson(constants.CONTENT_TEMPLATE_FILES.sentenceBank);
  const qaSet = await readJson(constants.CONTENT_TEMPLATE_FILES.qaSet);
  const manifest = await readJson(constants.CONTENT_TEMPLATE_FILES.contentPackManifest);

  assert.ok(Array.isArray(lessonPack.entries));
  assert.deepEqual(Object.keys(lessonPack.entries[0]), ['q', 'qMn', 'a', 'aMn']);

  assert.ok(Array.isArray(wordBank.tokens));
  assert.equal(typeof wordBank.id, 'string');

  assert.equal(sentenceBank.bank.datasetKey, sentenceBank.bank.id);
  assert.equal(sentenceBank.rows[0].bankId, sentenceBank.bank.id);

  assert.ok(Array.isArray(qaSet.rounds));
  assert.deepEqual(Object.keys(qaSet.rounds[0]), ['id', 'mnQuestion', 'mnAnswer', 'enQuestion', 'enAnswer', 'wordBankTokens']);

  assert.deepEqual(Object.keys(manifest.contentRefs), ['lessonPackId', 'wordBankId', 'qaSetId', 'sentenceBankId']);
  assert.ok(manifest.sourceFilesToUpdate.includes('data/sentences.json'));
});
