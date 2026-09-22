import { Song, ArtistMini, AudioUrl, AudioQualityKey } from '../../types/music';
import { decodeHtml, sanitizeAudioUrl } from '../../utils/formatters';
import { getSafeImageUrl } from '../../utils/image';
import { isValidAudioStream } from '../normalizers';
import { GaanaRawTrack } from './gaanaTypes';

/**
 * Convert string duration (e.g. "4:21", "03:45", "1:15:30") or seconds to number
 */
export function parseGaanaDuration(durationStr?: string | number): number {
  if (typeof durationStr === 'number' && !isNaN(durationStr)) {
    return Math.max(0, Math.floor(durationStr));
  }
  if (!durationStr || typeof durationStr !== 'string') {
    return 0;
  }
  const parts = durationStr.trim().split(':').map(p => parseInt(p, 10));
  if (parts.some(isNaN)) return 0;

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 1) {
    return parts[0];
  }
  return 0;
}

/**
 * Generate a clean alphanumeric slug
 */
function toSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 50);
}

/**
 * Dedicated normalizer for Gaana Track Model into the Unified AwnishX Song Model
 */
export function normalizeGaanaSong(raw: GaanaRawTrack, preferredQuality: AudioQualityKey = '320kbps'): Song | null {
  if (!raw || typeof raw !== 'object') return null;

  const rawTitle = (raw.title || '').trim();
  if (!rawTitle) return null;

  const title = decodeHtml(rawTitle);
  const artistStr = decodeHtml((raw.artists || 'Unknown Artist').trim());
  const albumStr = decodeHtml((raw.album || '').trim());

  // Parse artists string into individual ArtistMini objects
  const artistNames = artistStr
    .split(',')
    .map(n => n.trim())
    .filter(Boolean);

  const artists: ArtistMini[] = artistNames.map(name => ({
    id: `gaana_art_${toSlug(name)}`,
    name,
    role: 'Singer'
  }));

  // Parse thumbnail images
  const largeImg = raw.thumbnail?.large || '';
  const mediumImg = raw.thumbnail?.medium || '';
  const smallImg = raw.thumbnail?.small || '';

  const fallbackTitle = title || 'Gaana Track';
  const bestImage = getSafeImageUrl(largeImg || mediumImg || smallImg, fallbackTitle, 'song');

  const images = [
    { quality: 'large', url: largeImg || bestImage },
    { quality: 'medium', url: mediumImg || bestImage },
    { quality: 'small', url: smallImg || bestImage }
  ].filter(img => Boolean(img.url));

  // Extract playable streams from music object
  const audioUrls: AudioUrl[] = [];
  if (raw.music) {
    if (raw.music.very_high && isValidAudioStream(raw.music.very_high)) {
      audioUrls.push({ quality: '320kbps', url: sanitizeAudioUrl(raw.music.very_high) });
    }
    if (raw.music.high && isValidAudioStream(raw.music.high)) {
      audioUrls.push({ quality: '160kbps', url: sanitizeAudioUrl(raw.music.high) });
    }
    if (raw.music.medium && isValidAudioStream(raw.music.medium)) {
      audioUrls.push({ quality: '96kbps', url: sanitizeAudioUrl(raw.music.medium) });
    }
    if (raw.music.low && isValidAudioStream(raw.music.low)) {
      audioUrls.push({ quality: '48kbps', url: sanitizeAudioUrl(raw.music.low) });
    }
  }

  // Select best playable URL based on preference
  let playableUrl = '';
  if (audioUrls.length > 0) {
    const matched = audioUrls.find(a => a.quality?.toLowerCase() === preferredQuality.toLowerCase());
    playableUrl = matched?.url || audioUrls[0]?.url || '';
  }

  // Generate unique stable ID
  const seokey = (raw.seokey || '').trim();
  const slugId = seokey || `${toSlug(title)}_${toSlug(albumStr || artistStr)}`;
  const id = `gaana_${slugId}`;

  const durationSec = parseGaanaDuration(raw.duration);

  return {
    id,
    title,
    subtitle: albumStr || artistStr,
    artist: artistStr,
    artists: artists.length > 0 ? artists : [{ id: `gaana_art_${toSlug(artistStr)}`, name: artistStr }],
    album: albumStr ? {
      id: `gaana_alb_${toSlug(albumStr)}`,
      name: albumStr
    } : undefined,
    image: bestImage,
    images,
    duration: durationSec,
    language: raw.language || 'Hindi',
    audioUrls,
    playableUrl,
    source: 'gaana' as any,
    provider: 'gaana',
    rawId: seokey || slugId,
    seokey: seokey || undefined
  };
}
