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
    if (raw) {
      const artist = normalizeArtist(raw);
      if (raw.topSongs && Array.isArray(raw.topSongs) && raw.topSongs.length > 0) {
        artist.topSongs = raw.topSongs.map((s: any) => normalizeSong(s, preferredQuality));
      } else {
        // Fetch top songs by searching the artist's name
        const songs = await searchJioSongs(artist.name || 'Top Songs');
        artist.topSongs = songs;
      }
      return artist;
    }
  } catch (e) {
    console.warn(`[JioSaavn] getArtistById(${id}) failed, searching fallback:`, e);
  }

  // Fallback search artist by id/name if direct id fails
  try {
    const searchRes = await searchArtists(id);
    if (searchRes.length > 0) {
      const artist = searchRes[0];
      const songs = await searchJioSongs(artist.name);
      artist.topSongs = songs;
      return artist;
    }
  } catch {}

  return null;
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
 * Top Trending Artists to fetch dynamically from API with real API images
 */
const POPULAR_ARTIST_NAMES = [
  'Tyler, The Creator',
  '21 Savage',
  '6ix9ine',
  'Travis Scott',
  'Arijit Singh',
  'Diljit Dosanjh',
  'Kumar Sanu',
  'Kishore Kumar',
  'The Weeknd',
  'Shreya Ghoshal',
  'Sonu Nigam',
  'Udit Narayan',
  'Alka Yagnik',
  'Billie Eilish',
  'Anuv Jain',
  'Karan Aujla',
  'Shubh',
  'A.R. Rahman',
  'KK',
  'Lucky Ali'
];

/**
 * Fetch real artists directly from the API preserving their official CDN photos
 */
