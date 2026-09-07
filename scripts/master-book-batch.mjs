#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const STATE_DIR = path.join(ROOT, '.master-book-batch');
const STATE_FILE = path.join(STATE_DIR, 'state.json');
const REPORT_FILE = path.join(STATE_DIR, 'report.json');
const COMPLETE = new Set(['atomic-habits', 'deep-work']);

function run(cmd, args, opts = {}) {
  const result = spawnSync(cmd, args, { cwd: ROOT, stdio: 'inherit', shell: process.platform === 'win32', ...opts });
  if (result.status !== 0) throw new Error(`${cmd} ${args.join(' ')} failed with exit ${result.status}`);
}

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
}

function discoverBooks() {
  const candidates = [
    'src/data/books.ts', 'src/data/books.tsx', 'src/lib/books.ts', 'src/content/books.json', 'data/books.json'
  ].map(p => path.join(ROOT, p)).filter(fs.existsSync);
  const slugs = new Set();
  for (const file of candidates) {
    const text = fs.readFileSync(file, 'utf8');
    for (const m of text.matchAll(/slug\s*:\s*["'`]([^"'`]+)["'`]/g)) slugs.add(m[1]);
    try {
      const json = JSON.parse(text);
      for (const item of Array.isArray(json) ? json : json.books ?? []) if (item?.slug) slugs.add(item.slug);
    } catch {}
  }
  if (!slugs.size) {
    const appDir = path.join(ROOT, 'src/app/books');
    if (fs.existsSync(appDir)) for (const name of fs.readdirSync(appDir)) if (!name.startsWith('[') && fs.statSync(path.join(appDir, name)).isDirectory()) slugs.add(name);
  }
  return [...slugs].sort();
}

function workflowExists(name) { return fs.existsSync(path.join(ROOT, '.github/workflows', name)); }

const state = readJson(STATE_FILE, { version: 1, books: {}, startedAt: new Date().toISOString() });
const books = discoverBooks();
if (!books.length) throw new Error('No catalog books discovered; refusing to run an empty batch.');

console.log(`Discovered ${books.length} catalog books: ${books.join(', ')}`);
for (const slug of books) {
  const book = state.books[slug] ??= { slug, stages: {}, attempts: 0 };
  if (COMPLETE.has(slug)) {
    book.status = 'canonical-complete';
    book.stages.skip = { ok: true, reason: 'canonical reference; no regeneration' };
    writeJson(STATE_FILE, state);
    continue;
  }
  if (book.status === 'complete') continue;
  book.attempts += 1;
  book.status = 'in-progress';
  writeJson(STATE_FILE, state);
  try {
    // Repository-native quality gates are intentionally run before expensive media work.
    if (!book.stages.quality?.ok) {
      run('npm', ['run', 'lint']);
      run('npm', ['run', 'typecheck']);
      book.stages.quality = { ok: true, at: new Date().toISOString() };
      writeJson(STATE_FILE, state);
    }
    // Audio generation is delegated to the existing production workflow so its checkpoint,
    // ASR, release and immutable-asset contracts remain the source of truth.
    if (!book.stages.audio?.ok) {
      if (!workflowExists('dual-voice-production.yml')) throw new Error('dual-voice-production.yml is missing');
      console.log(`MEDIA_REQUIRED ${slug}: dispatch existing dual-voice-production workflow with tracking issue 268.`);
      book.stages.audio = { ok: false, pendingExternalWorkflow: true };
      book.status = 'media-pending';
      writeJson(STATE_FILE, state);
      continue;
    }
    book.status = 'complete';
    book.completedAt = new Date().toISOString();
    writeJson(STATE_FILE, state);
  } catch (error) {
    book.status = 'failed';
    book.error = String(error?.message ?? error);
    writeJson(STATE_FILE, state);
  }
}

state.finishedAt = new Date().toISOString();
writeJson(STATE_FILE, state);
writeJson(REPORT_FILE, { generatedAt: new Date().toISOString(), books: Object.values(state.books) });
console.log(`Master batch checkpoint: ${path.relative(ROOT, STATE_FILE)}`);
console.log(`Completion report: ${path.relative(ROOT, REPORT_FILE)}`);
