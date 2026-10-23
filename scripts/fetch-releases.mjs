// Fetches all INNAFØR releases straight from the Spotify Web API at build time and saves
// them as public/releases.json. The site only reads that static file, so visitors never
// call Spotify themselves.
//
// Needs the Spotify app credentials as environment variables (GitHub Actions secrets):
//   SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET
// If they are missing or Spotify fails, the existing releases.json is kept and the build continues.
import { readFileSync, writeFileSync } from 'node:fs';

const ARTIST_ID = '6ZDSgSuMbJKVg91ZZL3tx6';
const MARKET = 'NO';
const PAGE_SIZE = 10; // max for development-mode apps
const out = new URL('../public/releases.json', import.meta.url);

const { SPOTIFY_CLIENT_ID: clientId, SPOTIFY_CLIENT_SECRET: clientSecret } = process.env;

let existing = [];
try {
  existing = JSON.parse(readFileSync(out, 'utf8')).items ?? [];
} catch {}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getToken() {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    signal: AbortSignal.timeout(30_000),
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) throw new Error(`token HTTP ${res.status}: ${JSON.stringify(data).slice(0, 200)}`);
  return data.access_token;
}

async function getJson(url, token) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(30_000) });
    if (res.status === 429) {
      const wait = Math.min(Number(res.headers.get('retry-after') || 5), 60);
      console.warn(`Rate limited, waiting ${wait}s`);
      await sleep(wait * 1000);
      continue;
    }
    const data = await res.json();
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}: ${JSON.stringify(data).slice(0, 200)}`);
    return data;
  }
  throw new Error(`Still rate limited: ${url}`);
}

async function fetchAllReleases() {
  const token = await getToken();
  const items = [];
  let url = `https://api.spotify.com/v1/artists/${ARTIST_ID}/albums?include_groups=album,single&market=${MARKET}&limit=${PAGE_SIZE}&offset=0`;
  let total = 0;
  while (url) {
    const page = await getJson(url, token);
    items.push(...page.items);
    total = page.total;
    url = page.next;
    if (url) await sleep(300); // be gentle with the rate limit
  }
  return { items, complete: items.length >= total };
}

if (!clientId || !clientSecret) {
  console.warn('SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET not set. Keeping the existing releases.json.');
  process.exit(0);
}

try {
  const { items: fresh, complete } = await fetchAllReleases();
  if (fresh.length === 0) throw new Error('Spotify returned no releases');
  // A complete list replaces the old one. If something went wrong mid-way, merge instead so nothing is lost.
  const byId = new Map(complete ? [] : existing.map((a) => [a.id, a]));
  for (const a of fresh) byId.set(a.id, a);
  const items = [...byId.values()].sort((a, b) => (b.release_date || '').localeCompare(a.release_date || ''));
  const before = new Set(existing.map((a) => a.id));
  const added = items.filter((a) => !before.has(a.id)).map((a) => a.name);
  writeFileSync(out, JSON.stringify({ fetched_at: new Date().toISOString(), source: 'spotify', items }) + '\n');
  console.log(`releases.json: ${items.length} releases${added.length ? ` (new: ${added.join(', ')})` : ''}`);
} catch (err) {
  console.warn(`Could not refresh releases (${err.message}). Keeping the existing releases.json.`);
}
