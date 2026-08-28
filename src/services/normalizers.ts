import { Song, Album, Artist, Playlist, AudioUrl, ImageObject, ArtistMini, AudioQualityKey } from '../types/music';
import { decodeHtml, sanitizeAudioUrl } from '../utils/formatters';
import { getSafeImageUrl, generateFallbackCover } from '../utils/image';

/**
 * Extract the highest resolution image from image array or string with full fallback
 */
export function extractBestImage(rawImage: any, fallbackTitle: string = 'AwnishX', type: 'song' | 'artist' | 'album' | 'playlist' = 'song'): string {
  return getSafeImageUrl(rawImage, fallbackTitle, type);
}

/**
 * Extract normalized images array
 */
export function extractImages(rawImage: any): ImageObject[] {
  if (Array.isArray(rawImage)) {
    return rawImage.map(img => ({
      quality: img?.quality || '',
      url: typeof img === 'string' ? img : img?.url || img?.link || ''
    }));
  }
  if (typeof rawImage === 'string') {
    return [{ quality: 'default', url: rawImage }];
  }
  return [];
}

/**
 * Helper to check if a URL is a valid audio stream URL
 */
export function isValidAudioStream(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const clean = sanitizeAudioUrl(url);
  if (!clean || clean.length < 12) return false;
  // Discard JioSaavn website page links
  if (
    clean.includes('jiosaavn.com/song/') ||
    clean.includes('jiosaavn.com/album/') ||
    clean.includes('jiosaavn.com/featured/') ||
    clean.includes('jiosaavn.com/artist/')
  ) {
    return false;
  }
  return clean.startsWith('http://') || clean.startsWith('https://');
}

/**
 * Extract audio URLs and select best playable URL
 */
export function extractAudioUrls(rawDownload: any, preferredQuality: AudioQualityKey = '320kbps'): { audioUrls: AudioUrl[]; playableUrl: string } {
  let audioUrls: AudioUrl[] = [];

  if (Array.isArray(rawDownload)) {
    audioUrls = rawDownload
      .map(item => {
        const url = sanitizeAudioUrl(item?.url || item?.link || (typeof item === 'string' ? item : ''));
        return {
          quality: String(item?.quality || item?.bitrate || 'default'),
          url
        };
      })
      .filter(item => isValidAudioStream(item.url));
  } else if (typeof rawDownload === 'string') {
    const clean = sanitizeAudioUrl(rawDownload);
    if (isValidAudioStream(clean)) {
      audioUrls = [{ quality: 'default', url: clean }];
    }
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
      const fallback48 = audioUrls.find(a => a.quality?.includes('48'));
      playableUrl = fallback320?.url || fallback160?.url || fallback96?.url || fallback48?.url || audioUrls[audioUrls.length - 1]?.url || '';
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
      image: generateFallbackCover('Track', 'song'),
      audioUrls: [],
      playableUrl: ''
    };
  }

  const { artists, artistString } = normalizeArtists(
    raw.artists || raw.more_info?.artistMap?.artists || raw.more_info?.music,
    raw.primaryArtists || raw.singers || raw.artist || raw.more_info?.singers
  );

  const { audioUrls, playableUrl } = extractAudioUrls(
    raw.downloadUrl || raw.downloadUrls || raw.media_urls || raw.more_info?.encrypted_media_url || raw.media_preview_url || raw.stream_url,
    preferredQuality
  );

  const albumName = decodeHtml(
    typeof raw.album === 'object' ? raw.album?.name || raw.album?.title : raw.album || raw.more_info?.album || ''
  );

  const albumId = typeof raw.album === 'object' ? raw.album?.id : raw.albumId || raw.more_info?.album_id || '';

  const title = decodeHtml(raw.name || raw.title || raw.song || 'Unknown Song');

  return {
    id: String(raw.id || raw.songId || ''),
    title,
    subtitle: decodeHtml(raw.subtitle || raw.description || ''),
    artist: artistString,
    artists,
    album: {
      id: albumId,
      name: albumName,
      url: typeof raw.album === 'object' ? raw.album?.url : undefined
    },
    image: extractBestImage(raw.image || raw.images, title, 'song'),
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
    return { id: '', name: 'Unknown Album', image: extractBestImage(null, 'Unknown Album', 'album') };
  }

  const albumName = decodeHtml(raw.name || raw.title || 'Unknown Album');
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
    name: albumName,
    title: albumName,
    description: decodeHtml(raw.description || ''),
    year: raw.year || '',
    type: raw.type || 'album',
    language: raw.language || '',
    songCount: raw.songCount || songs.length || (raw.songs ? raw.songs.length : 0),
    artist: artistName || 'Various Artists',
    image: extractBestImage(raw.image || raw.images, albumName, 'album'),
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
    return { id: '', name: 'Unknown Artist', image: extractBestImage(null, 'Unknown Artist', 'artist') };
  }

  const artistName = decodeHtml(raw.name || raw.title || 'Unknown Artist');
  const topSongs: Song[] = Array.isArray(raw.topSongs) ? raw.topSongs.map((s: any) => normalizeSong(s)) : [];
  const topAlbums: Album[] = Array.isArray(raw.topAlbums) ? raw.topAlbums.map((a: any) => normalizeAlbum(a)) : [];
  const singles: Album[] = Array.isArray(raw.singles) ? raw.singles.map((a: any) => normalizeAlbum(a)) : [];
  
  const similarArtists: ArtistMini[] = Array.isArray(raw.similarArtists) 
    ? raw.similarArtists.map((a: any) => ({
        id: a.id || a.name || '',
        name: decodeHtml(a.name || 'Artist'),
        image: extractBestImage(a.image, decodeHtml(a.name || 'Artist'), 'artist'),
        url: a.url
      }))
    : [];

  return {
    id: String(raw.id || ''),
    name: artistName,
    image: extractBestImage(raw.image || raw.images, artistName, 'artist'),
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
    return { id: '', name: 'Unknown Playlist', image: extractBestImage(null, 'Unknown Playlist', 'playlist') };
  }

  const playlistName = decodeHtml(raw.name || raw.title || 'Unknown Playlist');
  const songs: Song[] = Array.isArray(raw.songs) ? raw.songs.map((s: any) => normalizeSong(s)) : [];

  return {
    id: String(raw.id || ''),
    name: playlistName,
    title: playlistName,
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
    image: extractBestImage(raw.image || raw.images, playlistName, 'playlist'),
    images: extractImages(raw.image || raw.images),
    songs,
    url: raw.url,
    explicitContent: Boolean(raw.explicitContent)
  };
}
