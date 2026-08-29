import { Song, Album, Artist, Playlist } from '../types/music';

/**
 * Normalize string for intelligent fuzzy deduplication comparison
 */
export function normalizeKey(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&amp;/g, '&')
    .replace(/[&+/]/g, ' and ')
    .replace(/feat\.|ft\.|featuring/gi, ' feat ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * List of special version markers to protect unique track variants
 */
const VERSION_TAGS = [
  'remix',
  'mix',
  'live',
  'cover',
  'acoustic',
  'lofi',
  'lo fi',
  'slowed',
  'reverb',
  'instrumental',
  'reprise',
  'unplugged',
  'mashup',
  'extended',
  'radio edit',
  'club mix',
  'sped up',
  'speed up',
  'orchestral',
  'dj',
  'dub',
  'karaoke',
  'tribute',
  'session',
  'edit'
];

/**
 * Detect version modifiers inside a string
 */
function extractVersionTags(str: string): string[] {
  const lower = str.toLowerCase();
  return VERSION_TAGS.filter(tag => lower.includes(tag));
}

/**
 * Extract clean base title without parenthesized text for comparison
 */
function cleanBaseTitle(title: string): string {
  return normalizeKey(title.replace(/\([^)]*\)|\[[^\]]*\]/g, ' '));
}

/**
 * Check if two songs are identical duplicate tracks
 */
export function isDuplicateSong(a: Song, b: Song): boolean {
  if (!a || !b) return false;
  if (a.id === b.id) return true;

  const rawTitleA = a.title || '';
  const rawTitleB = b.title || '';

  // Check version tags: if one is Remix / Live / Cover and the other isn't, they are different!
  const tagsA = extractVersionTags(rawTitleA);
  const tagsB = extractVersionTags(rawTitleB);

  if (tagsA.length !== tagsB.length) return false;
  if (tagsA.some(t => !tagsB.includes(t))) return false;

  const normTitleA = cleanBaseTitle(rawTitleA);
  const normTitleB = cleanBaseTitle(rawTitleB);

  if (!normTitleA || !normTitleB) return false;
  if (normTitleA !== normTitleB) {
    // If not exact base match, check if one starts with the other with high overlap
    const lenA = normTitleA.length;
    const lenB = normTitleB.length;
    const minLen = Math.min(lenA, lenB);
    if (minLen < 4) return false;
    if (!(normTitleA.includes(normTitleB) || normTitleB.includes(normTitleA))) {
      return false;
    }
  }

  // Compare artists
  const normArtA = normalizeKey(a.artist || a.artists?.[0]?.name || '');
  const normArtB = normalizeKey(b.artist || b.artists?.[0]?.name || '');

  if (!normArtA || !normArtB) return true;

  const firstArtA = normArtA.split(' ')[0];
  const firstArtB = normArtB.split(' ')[0];

  if (normArtA === normArtB) return true;
  if (firstArtA && firstArtB && firstArtA.length > 2 && firstArtA === firstArtB) return true;
  if (normArtA.includes(firstArtB) || normArtB.includes(firstArtA)) return true;

  return false;
}

/**
 * Interleave and merge two lists of songs while removing genuine duplicates
 */
export function mergeSongLists(primary: Song[], secondary: Song[]): Song[] {
  const merged: Song[] = [];
  const seen: Song[] = [];

  const maxLen = Math.max(primary.length, secondary.length);

  for (let i = 0; i < maxLen; i++) {
    if (i < primary.length) {
      const songA = primary[i];
      if (songA && !seen.some(s => isDuplicateSong(s, songA))) {
        seen.push(songA);
        merged.push(songA);
      }
    }

    if (i < secondary.length) {
      const songB = secondary[i];
      if (songB && !seen.some(s => isDuplicateSong(s, songB))) {
        seen.push(songB);
        merged.push(songB);
      }
    }
  }

  return merged;
}

/**
 * Merge two album lists removing duplicate albums
 */
export function mergeAlbumLists(primary: Album[], secondary: Album[]): Album[] {
  const merged: Album[] = [];
  const seenKeys = new Set<string>();

  const checkAndAdd = (album: Album) => {
    if (!album) return;
    const key = `${normalizeKey(album.name)}_${normalizeKey(album.artist || '')}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      merged.push(album);
    }
  };

  const maxLen = Math.max(primary.length, secondary.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < primary.length) checkAndAdd(primary[i]);
    if (i < secondary.length) checkAndAdd(secondary[i]);
  }

  return merged;
}

/**
 * Merge two artist lists removing duplicates
 */
export function mergeArtistLists(primary: Artist[], secondary: Artist[]): Artist[] {
  const merged: Artist[] = [];
  const seenKeys = new Set<string>();

  const checkAndAdd = (artist: Artist) => {
    if (!artist) return;
    const key = normalizeKey(artist.name);
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      merged.push(artist);
    }
  };

  const maxLen = Math.max(primary.length, secondary.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < primary.length) checkAndAdd(primary[i]);
    if (i < secondary.length) checkAndAdd(secondary[i]);
  }

  return merged;
}

/**
 * Merge two playlist lists removing duplicates
 */
export function mergePlaylistLists(primary: Playlist[], secondary: Playlist[]): Playlist[] {
  const merged: Playlist[] = [];
  const seenKeys = new Set<string>();

  const checkAndAdd = (playlist: Playlist) => {
    if (!playlist) return;
    const key = normalizeKey(playlist.name);
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      merged.push(playlist);
    }
  };

  const maxLen = Math.max(primary.length, secondary.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < primary.length) checkAndAdd(primary[i]);
    if (i < secondary.length) checkAndAdd(secondary[i]);
  }

  return merged;
}
