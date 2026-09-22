import { Song } from '../../types/music';
import {
  YouTubeSearchResponse,
  YouTubeAudioResponse,
  YouTubeVideoResponse
} from './youtubeTypes';
import {
  normalizeYouTubeSong,
  buildYouTubeSongWithAudio
} from './youtubeNormalizer';

export const YOUTUBE_API_BASE = 'https://yt-api-xi-ten.vercel.app';
const TIMEOUT_MS = 7000;

// In-memory cache for audio streams with short 5-minute TTL to handle expiring URLs safely
interface StreamCacheItem {
  streamUrl: string;
  expiry: number;
}
const streamCache = new Map<string, StreamCacheItem>();
const STREAM_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// In-memory search cache with 5-minute TTL
const searchCache = new Map<string, { songs: Song[]; expiry: number }>();
const SEARCH_CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Invalidate temporary stream URL from memory cache (called when playback fails or refresh needed)
 */
export function invalidateYouTubeStream(videoId: string): void {
  const cleanId = videoId.replace(/^(yt_|youtube_)/, '').trim();
  streamCache.delete(cleanId);
}

/**
 * Health check ping to YouTube API
 * GET /api/health
 */
export async function pingYouTube(): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(`${YOUTUBE_API_BASE}/api/health`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' }
    });
    clearTimeout(timeoutId);
    if (!res.ok) return false;
    const json = await res.json();
    return Boolean(json?.status === true || json?.status === 'ok');
  } catch {
    clearTimeout(timeoutId);
    return false;
  }
}

/**
 * Searches YouTube for songs matching query
 * GET /api/search?q={query}&limit={limit}
 */
export async function searchYouTubeSongs(query: string, limit: number = 10): Promise<Song[]> {
  if (!query || !query.trim()) return [];

  const cleanQuery = query.trim();
  const cacheKey = `${cleanQuery.toLowerCase()}_${limit}`;

  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() < cached.expiry) {
    return cached.songs;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const url = `${YOUTUBE_API_BASE}/api/search?q=${encodeURIComponent(cleanQuery)}&limit=${limit}`;
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[YouTube API] Search HTTP ${response.status} for "${cleanQuery}"`);
      return [];
    }

    const data: YouTubeSearchResponse = await response.json();
    if (!data || !Array.isArray(data.results)) {
      return [];
    }

    const validItems = data.results.filter(item => Boolean(item && item.id && typeof item.id === 'string'));
    const songs: Song[] = validItems.map(normalizeYouTubeSong);

    searchCache.set(cacheKey, { songs, expiry: Date.now() + SEARCH_CACHE_TTL_MS });
    return songs;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name !== 'AbortError') {
      console.warn(`[YouTube API] Search network error for "${cleanQuery}":`, err?.message || err);
    }
    return [];
  }
}

/**
 * Retrieves a direct playable media stream URL for a given YouTube video ID.
 * GET /api/audio?id={videoId}
 *
 * @param videoId The YouTube video ID (or prefixed id)
 * @param forceFresh If true, bypasses the in-memory cache to fetch a newly issued stream URL
 */
export async function getYouTubeAudioStream(videoId: string, forceFresh: boolean = false): Promise<string | null> {
  const cleanId = videoId.replace(/^(yt_|youtube_)/, '').trim();
  if (!cleanId) return null;

  if (!forceFresh) {
    const cached = streamCache.get(cleanId);
    if (cached && Date.now() < cached.expiry && cached.streamUrl) {
      return cached.streamUrl;
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const url = `${YOUTUBE_API_BASE}/api/audio?id=${encodeURIComponent(cleanId)}`;
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[YouTube API] /api/audio HTTP ${response.status} for ${cleanId}`);
      return null;
    }

    const data: YouTubeAudioResponse = await response.json();

    // Validate that a genuine stream URL was returned (checking both url and stream_url)
    const rawCandidate = data?.url || data?.stream_url;
    if (
      rawCandidate &&
      typeof rawCandidate === 'string' &&
      rawCandidate.startsWith('http') &&
      !rawCandidate.includes('youtube.com/watch') &&
      !rawCandidate.includes('youtu.be/')
    ) {
      streamCache.set(cleanId, {
        streamUrl: rawCandidate,
        expiry: Date.now() + STREAM_CACHE_TTL_MS
      });
      return rawCandidate;
    }

    if (data?.detail || data?.error) {
      console.warn(`[YouTube API] Audio extraction error for ${cleanId}:`, data.detail || data.error);
    }

    return null;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name !== 'AbortError') {
      console.warn(`[YouTube API] Stream network error for ${cleanId}:`, err?.message || err);
    }
    return null;
  }
}

/**
 * Retrieves a complete Song model for a YouTube track with resolved audio stream.
 * GET /api/audio?id={videoId}
 */
export async function getYouTubeSongById(id: string): Promise<Song | null> {
  const cleanId = id.replace(/^(yt_|youtube_)/, '').trim();
  if (!cleanId) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const url = `${YOUTUBE_API_BASE}/api/audio?id=${encodeURIComponent(cleanId)}`;
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    const audioData: YouTubeAudioResponse = await response.json();
    return buildYouTubeSongWithAudio(cleanId, audioData);
  } catch (err: any) {
    clearTimeout(timeoutId);
    return null;
  }
}
