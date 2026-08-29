import { Song, Album, Artist, Playlist, ImageObject, AudioUrl, ArtistMini, AudioQualityKey } from '../types/music';
import { decodeHtml } from '../utils/formatters';
import { getSafeImageUrl } from '../utils/image';

const FLIP_BASE_URL = 'https://flip-musix.vercel.app';

/**
 * Extract best image for Flip Musix objects
 */
export function extractFlipImage(rawImage: any, fallbackTitle: string = 'AwnishX', type: 'song' | 'artist' | 'album' | 'playlist' = 'song'): string {
  if (typeof rawImage === 'string' && rawImage.trim().startsWith('http')) {
    return rawImage.trim();
  }
  if (rawImage && typeof rawImage === 'object') {
    const url = rawImage.original?.filename || rawImage.large || rawImage.medium || rawImage.small || rawImage.url || '';
    if (url && typeof url === 'string' && url.trim().startsWith('http')) {
      return url.trim();
    }
  }
  return getSafeImageUrl(rawImage, fallbackTitle, type);
}

/**
 * Extract normalized image array for Flip Musix
 */
export function extractFlipImages(raw: any): ImageObject[] {
  const images: ImageObject[] = [];
  if (raw?.images?.original?.filename) {
    images.push({ quality: 'high', url: raw.images.original.filename });
  }
  if (raw?.image && typeof raw.image === 'string') {
    images.push({ quality: 'default', url: raw.image });
  }
  if (raw?.image_base && typeof raw.image_base === 'string') {
    images.push({ quality: 'base', url: raw.image_base });
  }
  return images;
}

/**
 * Normalize single raw Song item from Flip Musix
 */
export function normalizeFlipSong(raw: any, _preferredQuality: AudioQualityKey = '320kbps'): Song {
  if (!raw) {
    return {
      id: '',
      title: 'Unknown Track',
      artist: 'Unknown Artist',
      artists: [],
      image: getSafeImageUrl(null, 'Track', 'song'),
      audioUrls: [],
      playableUrl: '',
      source: 'flip'
    };
  }

  const rawId = String(raw.id || raw.song_id || '');
  const id = `flip_${rawId}`;
  const title = decodeHtml(raw.title || raw.name || 'Unknown Song');
  const artistName = decodeHtml(raw.artist || raw.uploader?.name || 'Unknown Artist');
  const uploaderName = raw.uploader?.name ? decodeHtml(raw.uploader.name) : '';
  const featuring = raw.featuring ? decodeHtml(raw.featuring) : '';

  const artists: ArtistMini[] = [];
  if (raw.uploader?.id || raw.uploader?.name) {
    artists.push({
      id: `flip_art_${raw.uploader.id || raw.uploader.url_slug || raw.uploader.name}`,
      name: uploaderName || artistName,
      role: 'Uploader',
      image: extractFlipImage(raw.uploader.image || raw.uploader.image_base, uploaderName || artistName, 'artist'),
      url: raw.uploader.url_slug ? `/artist/flip_${raw.uploader.url_slug}` : undefined
    });
  }

  if (featuring && featuring !== artistName) {
    artists.push({
      id: `flip_feat_${featuring}`,
      name: featuring,
      role: 'Featured Artist'
    });
  }

  if (artists.length === 0) {
    artists.push({
      id: `flip_art_${artistName}`,
      name: artistName,
      role: 'Primary Artist'
    });
  }

  let durationSecs = 0;
  if (typeof raw.duration === 'number') {
    durationSecs = raw.duration;
  } else if (typeof raw.duration === 'string') {
    durationSecs = parseInt(raw.duration, 10) || 0;
  }

  let releaseYear = '';
  if (raw.released) {
    const d = new Date(Number(raw.released) * 1000);
    if (!isNaN(d.getFullYear())) releaseYear = String(d.getFullYear());
  } else if (raw.original_release_date) {
    const d = new Date(Number(raw.original_release_date) * 1000);
    if (!isNaN(d.getFullYear())) releaseYear = String(d.getFullYear());
  }

  const downloadEndpoint = `${FLIP_BASE_URL}/download/${rawId}`;
  const streamEndpoint = `${FLIP_BASE_URL}/stream/${rawId}`;

  const audioUrls: AudioUrl[] = [
    { quality: '320kbps', url: downloadEndpoint },
    { quality: '160kbps', url: downloadEndpoint },
    { quality: '96kbps', url: downloadEndpoint },
    { quality: '48kbps', url: downloadEndpoint }
  ];

  return {
    id,
    rawId,
    title,
    subtitle: raw.genre ? `Genre: ${raw.genre}` : (raw.tagdisplay || ''),
    artist: artistName,
    artists,
    album: raw.album ? {
      id: `flip_alb_${raw.album}`,
      name: decodeHtml(raw.album)
    } : undefined,
    image: extractFlipImage(raw.image || raw.images?.original?.filename || raw.image_base, title, 'song'),
    images: extractFlipImages(raw),
    duration: durationSecs,
    releaseDate: releaseYear,
    year: releaseYear,
    language: raw.genre || '',
    playCount: raw.stats?.plays || raw.stats?.['plays-raw'] || '',
    hasLyrics: false,
    audioUrls,
    playableUrl: downloadEndpoint,
    source: 'flip',
    streamEndpoint,
    downloadEndpoint,
    url: raw.links?.self || undefined
  };
}

