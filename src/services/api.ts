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
import {
  searchFlipSongs,
  searchFlipAlbums,
  searchFlipArtists,
  getFlipSongById,
  getFlipStreamUrl,
  getFlipAlbumById,
  getFlipPlaylistById,
  getFlipArtistProfile,
  getFlipTrendingSongs,
  getFlipTrendingAlbums,
  getFlipChartSongs,
  getFlipChartAlbums,
  getFlipHomeFeed,
  getFlipRecentSongs,
  getFlipGenres
} from './flipMusix';
import {
  mergeSongLists,
  mergeAlbumLists,
  mergeArtistLists,
  mergePlaylistLists
} from './catalogMerger';

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
 * Universal Unified Search across BOTH APIs (JioSaavn + Flip Musix)
 * Queries both data sources independently in parallel, normalizes and merges the catalogs.
 */
export async function search(query: string, preferredQuality?: AudioQualityKey): Promise<SearchResults> {
  if (!query || !query.trim()) {
    return { songs: [], albums: [], artists: [], playlists: [] };
  }

  const cleanQuery = query.trim();

  // Execute queries to BOTH APIs independently and concurrently
  const [
    jioGlobalRes,
    jioSongsRes,
    flipSongsRes,
    flipAlbumsRes,
    flipArtistsRes
  ] = await Promise.allSettled([
    fetchFromApi<any>(`/api/search?query=${encodeURIComponent(cleanQuery)}`),
    searchJioSongs(cleanQuery, preferredQuality),
    searchFlipSongs(cleanQuery, 1),
    searchFlipAlbums(cleanQuery, 1),
    searchFlipArtists(cleanQuery, 1)
  ]);

  // Extract API 1 (JioSaavn) results
  const jioJson = jioGlobalRes.status === 'fulfilled' ? jioGlobalRes.value : null;
  const jioData = jioJson?.data || {};

  let jioSongs: Song[] = [];
  if (jioSongsRes.status === 'fulfilled' && jioSongsRes.value.length > 0) {
    jioSongs = jioSongsRes.value;
  } else {
    jioSongs = (jioData.songs?.results || []).map((s: any) => normalizeSong(s, preferredQuality));
  }

  const jioAlbums: Album[] = (jioData.albums?.results || []).map((a: any) => normalizeAlbum(a));
  const jioArtists: Artist[] = (jioData.artists?.results || []).map((a: any) => normalizeArtist(a));
  const jioPlaylists: Playlist[] = (jioData.playlists?.results || []).map((p: any) => normalizePlaylist(p));

  // Extract API 2 (Flip Musix) results
  const flipSongs = flipSongsRes.status === 'fulfilled' ? flipSongsRes.value : [];
  const flipAlbums = flipAlbumsRes.status === 'fulfilled' ? flipAlbumsRes.value : [];
  const flipArtists = flipArtistsRes.status === 'fulfilled' ? flipArtistsRes.value : [];

  // Merge and deduplicate both complete catalogs
  const mergedSongs = mergeSongLists(jioSongs, flipSongs);
  const mergedAlbums = mergeAlbumLists(jioAlbums, flipAlbums);
  const mergedArtists = mergeArtistLists(jioArtists, flipArtists);
  const mergedPlaylists = jioPlaylists;

  return {
    songs: mergedSongs,
    albums: mergedAlbums,
    artists: mergedArtists,
    playlists: mergedPlaylists,
    topQuery: jioData.topQuery
  };
}

/**
 * Helper to fetch only from JioSaavn songs
 */
async function searchJioSongs(query: string, preferredQuality?: AudioQualityKey, page: number = 1): Promise<Song[]> {
  try {
    const json = await fetchFromApi<any>(`/api/search/songs?query=${encodeURIComponent(query.trim())}&page=${page}&limit=40`);
    const results = json?.data?.results || (Array.isArray(json?.data) ? json.data : []);
    return results.map((s: any) => normalizeSong(s, preferredQuality));
  } catch (e) {
    console.warn('[JioSaavn] searchSongs failed:', e);
    return [];
  }
}

/**
 * Unified Search Songs across BOTH APIs
 */
