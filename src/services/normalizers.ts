import { Song, Album, Artist, Playlist, AudioUrl, ImageObject, ArtistMini, AudioQualityKey } from '../types/music';
import { decodeHtml, sanitizeAudioUrl } from '../utils/formatters';

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80';

/**
 * Extract the highest resolution image from image array or string
 */
export function extractBestImage(rawImage: any): string {
  if (!rawImage) return DEFAULT_COVER;
  if (typeof rawImage === 'string') return rawImage;
  if (Array.isArray(rawImage) && rawImage.length > 0) {
    // Try to find 500x500 first, or last in array (usually highest quality)
    const best = rawImage.find((img: any) => img?.quality === '500x500') ||
                 rawImage.find((img: any) => img?.quality === '150x150') ||
                 rawImage[rawImage.length - 1];
    return best?.url || rawImage[0]?.url || DEFAULT_COVER;
  }
  return DEFAULT_COVER;
}

/**
 * Extract normalized images array
 */
export function extractImages(rawImage: any): ImageObject[] {
  if (Array.isArray(rawImage)) {
    return rawImage.map(img => ({
      quality: img?.quality || '',
      url: img?.url || ''
    }));
  }
  if (typeof rawImage === 'string') {
    return [{ quality: 'default', url: rawImage }];
  }
  return [];
}

/**
 * Extract audio URLs and select best playable URL
 */
export function extractAudioUrls(rawDownload: any, preferredQuality: AudioQualityKey = '320kbps'): { audioUrls: AudioUrl[]; playableUrl: string } {
  let audioUrls: AudioUrl[] = [];

  if (Array.isArray(rawDownload)) {
    audioUrls = rawDownload.map(item => ({
      quality: item?.quality || item?.bitrate || '',
      url: sanitizeAudioUrl(item?.url || item?.link || '')
    })).filter(item => Boolean(item.url));
  } else if (typeof rawDownload === 'string') {
    const clean = sanitizeAudioUrl(rawDownload);
    if (clean) audioUrls = [{ quality: 'default', url: clean }];
  }

  // Find preferred quality, or fall back to highest available bitrate
  let playableUrl = '';
  if (audioUrls.length > 0) {
    const match = audioUrls.find(a => a.quality?.toLowerCase() === preferredQuality.toLowerCase());
    if (match) {
      playableUrl = match.url;
    } else {
      // Prioritize 320 -> 160 -> 96 -> 48 -> last item
      const fallback320 = audioUrls.find(a => a.quality?.includes('320'));
      const fallback160 = audioUrls.find(a => a.quality?.includes('160'));
      const fallback96 = audioUrls.find(a => a.quality?.includes('96'));
      playableUrl = fallback320?.url || fallback160?.url || fallback96?.url || audioUrls[audioUrls.length - 1]?.url || '';
    }
  }

  return { audioUrls, playableUrl };
}

/**
 * Normalize artist list
 */
export function normalizeArtists(rawArtists: any, primaryArtistsString?: string): { artists: ArtistMini[]; artistString: string } {
  const artists: ArtistMini[] = [];

  if (rawArtists) {
    if (Array.isArray(rawArtists)) {
      rawArtists.forEach((a: any) => {
        if (typeof a === 'string') {
          artists.push({ id: a, name: decodeHtml(a) });
        } else if (a && typeof a === 'object') {
          artists.push({
            id: a.id || a.name || '',
            name: decodeHtml(a.name || a.title || 'Unknown Artist'),
            role: a.role,
            image: extractBestImage(a.image),
            url: a.url
          });
        }
      });
    } else if (typeof rawArtists === 'object') {
      // JioSaavn format: { primary: [...], featured: [...], all: [...] }
      const list = rawArtists.all || rawArtists.primary || [];
      if (Array.isArray(list)) {
        list.forEach((a: any) => {
          artists.push({
            id: a.id || a.name || '',
            name: decodeHtml(a.name || 'Unknown Artist'),
            role: a.role,
            image: extractBestImage(a.image),
            url: a.url
          });
        });
      }
    }
  }

  let artistString = '';
  if (artists.length > 0) {
    artistString = artists.map(a => a.name).join(', ');
  } else if (primaryArtistsString) {
    artistString = decodeHtml(primaryArtistsString);
    artists.push({ id: 'primary', name: artistString });
  } else {
    artistString = 'Unknown Artist';
  }

  return { artists, artistString };
}

/**
 * Normalize single raw song object from API
 */
export function normalizeSong(raw: any, preferredQuality: AudioQualityKey = '320kbps'): Song {
  if (!raw) {
    return {
      id: '',
      title: 'Unknown Track',
      artist: 'Unknown Artist',
      artists: [],
      image: DEFAULT_COVER,
      audioUrls: [],
      playableUrl: ''
    };
  }

  const { artists, artistString } = normalizeArtists(
    raw.artists || raw.more_info?.artistMap?.artists || raw.more_info?.music,
    raw.primaryArtists || raw.singers || raw.artist || raw.more_info?.singers
  );

  const { audioUrls, playableUrl } = extractAudioUrls(
    raw.downloadUrl || raw.downloadUrls || raw.media_urls || raw.url || raw.media_preview_url,
    preferredQuality
  );

  const albumName = decodeHtml(
    typeof raw.album === 'object' ? raw.album?.name || raw.album?.title : raw.album || raw.more_info?.album || ''
  );

  const albumId = typeof raw.album === 'object' ? raw.album?.id : raw.albumId || raw.more_info?.album_id || '';

  return {
    id: String(raw.id || raw.songId || ''),
    title: decodeHtml(raw.name || raw.title || raw.song || 'Unknown Song'),
    subtitle: decodeHtml(raw.subtitle || raw.description || ''),
    artist: artistString,
    artists,
    album: {
      id: albumId,
      name: albumName,
      url: typeof raw.album === 'object' ? raw.album?.url : undefined
    },
    image: extractBestImage(raw.image || raw.images),
    images: extractImages(raw.image || raw.images),
    duration: typeof raw.duration === 'string' ? parseInt(raw.duration, 10) : raw.duration || 0,
    releaseDate: raw.releaseDate || raw.year || '',
    year: raw.year || (raw.releaseDate ? String(raw.releaseDate).slice(0, 4) : ''),
    language: raw.language || '',
    playCount: raw.playCount || raw.play_count || '',
    hasLyrics: Boolean(raw.hasLyrics || raw.has_lyrics),
    audioUrls,
    playableUrl,
    url: raw.url
  };
}

