import {
  Song,
  Album,
  Artist,
  Playlist,
  SearchResults,
  AudioQualityKey
} from '../types/music';
import {
  normalizeSong,
  normalizeAlbum,
  normalizeArtist,
  normalizePlaylist
} from './normalizers';

const API_BASE_URL = 'https://jiosaavanapi-flame.vercel.app';

// Simple in-memory cache with 5-minute TTL to ensure fast navigation & zero repeated requests
const memoryCache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

async function fetchFromApi<T>(endpoint: string, options: { bypassCache?: boolean } = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  if (!options.bypassCache) {
    const cached = memoryCache.get(url);
    if (cached && Date.now() < cached.expiry) {
      return cached.data as T;
    }
  }

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed with HTTP ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();
    
    // Some endpoints return { success: false, message: ... }
    if (json && typeof json === 'object' && json.success === false) {
      throw new Error(json.message || 'API returned an unsuccessful status');
    }

    memoryCache.set(url, { data: json, expiry: Date.now() + CACHE_TTL_MS });
    return json as T;
  } catch (err: any) {
    console.error(`Fetch error for ${url}:`, err);
    throw err;
  }
}

/**
 * Universal Search across all categories
 */
export async function search(query: string, preferredQuality?: AudioQualityKey): Promise<SearchResults> {
  if (!query || !query.trim()) {
    return { songs: [], albums: [], artists: [], playlists: [] };
  }

  const json = await fetchFromApi<any>(`/api/search?query=${encodeURIComponent(query.trim())}`);
  const data = json?.data || {};

  const songs: Song[] = (data.songs?.results || []).map((s: any) => normalizeSong(s, preferredQuality));
  const albums: Album[] = (data.albums?.results || []).map((a: any) => normalizeAlbum(a));
  const artists: Artist[] = (data.artists?.results || []).map((a: any) => normalizeArtist(a));
  const playlists: Playlist[] = (data.playlists?.results || []).map((p: any) => normalizePlaylist(p));

  return {
    songs,
    albums,
    artists,
    playlists,
    topQuery: data.topQuery
  };
}

/**
 * Search Songs dedicated
 */
export async function searchSongs(query: string, preferredQuality?: AudioQualityKey): Promise<Song[]> {
  if (!query || !query.trim()) return [];
  const json = await fetchFromApi<any>(`/api/search/songs?query=${encodeURIComponent(query.trim())}`);
  const results = json?.data?.results || (Array.isArray(json?.data) ? json.data : []);
  return results.map((s: any) => normalizeSong(s, preferredQuality));
}

/**
 * Search Albums dedicated
 */
export async function searchAlbums(query: string): Promise<Album[]> {
  if (!query || !query.trim()) return [];
  const json = await fetchFromApi<any>(`/api/search/albums?query=${encodeURIComponent(query.trim())}`);
  const results = json?.data?.results || (Array.isArray(json?.data) ? json.data : []);
  return results.map((a: any) => normalizeAlbum(a));
}

/**
 * Search Artists dedicated
 */
export async function searchArtists(query: string): Promise<Artist[]> {
  if (!query || !query.trim()) return [];
  const json = await fetchFromApi<any>(`/api/search/artists?query=${encodeURIComponent(query.trim())}`);
  const results = json?.data?.results || (Array.isArray(json?.data) ? json.data : []);
  return results.map((a: any) => normalizeArtist(a));
}

/**
 * Search Playlists dedicated
 */
export async function searchPlaylists(query: string): Promise<Playlist[]> {
  if (!query || !query.trim()) return [];
  const json = await fetchFromApi<any>(`/api/search/playlists?query=${encodeURIComponent(query.trim())}`);
  const results = json?.data?.results || (Array.isArray(json?.data) ? json.data : []);
  return results.map((p: any) => normalizePlaylist(p));
}

/**
 * Get Song by ID
 */
export async function getSongById(id: string, preferredQuality?: AudioQualityKey): Promise<Song | null> {
  if (!id) return null;
  const json = await fetchFromApi<any>(`/api/songs/${encodeURIComponent(id)}`);
  const raw = Array.isArray(json?.data) ? json.data[0] : json?.data;
  if (!raw) return null;
  return normalizeSong(raw, preferredQuality);
}

/**
 * Get Multiple Songs by IDs
 */
export async function getSongsByIds(ids: string[], preferredQuality?: AudioQualityKey): Promise<Song[]> {
  if (!ids || ids.length === 0) return [];
  const json = await fetchFromApi<any>(`/api/songs?ids=${encodeURIComponent(ids.join(','))}`);
  const rawList = Array.isArray(json?.data) ? json.data : [];
  return rawList.map((s: any) => normalizeSong(s, preferredQuality));
}