/**
 * Normalize raw Album from Flip Musix
 */
export function normalizeFlipAlbum(raw: any): Album {
  if (!raw) {
    return {
      id: '',
      name: 'Unknown Album',
      image: getSafeImageUrl(null, 'Unknown Album', 'album'),
      source: 'flip'
    };
  }

  const rawId = String(raw.id || '');
  const id = `flip_${rawId}`;
  const name = decodeHtml(raw.title || raw.name || 'Unknown Album');
  const artistName = decodeHtml(raw.artist || raw.uploader?.name || 'Various Artists');

  const songs: Song[] = Array.isArray(raw.tracks)
    ? raw.tracks.map((t: any) => normalizeFlipSong(t))
    : [];

  let releaseYear = '';
  if (raw.released) {
    const d = new Date(Number(raw.released) * 1000);
    if (!isNaN(d.getFullYear())) releaseYear = String(d.getFullYear());
  }

  return {
    id,
    rawId,
    name,
    title: name,
    description: decodeHtml(raw.description || raw.tagdisplay || ''),
    year: releaseYear,
    type: 'album',
    language: raw.genre || '',
    songCount: songs.length || raw.track_count || raw.tracks_count || 0,
    artist: artistName,
    image: extractFlipImage(raw.image || raw.images?.original?.filename || raw.image_base, name, 'album'),
    images: extractFlipImages(raw),
    songs,
    source: 'flip',
    url: raw.links?.self || undefined,
    explicitContent: raw.explicit === 'yes'
  };
}

/**
 * Normalize raw Artist from Flip Musix
 */
export function normalizeFlipArtist(raw: any): Artist {
  if (!raw) {
    return {
      id: '',
      name: 'Unknown Artist',
      image: getSafeImageUrl(null, 'Unknown Artist', 'artist'),
      source: 'flip'
    };
  }

  const rawSlug = raw.url_slug || raw.id || '';
  const id = `flip_${rawSlug}`;
  const name = decodeHtml(raw.name || raw.title || 'Unknown Artist');

  const songs: Song[] = Array.isArray(raw.tracks || raw.songs)
    ? (raw.tracks || raw.songs).map((t: any) => normalizeFlipSong(t))
    : [];

  const albums: Album[] = Array.isArray(raw.albums)
    ? raw.albums.map((a: any) => normalizeFlipAlbum(a))
    : [];

  return {
    id,
    rawId: raw.id,
    name,
    image: extractFlipImage(raw.image || raw.images?.original?.filename || raw.image_base, name, 'artist'),
    images: extractFlipImages(raw),
    role: 'Artist',
    followerCount: raw.followers_count || raw.stats?.followers || raw.follow_count || '0',
    fanCount: raw.favorites_count || '0',
    isVerified: raw.verified === 'yes' || Boolean(raw.verified),
    dominantLanguage: raw.genre || '',
    bio: decodeHtml(raw.bio || ''),
    topSongs: songs,
    topAlbums: albums,
    singles: [],
    similarArtists: [],
    source: 'flip',
    url: raw.links?.self || undefined
  };
}

/**
 * Normalize raw Playlist from Flip Musix
 */
export function normalizeFlipPlaylist(raw: any): Playlist {
  if (!raw) {
    return {
      id: '',
      name: 'Unknown Playlist',
      image: getSafeImageUrl(null, 'Unknown Playlist', 'playlist'),
      source: 'flip'
    };
  }

  const rawId = String(raw.id || '');
  const id = `flip_${rawId}`;
  const name = decodeHtml(raw.title || raw.name || 'Curated Playlist');
  const uploaderName = decodeHtml(raw.uploader?.name || raw.artist || 'AwnishX Curator');

  const songs: Song[] = Array.isArray(raw.tracks)
    ? raw.tracks.map((t: any) => normalizeFlipSong(t))
    : [];

  return {
    id,
    rawId,
    name,
    title: name,
    description: decodeHtml(raw.description || ''),
    year: '',
    type: 'playlist',
    language: raw.genre || '',
    songCount: songs.length || raw.track_count || 0,
    followerCount: raw.stats?.favorites || '0',
    username: uploaderName,
    image: extractFlipImage(raw.image || raw.images?.original?.filename || raw.image_base, name, 'playlist'),
    images: extractFlipImages(raw),
    songs,
    source: 'flip',
    url: raw.links?.self || undefined
  };
}