/**
 * Normalize raw Album object from API
 */
export function normalizeAlbum(raw: any): Album {
  if (!raw) {
    return { id: '', name: 'Unknown Album', image: DEFAULT_COVER };
  }

  const songs: Song[] = Array.isArray(raw.songs) ? raw.songs.map((s: any) => normalizeSong(s)) : [];

  let artistName = '';
  if (typeof raw.artist === 'string') {
    artistName = decodeHtml(raw.artist);
  } else if (raw.artists) {
    if (typeof raw.artists === 'string') {
      artistName = decodeHtml(raw.artists);
    } else if (Array.isArray(raw.artists?.primary)) {
      artistName = raw.artists.primary.map((a: any) => decodeHtml(a.name)).join(', ');
    } else if (Array.isArray(raw.artists?.all)) {
      artistName = raw.artists.all.map((a: any) => decodeHtml(a.name)).join(', ');
    }
  }

  return {
    id: String(raw.id || ''),
    name: decodeHtml(raw.name || raw.title || 'Unknown Album'),
    title: decodeHtml(raw.name || raw.title || 'Unknown Album'),
    description: decodeHtml(raw.description || ''),
    year: raw.year || '',
    type: raw.type || 'album',
    language: raw.language || '',
    songCount: raw.songCount || songs.length || (raw.songs ? raw.songs.length : 0),
    artist: artistName || 'Various Artists',
    image: extractBestImage(raw.image || raw.images),
    images: extractImages(raw.image || raw.images),
    songs,
    url: raw.url,
    explicitContent: Boolean(raw.explicitContent)
  };
}

/**
 * Normalize raw Artist object from API
 */
export function normalizeArtist(raw: any): Artist {
  if (!raw) {
    return { id: '', name: 'Unknown Artist', image: DEFAULT_COVER };
  }

  const topSongs: Song[] = Array.isArray(raw.topSongs) ? raw.topSongs.map((s: any) => normalizeSong(s)) : [];
  const topAlbums: Album[] = Array.isArray(raw.topAlbums) ? raw.topAlbums.map((a: any) => normalizeAlbum(a)) : [];
  const singles: Album[] = Array.isArray(raw.singles) ? raw.singles.map((a: any) => normalizeAlbum(a)) : [];
  
  const similarArtists: ArtistMini[] = Array.isArray(raw.similarArtists) 
    ? raw.similarArtists.map((a: any) => ({
        id: a.id || a.name || '',
        name: decodeHtml(a.name || 'Artist'),
        image: extractBestImage(a.image),
        url: a.url
      }))
    : [];

  return {
    id: String(raw.id || ''),
    name: decodeHtml(raw.name || raw.title || 'Unknown Artist'),
    image: extractBestImage(raw.image || raw.images),
    images: extractImages(raw.image || raw.images),
    role: raw.role || 'Artist',
    followerCount: raw.followerCount || raw.fanCount || '0',
    fanCount: raw.fanCount || raw.followerCount || '0',
    isVerified: Boolean(raw.isVerified),
    dominantLanguage: raw.dominantLanguage || raw.language || '',
    bio: decodeHtml(Array.isArray(raw.bio) ? raw.bio.map((b: any) => b.text || b).join(' ') : raw.bio || ''),
    topSongs,
    topAlbums,
    singles,
    similarArtists,
    url: raw.url
  };
}

/**
 * Normalize raw Playlist object from API
 */
export function normalizePlaylist(raw: any): Playlist {
  if (!raw) {
    return { id: '', name: 'Unknown Playlist', image: DEFAULT_COVER };
  }

  const songs: Song[] = Array.isArray(raw.songs) ? raw.songs.map((s: any) => normalizeSong(s)) : [];

  return {
    id: String(raw.id || ''),
    name: decodeHtml(raw.name || raw.title || 'Unknown Playlist'),
    title: decodeHtml(raw.name || raw.title || 'Unknown Playlist'),
    description: decodeHtml(raw.description || raw.subtitle || ''),
    year: raw.year || '',
    type: raw.type || 'playlist',
    language: raw.language || '',
    songCount: raw.songCount || songs.length || 0,
    followerCount: raw.followerCount || raw.fanCount || '0',
    lastUpdated: raw.lastUpdated || '',
    userId: raw.userId || '',
    username: raw.username || raw.firstname || 'Curator',
    firstname: raw.firstname,
    lastname: raw.lastname,
    image: extractBestImage(raw.image || raw.images),
    images: extractImages(raw.image || raw.images),
    songs,
    url: raw.url,
    explicitContent: Boolean(raw.explicitContent)
  };
}
