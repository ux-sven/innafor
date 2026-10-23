// Fetches the latest releases at build time and merges them into public/releases.json.
// The site reads that static file, so visitors never hit the rate-limited Spotify API.
//
// The Make/Supabase backend only returns the 10 newest releases, so new releases are
// MERGED into the existing list: nothing already on the site is ever dropped.
// If the fetch fails, the existing file is kept and the build continues.
import { readFileSync, writeFileSync } from 'node:fs';

const info = readFileSync(new URL('../utils/supabase/info.tsx', import.meta.url), 'utf8');
const projectId = info.match(/projectId = "([^"]+)"/)[1];
const anonKey = info.match(/publicAnonKey = "([^"]+)"/)[1];
const ARTIST_ID = '6ZDSgSuMbJKVg91ZZL3tx6';
const url = `https://${projectId}.supabase.co/functions/v1/make-server-ae52fa22/artist/${ARTIST_ID}/albums`;
const out = new URL('../public/releases.json', import.meta.url);

let existing = [];
try {
  existing = JSON.parse(readFileSync(out, 'utf8')).items ?? [];
} catch {}

try {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${anonKey}` },
    signal: AbortSignal.timeout(90_000),
  });
  const data = await res.json();
  if (!res.ok || !Array.isArray(data.items) || data.items.length === 0) {
    throw new Error(`HTTP ${res.status}: ${JSON.stringify(data).slice(0, 200)}`);
  }
  // Fresh data wins for releases we already have; older releases not in the response are kept.
  const byId = new Map(existing.map((a) => [a.id, a]));
  const added = data.items.filter((a) => !byId.has(a.id)).map((a) => a.name);
  for (const a of data.items) byId.set(a.id, a);
  const items = [...byId.values()].sort((a, b) => (b.release_date || '').localeCompare(a.release_date || ''));
  writeFileSync(out, JSON.stringify({ fetched_at: new Date().toISOString(), items }) + '\n');
  console.log(`releases.json: ${items.length} releases${added.length ? `, new: ${added.join(', ')}` : ', no new releases'}`);
} catch (err) {
  console.warn(`Could not refresh releases (${err.message}). Keeping the existing releases.json.`);
}
