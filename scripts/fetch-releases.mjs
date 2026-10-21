// Fetches the latest releases once at build time and saves them as public/releases.json.
// The site then reads that static file, so visitors never hit the Spotify API directly
// (which is rate limited). If the fetch fails, the existing file is kept and the build continues.
import { readFileSync, writeFileSync } from 'node:fs';

const info = readFileSync(new URL('../utils/supabase/info.tsx', import.meta.url), 'utf8');
const projectId = info.match(/projectId = "([^"]+)"/)[1];
const anonKey = info.match(/publicAnonKey = "([^"]+)"/)[1];
const ARTIST_ID = '6ZDSgSuMbJKVg91ZZL3tx6';
const url = `https://${projectId}.supabase.co/functions/v1/make-server-ae52fa22/artist/${ARTIST_ID}/albums`;
const out = new URL('../public/releases.json', import.meta.url);

try {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${anonKey}` } });
  const data = await res.json();
  if (!res.ok || !Array.isArray(data.items) || data.items.length === 0) {
    throw new Error(`HTTP ${res.status}: ${JSON.stringify(data).slice(0, 200)}`);
  }
  writeFileSync(out, JSON.stringify({ fetched_at: new Date().toISOString(), items: data.items }) + '\n');
  console.log(`releases.json updated with ${data.items.length} releases`);
} catch (err) {
  console.warn(`Could not refresh releases (${err.message}). Keeping the existing releases.json.`);
}
