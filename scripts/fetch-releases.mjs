// Fetches the latest releases once at build time and saves them as public/releases.json.
// The site then reads that static file, so visitors never hit the Spotify API directly
// (which is rate limited). If the fetch fails, the existing file is kept and the build continues.
import { readFileSync, writeFileSync } from 'node:fs';

const info = readFileSync(new URL('../utils/supabase/info.tsx', import.meta.url), 'utf8');
const projectId = info.match(/projectId = "([^"]+)"/)[1];
const anonKey = info.match(/publicAnonKey = "([^"]+)"/)[1];
const ARTIST_ID = '6ZDSgSuMbJKVg91ZZL3tx6';
const base = `https://${projectId}.supabase.co/functions/v1/make-server-ae52fa22/artist/${ARTIST_ID}`;
const out = new URL('../public/releases.json', import.meta.url);

const headers = { Authorization: `Bearer ${anonKey}` };

// 1) /all returns up to 50 albums + singles (all releases). 2) /albums is a fallback with only the 10 newest.
async function fetchAll() {
  const res = await fetch(`${base}/all`, { headers, signal: AbortSignal.timeout(120_000) });
  const data = await res.json();
  const items = [...(data.albums?.items ?? []), ...(data.singles?.items ?? [])];
  if (!res.ok || items.length === 0) throw new Error(`/all HTTP ${res.status}: ${JSON.stringify(data).slice(0, 200)}`);
  return items;
}
async function fetchLatest() {
  const res = await fetch(`${base}/albums`, { headers, signal: AbortSignal.timeout(60_000) });
  const data = await res.json();
  if (!res.ok || !Array.isArray(data.items) || data.items.length === 0) {
    throw new Error(`/albums HTTP ${res.status}: ${JSON.stringify(data).slice(0, 200)}`);
  }
  return data.items;
}

let existing = 0;
try { existing = JSON.parse(readFileSync(out, 'utf8')).items?.length ?? 0; } catch {}

try {
  let items;
  try {
    items = await fetchAll();
  } catch (err) {
    console.warn(`Full list failed (${err.message}), trying the 10 newest.`);
    items = await fetchLatest();
    // Never replace a fuller list with a shorter one
    if (items.length < existing) throw new Error(`only got ${items.length}, existing file has ${existing}`);
  }
  // de-duplicate by id
  items = [...new Map(items.map((a) => [a.id, a])).values()];
  writeFileSync(out, JSON.stringify({ fetched_at: new Date().toISOString(), items }) + '\n');
  console.log(`releases.json updated with ${items.length} releases`);
} catch (err) {
  console.warn(`Could not refresh releases (${err.message}). Keeping the existing releases.json.`);
}