export async function getPopularArtists(): Promise<Artist[]> {
  try {
    const searchPromises = POPULAR_ARTIST_NAMES.slice(0, 10).map(async (name) => {
      try {
        const results = await searchArtists(name);
        return results[0] || null;
      } catch {
        return null;
      }
    });

    const settled = await Promise.all(searchPromises);
    const artists = settled.filter((a): a is Artist => a !== null && Boolean(a.name));

    // Remove duplicates by name
    const seen = new Set<string>();
    const uniqueArtists: Artist[] = [];
    for (const a of artists) {
      const lower = a.name.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        uniqueArtists.push(a);
      }
    }

    if (uniqueArtists.length > 0) {
      return uniqueArtists;
    }
  } catch (e) {
    console.warn('Error fetching popular artists from API:', e);
  }

  // If initial batch is empty, fallback search top artists
  try {
    return await searchArtists('Top Artists');
  } catch {
    return [];
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

export const CURATED_POPULAR_ARTISTS: Artist[] = [
  // 90s & Evergreen Masters
  {
    id: '456269',
    name: 'Kishore Kumar',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
    role: 'Legendary Voice'
  },
  {
    id: '455124',
    name: 'Kumar Sanu',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    role: '90s King of Melody'
  },
  {
    id: '455130',
    name: 'Udit Narayan',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80',
    role: 'Romantic Maestro'
  },
  {
    id: '455125',
    name: 'Alka Yagnik',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80',
    role: 'Playback Queen'
  },
  {
    id: '456268',
    name: 'Lata Mangeshkar',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&auto=format&fit=crop&q=80',
    role: 'Nightingale of India'
  },
  {
    id: '455127',
    name: 'Sonu Nigam',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
    role: 'Versatile Icon'
  },
  {
    id: '456279',
    name: 'A.R. Rahman',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=80',
    role: 'Maestro Composer'
  },
  {
    id: '455132',
    name: 'KK',
    image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500&auto=format&fit=crop&q=80',
    role: 'Soulful Legend'
  },
  {
    id: '455800',
    name: 'Lucky Ali',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80',
    role: 'Indie Nostalgia'
  },

  // Modern Superstars & Hitmakers
  {
    id: '459320',
    name: 'Arijit Singh',
    image: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=500&auto=format&fit=crop&q=80',
    role: 'Heart of Bollywood'
  },
  {
    id: '464932',
    name: 'Diljit Dosanjh',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80',
    role: 'Global Punjabi Star'
  },
  {
    id: '8869877',
    name: 'AP Dhillon',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
    role: 'Brown Munde Wave'
  },
  {
    id: '455134',
    name: 'Shreya Ghoshal',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    role: 'Melody Queen'
  },
  {
    id: '5568923',
    name: 'Anuv Jain',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=80',
    role: 'Acoustic Indie'
  },
  {
    id: '10474621',
    name: 'Shubh',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80',
    role: 'Punjabi Hip-Hop'
  },
  {
    id: '5543209',
    name: 'Karan Aujla',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80',
    role: 'Geetan Di Machine'
  },
  {
    id: '4925620',
    name: 'Prateek Kuhad',
    image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500&auto=format&fit=crop&q=80',
    role: 'Indie Singer-Songwriter'
  },
  {
    id: '5145252',
    name: 'The Weeknd',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
    role: 'Global Pop Icon'
  },
  {
    id: '4947901',
    name: 'Billie Eilish',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80',
    role: 'Grammy Winner'
  }
];

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
  ninetiesHits: Song[];
  chillLofi: Song[];
  genres: string[];
}> {
  const [
    flipFeedRes,
    bollyJioRes,
    punjabiJioRes,
    chillJioRes,
    ninetiesJioRes,
    trendingHitsJioRes,
    albJioRes,
    plJioRes,
    popArtistsRes
  ] = await Promise.allSettled([
    getFlipHomeFeed(),
    searchJioSongs('Bollywood Hits'),
    searchJioSongs('Punjabi Hits'),
    searchJioSongs('Chill Lo-Fi'),
    searchJioSongs('90s Bollywood Romantic Hits'),
    searchJioSongs('Hindi Trending 2024'),
    searchAlbums('Bollywood Hits'),
    searchPlaylists('Top Bollywood'),
    getPopularArtists()
  ]);

  const flipFeed = flipFeedRes.status === 'fulfilled' ? flipFeedRes.value : null;
  const bollyJio = bollyJioRes.status === 'fulfilled' ? bollyJioRes.value : [];
  const punjabiJio = punjabiJioRes.status === 'fulfilled' ? punjabiJioRes.value : [];
  const chillJio = chillJioRes.status === 'fulfilled' ? chillJioRes.value : [];
  const ninetiesJio = ninetiesJioRes.status === 'fulfilled' ? ninetiesJioRes.value : [];
  const trendingHitsJio = trendingHitsJioRes.status === 'fulfilled' ? trendingHitsJioRes.value : [];
  const albJio = albJioRes.status === 'fulfilled' ? albJioRes.value : [];
  const plJio = plJioRes.status === 'fulfilled' ? plJioRes.value : [];
  const apiArtists = popArtistsRes.status === 'fulfilled' ? popArtistsRes.value : [];

  const flipTrending = flipFeed?.trendingSongs || [];
  const flipCharts = flipFeed?.topCharts || [];
  const flipAlbums = flipFeed?.trendingAlbums || [];
  const flipRecent = flipFeed?.recentlyAdded || [];

  // Merge trending from both
  const trendingNow = mergeSongLists(trendingHitsJio.length > 0 ? trendingHitsJio : bollyJio, flipTrending);
  const weeklyCharts = mergeSongLists(flipCharts, bollyJio);
  const trendingAlbums = mergeAlbumLists(albJio, flipAlbums);
  const bollywoodHits = bollyJio;
  const punjabiBeats = punjabiJio;
  const ninetiesHits = ninetiesJio;
  const chillLofi = mergeSongLists(chillJio, flipRecent);
  
  // Real API artists with their official API images
  const popularArtists = apiArtists.length > 0 ? apiArtists : CURATED_POPULAR_ARTISTS;
  const curatedPlaylists = plJio;
  const genres = flipFeed?.genres && flipFeed.genres.length > 0 ? flipFeed.genres : [
    'Bollywood',
    '90s Nostalgia',
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
    ninetiesHits,
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
