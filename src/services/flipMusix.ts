import { Song, Album, Artist, Playlist } from '../types/music';
import {
  normalizeFlipSong,
  normalizeFlipAlbum,
  normalizeFlipArtist,
  normalizeFlipPlaylist
} from './flipNormalizers';

const BASE_URL = 'https://flip-musix.vercel.app';
const TIMEOUT_MS = 10000;

interface FlipCacheEntry<T> {
  data: T;
  timestamp: number;
}

const flipCache = new Map<string, FlipCacheEntry<any>>();
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes

async function flipFetch<T>(endpoint: string, cacheKey?: string): Promise<T | null> {
  const key = cacheKey || endpoint;
  const cached = flipCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data as T;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[FlipMusix API] HTTP error ${response.status} on ${endpoint}`);
      return null;
    }

    const json = await response.json();
    if (json) {
      flipCache.set(key, { data: json, timestamp: Date.now() });
    }
    return json as T;
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn(`[FlipMusix API] Fetch error on ${endpoint}:`, err?.message || err);
    return null;
  }
}

/**
 * Fetch Flip Musix YouTube-style Home feed
 */
export async function getFlipHomeFeed(): Promise<{
  trendingSongs: Song[];
  topCharts: Song[];
  trendingAlbums: Album[];
  genreSections: { title: string; genre: string; songs: Song[] }[];
  recentlyAdded: Song[];
  genres: string[];
}> {
  const json = await flipFetch<any>('/home');
  const sections = json?.data?.sections || [];

  let trendingSongs: Song[] = [];
  let topCharts: Song[] = [];
  let trendingAlbums: Album[] = [];
  const genreSections: { title: string; genre: string; songs: Song[] }[] = [];
  let recentlyAdded: Song[] = [];
  let genres: string[] = [];

  for (const s of sections) {
    const title = s.title || '';
    const type = s.type || '';
    const items = Array.isArray(s.items) ? s.items : [];

    if (title.toLowerCase().includes('trending now') || (type === 'songs' && trendingSongs.length === 0)) {
      trendingSongs = items.map(item => normalizeFlipSong(item));
    } else if (title.toLowerCase().includes('top charts') || title.toLowerCase().includes('daily top')) {
      topCharts = items.map(item => normalizeFlipSong(item));
    } else if (title.toLowerCase().includes('trending albums') || type === 'albums') {
      trendingAlbums = items.map(item => normalizeFlipAlbum(item));
    } else if (title.toLowerCase().includes('recently added')) {
      recentlyAdded = items.map(item => normalizeFlipSong(item));
    } else if (type === 'genres') {
      genres = items;
    } else if (title.toLowerCase().startsWith('top in') && type === 'songs') {
      const genreName = title.replace(/^top in\s+/i, '').trim();
      genreSections.push({
        title,
        genre: genreName,
        songs: items.map(item => normalizeFlipSong(item))
      });
    }
  }

  return {
    trendingSongs,
    topCharts,
    trendingAlbums,
    genreSections,
    recentlyAdded,
    genres
  };
}

/**
 * Search songs on Flip Musix
 */
export async function searchFlipSongs(query: string, page: number = 1): Promise<Song[]> {
  if (!query.trim()) return [];
  const json = await flipFetch<any>(`/search?q=${encodeURIComponent(query)}&page=${page}`);
  const results = json?.data?.results || [];
  if (!Array.isArray(results)) return [];
  return results.map(item => normalizeFlipSong(item));
}

/**
 * Search albums on Flip Musix
 */
export async function searchFlipAlbums(query: string, page: number = 1): Promise<Album[]> {
  if (!query.trim()) return [];
  const json = await flipFetch<any>(`/search?q=${encodeURIComponent(query)}&show=albums&page=${page}`);
  const results = json?.data?.results || [];
  if (!Array.isArray(results)) return [];
  return results.map(item => normalizeFlipAlbum(item));
}

/**
 * Search artists on Flip Musix
 */
export async function searchFlipArtists(query: string, page: number = 1): Promise<Artist[]> {
  if (!query.trim()) return [];
  const json = await flipFetch<any>(`/search?q=${encodeURIComponent(query)}&show=artists&page=${page}`);
  const results = json?.data?.results || [];
  if (!Array.isArray(results)) return [];
  return results.map(item => normalizeFlipArtist(item));
}

/**
 * Get trending songs on Flip Musix
 */
export async function getFlipTrendingSongs(page: number = 1): Promise<Song[]> {
  const json = await flipFetch<any>(`/trending/songs?page=${page}`);
  const results = json?.data?.results || [];
  if (!Array.isArray(results)) return [];
  return results.map(item => normalizeFlipSong(item));
}

/**
 * Get trending albums on Flip Musix
 */
export async function getFlipTrendingAlbums(page: number = 1): Promise<Album[]> {
  const json = await flipFetch<any>(`/trending/albums?page=${page}`);
  const results = json?.data?.results || [];
  if (!Array.isArray(results)) return [];
  return results.map(item => normalizeFlipAlbum(item));
}

/**
 * Get song charts on Flip Musix (daily, weekly, monthly, yearly)
 */
export async function getFlipChartSongs(period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'weekly', page: number = 1): Promise<Song[]> {
  const json = await flipFetch<any>(`/chart/songs/${period}/page/${page}`);
  const results = json?.data?.results || [];
  if (!Array.isArray(results)) return [];
  return results.map(item => normalizeFlipSong(item));
}

/**
 * Get album charts on Flip Musix
 */
export async function getFlipChartAlbums(period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'weekly', page: number = 1): Promise<Album[]> {
  const json = await flipFetch<any>(`/chart/albums/${period}/page/${page}`);
  const results = json?.data?.results || [];
  if (!Array.isArray(results)) return [];
  return results.map(item => normalizeFlipAlbum(item));
}

/**
 * Get recently added tracks on Flip Musix
 */
export async function getFlipRecentSongs(page: number = 1): Promise<Song[]> {
  const json = await flipFetch<any>(`/recent?page=${page}`);
  const results = json?.data?.results || [];
  if (!Array.isArray(results)) return [];
  return results.map(item => normalizeFlipSong(item));
}

/**
 * Get genres list on Flip Musix
 */
export async function getFlipGenres(): Promise<string[]> {
  const json = await flipFetch<any>('/genres');
  const results = json?.data || [];
  return Array.isArray(results) ? results : [];
}

/**
 * Get single song detail on Flip Musix
 */
export async function getFlipSongById(id: string): Promise<Song | null> {
  const rawId = id.replace(/^flip_/, '');
  const json = await flipFetch<any>(`/music/${rawId}`);
  const result = json?.data?.results || json?.data;
  if (!result) return null;
  return normalizeFlipSong(result);
}

/**
 * Get live signed stream URL for a Flip Musix track
 */
export async function getFlipStreamUrl(id: string): Promise<string | null> {
  const rawId = id.replace(/^flip_/, '');
  const json = await flipFetch<any>(`/stream/${rawId}`);
  const streamUrl = json?.data?.stream_url || json?.data?.url;
  if (streamUrl && typeof streamUrl === 'string') {
    return streamUrl;
  }
  return `${BASE_URL}/download/${rawId}`;
}

/**
 * Get Album detail from Flip Musix
 */
export async function getFlipAlbumById(id: string): Promise<Album | null> {
  const rawId = id.replace(/^flip_/, '');
  const json = await flipFetch<any>(`/album/${rawId}`);
  const result = json?.data?.results || json?.data;
  if (!result) return null;
  return normalizeFlipAlbum(result);
}

/**
 * Get Playlist detail from Flip Musix
 */
export async function getFlipPlaylistById(id: string): Promise<Playlist | null> {
  const rawId = id.replace(/^flip_/, '');
  const json = await flipFetch<any>(`/playlist/${rawId}`);
  const result = json?.data?.results || json?.data;
  if (!result) return null;
  return normalizeFlipPlaylist(result);
}

/**
 * Get Artist profile from Flip Musix
 */
export async function getFlipArtistProfile(slugOrId: string): Promise<Artist | null> {
  const raw = slugOrId.replace(/^flip_art_/, '').replace(/^flip_/, '');
  const json = await flipFetch<any>(`/artist/${raw}`);
  const profile = json?.data?.results || json?.data;
  if (!profile) return null;

  const artist = normalizeFlipArtist(profile);

  // Fetch artist tracks
  if (profile.id) {
    try {
      const songsJson = await flipFetch<any>(`/artist/${profile.id}/songs?page=1`);
      const songResults = songsJson?.data?.results || [];
      if (Array.isArray(songResults) && songResults.length > 0) {
        artist.topSongs = songResults.map(item => normalizeFlipSong(item));
      }
    } catch (e) {
      console.warn('Could not fetch Flip artist songs:', e);
    }

    try {
      const albumsJson = await flipFetch<any>(`/artist/${profile.id}/albums?page=1`);
      const albumResults = albumsJson?.data?.results || [];
      if (Array.isArray(albumResults) && albumResults.length > 0) {
        artist.topAlbums = albumResults.map(item => normalizeFlipAlbum(item));
      }
    } catch (e) {
      console.warn('Could not fetch Flip artist albums:', e);
    }
  }

  return artist;
}
