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

// A real X status address: https only, no credentials/port/query/fragment,
// host exactly x.com or twitter.com once the standard www./mobile. prefix is
// stripped (so x.com.evil.com, evilx.com and x.com@evil.com all fail), and a
// /<handle>/status/<digits> path whose status id is all digits.
function isStatusUrl(raw: string): boolean {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return false;
  }
  if (u.protocol !== 'https:') return false;
  if (u.username || u.password || u.port || u.search || u.hash) return false;
  const host = u.hostname.replace(/^(?:www\.|mobile\.)/, '');
  if (host !== 'x.com' && host !== 'twitter.com') return false;
  const seg = u.pathname.split('/');
  return (
    seg.length === 4 &&
    seg[0] === '' &&
    /^[A-Za-z0-9_]+$/.test(seg[1]) &&
    seg[2] === 'status' &&
    /^\d+$/.test(seg[3])
  );
}

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
  !isStatusUrl((post as { url: string }).url)
) {
  console.error('POST.json must name an X post address, e.g. {"url": "https://x.com/<handle>/status/<id>"}');
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
copyFileSync(POST_PATH, join(OUTPUT_DIR, 'POST.json'));