export async function searchSongs(query: string, preferredQuality?: AudioQualityKey, page: number = 1): Promise<Song[]> {
  if (!query || !query.trim()) return [];

  const [jioRes, flipRes] = await Promise.allSettled([
    searchJioSongs(query, preferredQuality, page),
    searchFlipSongs(query, page)
  ]);

  const jioSongs = jioRes.status === 'fulfilled' ? jioRes.value : [];
  const flipSongs = flipRes.status === 'fulfilled' ? flipRes.value : [];

  return mergeSongLists(jioSongs, flipSongs);
}

/**
 * Unified Search Albums across BOTH APIs
 */
export async function searchAlbums(query: string, page: number = 1): Promise<Album[]> {
  if (!query || !query.trim()) return [];

  const [jioRes, flipRes] = await Promise.allSettled([
    fetchFromApi<any>(`/api/search/albums?query=${encodeURIComponent(query.trim())}&page=${page}&limit=30`),
    searchFlipAlbums(query, page)
  ]);

  let jioAlbums: Album[] = [];
  if (jioRes.status === 'fulfilled') {
    const results = jioRes.value?.data?.results || (Array.isArray(jioRes.value?.data) ? jioRes.value.data : []);
    jioAlbums = results.map((a: any) => normalizeAlbum(a));
  }

  const flipAlbums = flipRes.status === 'fulfilled' ? flipRes.value : [];

  return mergeAlbumLists(jioAlbums, flipAlbums);
}

/**
 * Unified Search Artists across BOTH APIs
 */
export async function searchArtists(query: string, page: number = 1): Promise<Artist[]> {
  if (!query || !query.trim()) return [];

  const [jioRes, flipRes] = await Promise.allSettled([
    fetchFromApi<any>(`/api/search/artists?query=${encodeURIComponent(query.trim())}&page=${page}&limit=30`),
    searchFlipArtists(query, page)
  ]);

  let jioArtists: Artist[] = [];
  if (jioRes.status === 'fulfilled') {
    const results = jioRes.value?.data?.results || (Array.isArray(jioRes.value?.data) ? jioRes.value.data : []);
    jioArtists = results.map((a: any) => normalizeArtist(a));
  }

  const flipArtists = flipRes.status === 'fulfilled' ? flipRes.value : [];

  return mergeArtistLists(jioArtists, flipArtists);
}

/**
 * Unified Search Playlists across APIs
 */
export async function searchPlaylists(query: string, page: number = 1): Promise<Playlist[]> {
  if (!query || !query.trim()) return [];

  try {
    const json = await fetchFromApi<any>(`/api/search/playlists?query=${encodeURIComponent(query.trim())}&page=${page}&limit=30`);
    const results = json?.data?.results || (Array.isArray(json?.data) ? json.data : []);
    return results.map((p: any) => normalizePlaylist(p));
  } catch (e) {
    console.warn('[JioSaavn] searchPlaylists failed:', e);
    return [];
  }
}

/**
 * Unified Get Song by ID (handles both JioSaavn IDs and Flip Musix `flip_` IDs)
 */
export async function getSongById(id: string, preferredQuality?: AudioQualityKey): Promise<Song | null> {
  if (!id) return null;

  // Case 1: Flip Musix track
  if (id.startsWith('flip_')) {
    try {
      const flipSong = await getFlipSongById(id);
      if (flipSong) {
        // Try getting live stream URL
        const streamUrl = await getFlipStreamUrl(id);
        if (streamUrl) {
          flipSong.playableUrl = streamUrl;
        }
        return flipSong;
      }
    } catch (e) {
      console.warn(`[FlipMusix] getSongById(${id}) failed:`, e);
    }
  }

  // Case 2: JioSaavn track ID
  try {
    const json = await fetchFromApi<any>(`/api/songs/${encodeURIComponent(id)}`);
    const raw = Array.isArray(json?.data) ? json.data[0] : json?.data;
    if (raw) {
      const normalized = normalizeSong(raw, preferredQuality);
      if (normalized.playableUrl || normalized.audioUrls.length > 0) {
        return normalized;
      }
    }
  } catch (e) {
    console.warn(`Direct song fetch /api/songs/${id} failed, trying query params:`, e);
  }

  // Fallback query param endpoint: /api/songs?ids=:id
  try {
    const json = await fetchFromApi<any>(`/api/songs?ids=${encodeURIComponent(id)}`);
    const raw = Array.isArray(json?.data) ? json.data[0] : json?.data;
    if (raw) {
      const normalized = normalizeSong(raw, preferredQuality);
      if (normalized.playableUrl || normalized.audioUrls.length > 0) {
        return normalized;
      }
    }
  } catch (e2) {
    console.warn(`Query param /api/songs?ids=${id} failed:`, e2);
  }

  // If ID is or contains a JioSaavn link: /api/songs?link=:link
  if (id.includes('jiosaavn.com')) {
    try {
      const json = await fetchFromApi<any>(`/api/songs?link=${encodeURIComponent(id)}`);
      const raw = Array.isArray(json?.data) ? json.data[0] : json?.data;
      if (raw) return normalizeSong(raw, preferredQuality);
    } catch (e3) {
      console.warn(`Link query /api/songs?link=${id} failed:`, e3);
    }
  }

  // Final fallback: try Flip Musix if JioSaavn failed
  try {
    const fallbackFlip = await getFlipSongById(id);
    if (fallbackFlip) return fallbackFlip;
  } catch {}

  return null;
}

