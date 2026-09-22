import { Song, AudioQualityKey } from '../../types/music';
import { GaanaSearchResponse, GaanaTrackResponse, GaanaPingResponse } from './gaanaTypes';
import { normalizeGaanaSong } from './gaanaNormalizer';

const GAANA_BASE_URL = 'https://gaana-ruddy.vercel.app';
const TIMEOUT_MS = 6000;

// In-memory cache for Gaana requests with 5-minute TTL
const gaanaCache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

async function fetchGaana<T>(endpoint: string): Promise<T | null> {
  const url = `${GAANA_BASE_URL}${endpoint}`;

  const cached = gaanaCache.get(url);
  if (cached && Date.now() < cached.expiry) {
    return cached.data as T;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[Gaana API] HTTP ${response.status} for ${endpoint}`);
      return null;
    }

    const json = await response.json();
    if (!json || typeof json !== 'object') {
      return null;
    }

    gaanaCache.set(url, { data: json, expiry: Date.now() + CACHE_TTL_MS });
    return json as T;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name !== 'AbortError') {
      console.warn(`[Gaana API] Network issue for ${endpoint}:`, err?.message || err);
    }
    return null;
  }
}

/**
 * Health check ping to Gaana Music REST API
 * GET /api/ping
 */
export async function pingGaana(): Promise<boolean> {
  try {
    const res = await fetchGaana<GaanaPingResponse>('/api/ping');
    return res?.status === 'ok' || Boolean(res?.message);
  } catch {
    return false;
  }
}

/**
 * Search Gaana Music catalog
 * GET /api/search?q=<query>&limit=<number>
 */
export async function searchGaanaSongs(
  query: string,
  limit: number = 10,
  preferredQuality?: AudioQualityKey
): Promise<Song[]> {
  if (!query || !query.trim()) return [];

  const cleanQuery = encodeURIComponent(query.trim());
  const endpoint = `/api/search?q=${cleanQuery}&limit=${Math.min(limit, 25)}`;

  try {
    const res = await fetchGaana<GaanaSearchResponse>(endpoint);
    if (!res || !Array.isArray(res.data)) {
      return [];
    }

    const songs: Song[] = [];
    for (const raw of res.data) {
      const normalized = normalizeGaanaSong(raw, preferredQuality);
      if (normalized) {
        songs.push(normalized);
      }
    }

    return songs;
  } catch (err) {
    console.warn('[Gaana API] Search error:', err);
    return [];
  }
}

/**
 * Get single track details by SEO key
 * GET /api/track/<seokey>
 */
export async function getGaanaTrack(
  seokey: string,
  preferredQuality?: AudioQualityKey
): Promise<Song | null> {
  if (!seokey || !seokey.trim()) return null;

  const cleanSeokey = encodeURIComponent(seokey.trim().replace(/^gaana_/, ''));
  const endpoint = `/api/track/${cleanSeokey}`;

  try {
    const res = await fetchGaana<GaanaTrackResponse>(endpoint);
    if (!res || !res.data) {
      return null;
    }

    return normalizeGaanaSong(res.data, preferredQuality);
  } catch (err) {
    console.warn(`[Gaana API] Track error for ${seokey}:`, err);
    return null;
  }
}