/**
 * Get Songs by JioSaavn Link
 */
export async function getSongsByLink(link: string, preferredQuality?: AudioQualityKey): Promise<Song[]> {
  if (!link) return [];
  const json = await fetchFromApi<any>(`/api/songs?link=${encodeURIComponent(link)}`);
  const rawList = Array.isArray(json?.data) ? json.data : (json?.data ? [json.data] : []);
  return rawList.map((s: any) => normalizeSong(s, preferredQuality));
}

/**
 * Get Song Suggestions / Recommendations
 */
export async function getSongSuggestions(id: string, preferredQuality?: AudioQualityKey): Promise<Song[]> {
  if (!id) return [];
  try {
    const json = await fetchFromApi<any>(`/api/songs/${encodeURIComponent(id)}/suggestions`);
    const list = Array.isArray(json?.data) ? json.data : [];
    return list.map((s: any) => normalizeSong(s, preferredQuality));
  } catch (e) {
    console.warn(`Could not get suggestions for song ${id}:`, e);
    return [];
  }
}

/**
 * Get Album by ID
 */
export async function getAlbumById(id: string, preferredQuality?: AudioQualityKey): Promise<Album | null> {
  if (!id) return null;
  const json = await fetchFromApi<any>(`/api/albums?id=${encodeURIComponent(id)}`);
  const raw = json?.data;
  if (!raw) return null;
  const album = normalizeAlbum(raw);
  // Ensure songs are normalized with preferred quality
  if (raw.songs && Array.isArray(raw.songs)) {
    album.songs = raw.songs.map((s: any) => normalizeSong(s, preferredQuality));
  }
  return album;
}

/**
 * Get Album by Link
 */
export async function getAlbumByLink(link: string, preferredQuality?: AudioQualityKey): Promise<Album | null> {
  if (!link) return null;
  const json = await fetchFromApi<any>(`/api/albums?link=${encodeURIComponent(link)}`);
  const raw = json?.data;
  if (!raw) return null;
  const album = normalizeAlbum(raw);
  if (raw.songs && Array.isArray(raw.songs)) {
    album.songs = raw.songs.map((s: any) => normalizeSong(s, preferredQuality));
  }
  return album;
}

/**
 * Get Artist by ID
 */
export async function getArtistById(id: string, preferredQuality?: AudioQualityKey): Promise<Artist | null> {
  if (!id) return null;
  const json = await fetchFromApi<any>(`/api/artists?id=${encodeURIComponent(id)}`);
  const raw = json?.data;
  if (!raw) return null;
  const artist = normalizeArtist(raw);
  if (raw.topSongs && Array.isArray(raw.topSongs)) {
    artist.topSongs = raw.topSongs.map((s: any) => normalizeSong(s, preferredQuality));
  }
  return artist;
}

/**
 * Get Artist by Link
 */
export async function getArtistByLink(link: string, preferredQuality?: AudioQualityKey): Promise<Artist | null> {
  if (!link) return null;
  const json = await fetchFromApi<any>(`/api/artists?link=${encodeURIComponent(link)}`);
  const raw = json?.data;
  if (!raw) return null;
  const artist = normalizeArtist(raw);
  if (raw.topSongs && Array.isArray(raw.topSongs)) {
    artist.topSongs = raw.topSongs.map((s: any) => normalizeSong(s, preferredQuality));
  }
  return artist;
}

/**
 * Get Playlist by ID
 */
export async function getPlaylistById(id: string, preferredQuality?: AudioQualityKey): Promise<Playlist | null> {
  if (!id) return null;
  const json = await fetchFromApi<any>(`/api/playlists?id=${encodeURIComponent(id)}`);
  const raw = json?.data;
  if (!raw) return null;
  const playlist = normalizePlaylist(raw);
  if (raw.songs && Array.isArray(raw.songs)) {
    playlist.songs = raw.songs.map((s: any) => normalizeSong(s, preferredQuality));
  }
  return playlist;
}

/**
 * Get Playlist by Link
 */
export async function getPlaylistByLink(link: string, preferredQuality?: AudioQualityKey): Promise<Playlist | null> {
  if (!link) return null;
  const json = await fetchFromApi<any>(`/api/playlists?link=${encodeURIComponent(link)}`);
  const raw = json?.data;
  if (!raw) return null;
  const playlist = normalizePlaylist(raw);
  if (raw.songs && Array.isArray(raw.songs)) {
    playlist.songs = raw.songs.map((s: any) => normalizeSong(s, preferredQuality));
  }
  return playlist;
}