/**
 * Get Song Suggestions / Recommendations from both sources
 */
export async function getSongSuggestions(id: string, preferredQuality?: AudioQualityKey): Promise<Song[]> {
  if (!id) return [];

  if (id.startsWith('flip_')) {
    try {
      const trending = await getFlipTrendingSongs(1);
      return trending.filter(s => s.id !== id).slice(0, 10);
    } catch {
      return [];
    }
  }

  try {
    const json = await fetchFromApi<any>(`/api/songs/${encodeURIComponent(id)}/suggestions`);
    const list = Array.isArray(json?.data) ? json.data : [];
    const jioSongs = list.map((s: any) => normalizeSong(s, preferredQuality));
    return jioSongs;
  } catch (e) {
    console.warn(`Could not get suggestions for song ${id}:`, e);
    return [];
  }
}

/**
 * Unified Get Album by ID (supports JioSaavn & Flip Musix `flip_` IDs)
 */
export async function getAlbumById(id: string, preferredQuality?: AudioQualityKey): Promise<Album | null> {
  if (!id) return null;

  if (id.startsWith('flip_')) {
    return getFlipAlbumById(id);
  }

  try {
    const json = await fetchFromApi<any>(`/api/albums?id=${encodeURIComponent(id)}`);
    const raw = json?.data;
    if (!raw) return null;
    const album = normalizeAlbum(raw);
    if (raw.songs && Array.isArray(raw.songs)) {
      album.songs = raw.songs.map((s: any) => normalizeSong(s, preferredQuality));
    }
    return album;
  } catch (e) {
    console.warn(`[JioSaavn] getAlbumById(${id}) failed:`, e);
    return null;
  }
}

/**
 * Unified Get Artist by ID or Slug
 */
export async function getArtistById(id: string, preferredQuality?: AudioQualityKey): Promise<Artist | null> {
  if (!id) return null;

  if (id.startsWith('flip_')) {
    return getFlipArtistProfile(id);
  }

  try {
    const json = await fetchFromApi<any>(`/api/artists?id=${encodeURIComponent(id)}`);
    const raw = json?.data;
    if (!raw) return null;
    const artist = normalizeArtist(raw);
    if (raw.topSongs && Array.isArray(raw.topSongs)) {
      artist.topSongs = raw.topSongs.map((s: any) => normalizeSong(s, preferredQuality));
    }
    return artist;
  } catch (e) {
    console.warn(`[JioSaavn] getArtistById(${id}) failed:`, e);
    return null;
  }
}

/**
 * Unified Get Playlist by ID
 */
export async function getPlaylistById(id: string, preferredQuality?: AudioQualityKey): Promise<Playlist | null> {
  if (!id) return null;

  if (id.startsWith('flip_')) {
    return getFlipPlaylistById(id);
  }

  try {
    const json = await fetchFromApi<any>(`/api/playlists?id=${encodeURIComponent(id)}`);
    const raw = json?.data;
    if (!raw) return null;
    const playlist = normalizePlaylist(raw);
    if (raw.songs && Array.isArray(raw.songs)) {
      playlist.songs = raw.songs.map((s: any) => normalizeSong(s, preferredQuality));
    }
    return playlist;
  } catch (e) {
    console.warn(`[JioSaavn] getPlaylistById(${id}) failed:`, e);
    return null;
  }
}

/**
 * Get Trending Songs across BOTH catalogs
 */
