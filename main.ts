// A working gta6-meme-x-01 entry (Node 22, standard library only).
//
// The entry is the post itself: the meme was made in this session, posted on
// X from the public account @KenzieRefa, and POST.json at this repository's
// root names the post's address. All this program has to do is hand that
// address to the grader: it reads POST.json, checks it names a real X status
// URL, and copies it to the output directory, where the gate reads it.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const POST_PATH = join(BOT_DIR, 'POST.json');
const STATUS_RE = /^https:\/\/x\.com\/[A-Za-z0-9_]+\/status\/\d+$/;

let post: unknown;
try {
  post = JSON.parse(readFileSync(POST_PATH, 'utf8'));
} catch (err) {
  console.error(`POST.json could not be read from ${BOT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}

if (
  typeof post !== 'object' ||
  post === null ||
  typeof (post as { url?: unknown }).url !== 'string' ||
  !STATUS_RE.test((post as { url: string }).url)
) {
  console.error('POST.json must name an X post address, e.g. {"url": "https://x.com/<handle>/status/<id>"}');
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
copyFileSync(POST_PATH, join(OUTPUT_DIR, 'POST.json'));
