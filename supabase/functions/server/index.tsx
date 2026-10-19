import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-ae52fa22/health", (c) => {
  return c.json({ status: "ok" });
});

// Spotify API endpoints
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getSpotifyAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const clientId = Deno.env.get('SPOTIFY_CLIENT_ID');
  const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    console.log('Missing Spotify credentials - CLIENT_ID exists:', !!clientId, 'CLIENT_SECRET exists:', !!clientSecret);
    throw new Error('Spotify credentials not configured. Please add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in Make settings.');
  }

  console.log('Requesting Spotify token with Client ID:', clientId.substring(0, 8) + '...');

  const credentials = btoa(`${clientId}:${clientSecret}`);

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const error = await response.text();
    console.log(`Spotify token error (${response.status}):`, error);
    throw new Error(`Failed to get Spotify access token: ${response.status} - ${error}`);
  }

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;

  console.log('Successfully obtained Spotify access token');
  return accessToken;
}

// Retry-logikk for rate limiting (429 Too Many Requests)
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 1): Promise<Response> {
  let lastResponse: Response | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      lastResponse = response;

      // Hvis 429 og vi har flere forsøk igjen, vent og prøv igjen
      if (response.status === 429 && attempt < maxRetries) {
        const retryAfter = response.headers.get('Retry-After');
        const waitSeconds = retryAfter ? parseInt(retryAfter, 10) : 2;

        console.log(`Rate limited (429) on ${url} - waiting ${waitSeconds}s before retry ${attempt + 1}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, waitSeconds * 1000));
        continue;
      }

      // Returner response uansett (caller må håndtere status)
      return response;
    } catch (error) {
      console.log(`Fetch error on ${url} (attempt ${attempt + 1}/${maxRetries + 1}):`, error);

      if (attempt >= maxRetries) {
        throw error;
      }

      // Vent litt før retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return lastResponse || new Response('Max retries exceeded', { status: 500 });
}

app.get('/make-server-ae52fa22/artist/:id', async (c) => {
  try {
    const artistId = c.req.param('id');
    const cacheKey = `spotify_artist_${artistId}`;

    // Sjekk cache først (gyldig i 10 minutter)
    const cached = await kv.get(cacheKey);
    if (cached) {
      const { data, timestamp } = cached;
      const age = Date.now() - timestamp;
      if (age < 10 * 60 * 1000) { // 10 minutter
        console.log(`Returning cached artist for ${artistId} (age: ${Math.round(age / 1000)}s)`);
        return c.json(data);
      }
    }

    console.log(`Fetching fresh artist data for ${artistId}`);
    const token = await getSpotifyAccessToken();

    const response = await fetch(`${SPOTIFY_API_BASE}/artists/${artistId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      const error = await response.text();
      console.log(`Error fetching artist ${artistId}: ${error}`);
      return c.json({ error: 'Failed to fetch artist data' }, response.status);
    }

    const data = await response.json();

    // Cache resultatet
    await kv.set(cacheKey, { data, timestamp: Date.now() });

    return c.json(data);
  } catch (error) {
    console.log(`Error in /artist endpoint: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

app.get('/make-server-ae52fa22/artist/:id/top-tracks', async (c) => {
  try {
    const artistId = c.req.param('id');
    const token = await getSpotifyAccessToken();

    const response = await fetchWithRetry(
      `${SPOTIFY_API_BASE}/artists/${artistId}/top-tracks?market=NO`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    if (!response.ok) {
      const error = await response.text();
      console.log(`Error fetching top tracks for ${artistId} (status ${response.status}): ${error}`);
      return c.json({ error: 'Failed to fetch top tracks', details: error }, response.status);
    }

    const data = await response.json();
    return c.json(data);
  } catch (error) {
    console.log(`Error in /top-tracks endpoint: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

app.get('/make-server-ae52fa22/artist/:id/albums', async (c) => {
  try {
    const artistId = c.req.param('id');
    const cacheKey = `spotify_albums_${artistId}`;

    // Sjekk cache først (gyldig i 5 minutter)
    const cached = await kv.get(cacheKey);
    if (cached) {
      const { data, timestamp } = cached;
      const age = Date.now() - timestamp;
      if (age < 5 * 60 * 1000) { // 5 minutter
        console.log(`Returning cached albums for ${artistId} (age: ${Math.round(age / 1000)}s)`);
        return c.json(data);
      }
    }

    console.log(`Fetching fresh albums for artist ${artistId}`);
    const token = await getSpotifyAccessToken();

    const response = await fetch(
      `${SPOTIFY_API_BASE}/artists/${artistId}/albums?include_groups=album,single&market=NO&limit=10`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    if (!response.ok) {
      const error = await response.text();
      console.log(`Error fetching albums for ${artistId} (status ${response.status}): ${error}`);

      // Hvis rate-limitert og vi har gammel cache, returner den i stedet
      if (response.status === 429 && cached) {
        console.log(`Rate limited, returning stale cache (age: ${Math.round((Date.now() - cached.timestamp) / 1000)}s)`);
        return c.json(cached.data);
      }

      return c.json({ error: 'Failed to fetch albums', details: error }, response.status);
    }

    const data = await response.json();
    console.log(`Successfully fetched ${data.items?.length || 0} albums/singles`);

    // Cache resultatet
    await kv.set(cacheKey, { data, timestamp: Date.now() });

    return c.json(data);
  } catch (error) {
    console.log(`Error in /albums endpoint: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

app.get('/make-server-ae52fa22/artist/:id/singles', async (c) => {
  try {
    const artistId = c.req.param('id');
    const token = await getSpotifyAccessToken();

    // Hent kun første side - ikke paginer for å unngå rate limiting
    const response = await fetchWithRetry(
      `${SPOTIFY_API_BASE}/artists/${artistId}/albums?include_groups=single&limit=50&market=NO`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    if (!response.ok) {
      const error = await response.text();
      console.log(`Error fetching singles for ${artistId} (status ${response.status}): ${error}`);
      return c.json({ error: 'Failed to fetch singles', details: error }, response.status);
    }

    const data = await response.json();
    return c.json(data);
  } catch (error) {
    console.log(`Error in /singles endpoint: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Samlet endpoint for å minimere API-kall
app.get('/make-server-ae52fa22/artist/:id/all', async (c) => {
  try {
    const artistId = c.req.param('id');
    const token = await getSpotifyAccessToken();

    const result: any = {};

    // Gjør kall SEKVENSIELT med delays for å unngå rate limiting
    // 1. Artist info
    const artistRes = await fetchWithRetry(`${SPOTIFY_API_BASE}/artists/${artistId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (artistRes.ok) {
      result.artist = await artistRes.json();
      console.log('✓ Artist fetched');
    } else {
      console.log(`✗ Artist failed: ${artistRes.status}`);
    }

    // Vent 500ms for å unngå rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));

    // 2. Albums og singles
    const albumsRes = await fetchWithRetry(
      `${SPOTIFY_API_BASE}/artists/${artistId}/albums?include_groups=album,single&limit=50&market=NO`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    if (albumsRes.ok) {
      const allReleases = await albumsRes.json();
      console.log(`✓ Albums/singles fetched: ${allReleases.items?.length || 0} items`);

      // Separer albums og singles
      result.albums = {
        items: allReleases.items?.filter((item: any) => item.album_type === 'album') || []
      };

      result.singles = {
        items: allReleases.items?.filter((item: any) => item.album_type === 'single') || []
      };

      console.log(`  - ${result.albums.items.length} albums, ${result.singles.items.length} singles`);

      // Finn latest release
      if (allReleases.items && allReleases.items.length > 0) {
        const sortedReleases = [...allReleases.items].sort((a: any, b: any) => {
          const dateA = new Date(a.release_date || '1970-01-01');
          const dateB = new Date(b.release_date || '1970-01-01');
          return dateB.getTime() - dateA.getTime();
        });

        // Vent 500ms for å unngå rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

        // 3. Hent full info for latest release
        const latestId = sortedReleases[0].id;
        const latestRes = await fetchWithRetry(
          `${SPOTIFY_API_BASE}/albums/${latestId}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );

        if (latestRes.ok) {
          result.latestRelease = await latestRes.json();
          console.log(`✓ Latest release fetched: ${result.latestRelease.name}`);
        } else {
          console.log(`✗ Latest release failed: ${latestRes.status}`);
        }
      }
    } else {
      console.log(`✗ Albums/singles failed: ${albumsRes.status}`);
      const errorText = await albumsRes.text();
      console.log(`  Error details: ${errorText}`);
    }

    return c.json(result);
  } catch (error) {
    console.log(`Error in /all endpoint: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

app.get('/make-server-ae52fa22/artist/:id/latest-release', async (c) => {
  try {
    const artistId = c.req.param('id');
    const token = await getSpotifyAccessToken();

    console.log(`Fetching latest release for artist ${artistId}`);

    // Hent kun de 10 siste utgivelsene for å minimere data
    const response = await fetch(
      `${SPOTIFY_API_BASE}/artists/${artistId}/albums?include_groups=album,single&limit=10&market=NO`,
      {
        headers: { 'Authorization': `Bearer ${token}` },
        signal: AbortSignal.timeout(5000) // 5 sekunder timeout
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.log(`Error fetching albums for ${artistId} (status ${response.status}): ${error}`);
      return c.json({ error: 'Failed to fetch latest release', details: error }, response.status);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      console.log(`No releases found for artist ${artistId}`);
      return c.json({ error: 'No releases found' }, 404);
    }

    // Sorter etter release_date (nyeste først)
    const sortedReleases = [...data.items].sort((a: any, b: any) => {
      const dateA = new Date(a.release_date || '1970-01-01');
      const dateB = new Date(b.release_date || '1970-01-01');
      return dateB.getTime() - dateA.getTime();
    });

    const latest = sortedReleases[0];
    console.log(`Latest release found: ${latest.name} (${latest.release_date})`);

    // Returner den grunnleggende infoen fra albums-endepunktet
    // Dette har nok informasjon for å vise kortet
    return c.json({
      id: latest.id,
      name: latest.name,
      images: latest.images,
      release_date: latest.release_date,
      total_tracks: latest.total_tracks,
      album_type: latest.album_type,
      artists: latest.artists,
      external_urls: latest.external_urls,
      // Legg til en enkel tracklist hvis det bare er en singel
      tracks: latest.total_tracks <= 3 ? {
        items: [] // Tom for nå, kan fylles senere hvis nødvendig
      } : undefined
    });
  } catch (error) {
    console.log(`Error in /latest-release endpoint: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);