export async function getTrendingSongs(page: number = 1): Promise<Song[]> {
  const [jioRes, flipRes] = await Promise.allSettled([
    searchJioSongs('Trending Hits', undefined, page),
    getFlipTrendingSongs(page)
  ]);

  const jioSongs = jioRes.status === 'fulfilled' ? jioRes.value : [];
  const flipSongs = flipRes.status === 'fulfilled' ? flipRes.value : [];

  return mergeSongLists(jioSongs, flipSongs);
}

/**
 * Get Trending Albums across BOTH catalogs
 */
export async function getTrendingAlbums(page: number = 1): Promise<Album[]> {
  const [jioRes, flipRes] = await Promise.allSettled([
    searchAlbums('Trending', page),
    getFlipTrendingAlbums(page)
  ]);

  const jioAlbums = jioRes.status === 'fulfilled' ? jioRes.value : [];
  const flipAlbums = flipRes.status === 'fulfilled' ? flipRes.value : [];

  return mergeAlbumLists(jioAlbums, flipAlbums);
}

/**
 * Get unified home feed data combining curated sections from both APIs
 */
export async function getUnifiedHomeData(): Promise<{
  trendingNow: Song[];
  weeklyCharts: Song[];
  trendingAlbums: Album[];
  popularArtists: Artist[];
  curatedPlaylists: Playlist[];
  bollywoodHits: Song[];
  punjabiBeats: Song[];
  chillLofi: Song[];
  genres: string[];
}> {
  const [
    flipFeedRes,
    bollyJioRes,
    punjabiJioRes,
    chillJioRes,
    arijitJioRes,
    albJioRes,
    artJioRes,
    plJioRes
  ] = await Promise.allSettled([
    getFlipHomeFeed(),
    searchJioSongs('Bollywood Hits'),
    searchJioSongs('Punjabi Hits'),
    searchJioSongs('Chill Lo-Fi'),
    searchJioSongs('Arijit Singh'),
    searchAlbums('Bollywood'),
    searchArtists('Arijit'),
    searchPlaylists('Hits')
  ]);

  const flipFeed = flipFeedRes.status === 'fulfilled' ? flipFeedRes.value : null;
  const bollyJio = bollyJioRes.status === 'fulfilled' ? bollyJioRes.value : [];
  const punjabiJio = punjabiJioRes.status === 'fulfilled' ? punjabiJioRes.value : [];
  const chillJio = chillJioRes.status === 'fulfilled' ? chillJioRes.value : [];
  const arijitJio = arijitJioRes.status === 'fulfilled' ? arijitJioRes.value : [];
  const albJio = albJioRes.status === 'fulfilled' ? albJioRes.value : [];
  const artJio = artJioRes.status === 'fulfilled' ? artJioRes.value : [];
  const plJio = plJioRes.status === 'fulfilled' ? plJioRes.value : [];

  const flipTrending = flipFeed?.trendingSongs || [];
  const flipCharts = flipFeed?.topCharts || [];
  const flipAlbums = flipFeed?.trendingAlbums || [];
  const flipRecent = flipFeed?.recentlyAdded || [];

  // Merge trending from both
  const trendingNow = mergeSongLists(bollyJio, flipTrending);
  const weeklyCharts = mergeSongLists(flipCharts, arijitJio);
  const trendingAlbums = mergeAlbumLists(albJio, flipAlbums);
  const bollywoodHits = bollyJio;
  const punjabiBeats = punjabiJio;
  const chillLofi = mergeSongLists(chillJio, flipRecent);
  const popularArtists = artJio;
  const curatedPlaylists = plJio;
  const genres = flipFeed?.genres && flipFeed.genres.length > 0 ? flipFeed.genres : [
    'Bollywood',
    'Punjabi',
    'Pop',
    'Lo-Fi',
    'Romantic',
    'Hip-Hop',
    'Rock',
    'EDM',
    'Devotional',
    'Ghazals'
  ];

  return {
    trendingNow,
    weeklyCharts,
    trendingAlbums,
    popularArtists,
    curatedPlaylists,
    bollywoodHits,
    punjabiBeats,
    chillLofi,
    genres
  };
}

export {
  getFlipChartSongs,
  getFlipChartAlbums,
  getFlipRecentSongs,
  getFlipGenres,
  getFlipStreamUrl
};
