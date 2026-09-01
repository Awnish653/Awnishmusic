const KNOWN_ARTIST_AVATARS: Record<string, string> = {
  'tyler, the creator': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
  'tyler the creator': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
  '21 savage': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
  '6ix9ine': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80',
  'travis scott': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80',
  'oxladaet': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=80',
  'the weeknd': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
  'drake': 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500&auto=format&fit=crop&q=80',
  'metro boomin': 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80',
  'kendrick lamar': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80',
  'billie eilish': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80',
  'oneheart': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80',
  'arijit singh': 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=500&auto=format&fit=crop&q=80',
  'ap dhillon': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
  'diljit dosanjh': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80',
  'anuv jain': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=80',
  'shubh': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80'
};

/**
 * Generate a dynamic high-res SVG data URL with stylish gradient & initials/music glyph
 */
export function generateFallbackCover(
  title: string = 'AwnishX',
  type: 'song' | 'artist' | 'album' | 'playlist' = 'song'
): string {
  const cleanTitle = (title || 'AwnishX').trim();
  const lowerKey = cleanTitle.toLowerCase();

  // If artist has a curated avatar match
  if (type === 'artist' && KNOWN_ARTIST_AVATARS[lowerKey]) {
    return KNOWN_ARTIST_AVATARS[lowerKey];
  }

  const initials = cleanTitle
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() || '')
    .join('') || 'AX';

  // Seed hue based on title characters for stable deterministic distinct colors
  let hash = 0;
  for (let i = 0; i < cleanTitle.length; i++) {
    hash = cleanTitle.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 65) % 360;

  const color1 = `hsl(${hue1}, 55%, 22%)`;
  const color2 = `hsl(${hue2}, 65%, 12%)`;
  const accent = `hsl(${(hue1 + 180) % 360}, 85%, 65%)`;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${color1}" />
          <stop offset="100%" stop-color="${color2}" />
        </linearGradient>
        <radialGradient id="r" cx="80%" cy="20%" r="60%">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.35" />
          <stop offset="100%" stop-color="${accent}" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="400" fill="url(#g)" />
      <circle cx="320" cy="80" r="140" fill="url(#r)" />
      
      <!-- Center Artistic Emblem -->
      <g opacity="0.85">
        ${
          type === 'artist'
            ? `<circle cx="200" cy="180" r="75" stroke="${accent}" stroke-width="4" fill="none" opacity="0.6"/>
               <text x="200" y="205" font-family="'Playfair Display', Georgia, serif" font-style="italic" font-size="64" font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="1">${initials}</text>`
            : `<circle cx="200" cy="180" r="90" stroke="#ffffff" stroke-width="3" stroke-opacity="0.2" fill="none"/>
               <circle cx="200" cy="180" r="40" stroke="${accent}" stroke-width="3" stroke-opacity="0.6" fill="none"/>
               <circle cx="200" cy="180" r="12" fill="#ffffff"/>
               <text x="200" y="325" font-family="'Playfair Display', Georgia, serif" font-style="italic" font-size="28" font-weight="700" fill="#ffffff" text-anchor="middle" opacity="0.9">${initials}</text>`
        }
      </g>
      
      <!-- Brand watermark tag -->
      <text x="20" y="380" font-family="'Playfair Display', Georgia, serif" font-style="italic" font-size="14" font-weight="600" fill="#ffffff" opacity="0.4" letter-spacing="1">MELOVIA</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Universal Image Extractor with deep structure support
 */
export function getSafeImageUrl(
  rawImage: any,
  fallbackTitle: string = 'AwnishX',
  type: 'song' | 'artist' | 'album' | 'playlist' = 'song'
): string {
  if (!rawImage) {
    const lowerKey = (fallbackTitle || '').trim().toLowerCase();
    if (type === 'artist' && KNOWN_ARTIST_AVATARS[lowerKey]) {
      return KNOWN_ARTIST_AVATARS[lowerKey];
    }
    return generateFallbackCover(fallbackTitle, type);
  }

  // If it's a simple non-empty string
  if (typeof rawImage === 'string') {
    const trimmed = rawImage.trim();
    if (
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('data:image/')
    ) {
      // Replace low-res JioSaavn 50x50 or 150x150 in URL with 500x500 if possible
      return trimmed.replace(/50x50\.jpg/gi, '500x500.jpg').replace(/150x150\.jpg/gi, '500x500.jpg');
    }
    const lowerKey = (fallbackTitle || '').trim().toLowerCase();
    if (type === 'artist' && KNOWN_ARTIST_AVATARS[lowerKey]) {
      return KNOWN_ARTIST_AVATARS[lowerKey];
    }
    return generateFallbackCover(fallbackTitle, type);
  }

  // If it's an array of image objects
  if (Array.isArray(rawImage) && rawImage.length > 0) {
    // Try to find the highest resolution
    const hq500 = rawImage.find(
      (img: any) =>
        img?.quality === '500x500' ||
        img?.quality === 'high' ||
        img?.quality === '320kbps' ||
        img?.link?.includes('500x500') ||
        img?.url?.includes('500x500')
    );

    const hq150 = rawImage.find(
      (img: any) =>
        img?.quality === '150x150' ||
        img?.quality === 'medium' ||
        img?.link?.includes('150x150') ||
        img?.url?.includes('150x150')
    );

    const last = rawImage[rawImage.length - 1];
    const candidate = hq500 || hq150 || last || rawImage[0];
    const url = candidate?.url || candidate?.link || (typeof candidate === 'string' ? candidate : '');

    if (url && typeof url === 'string') {
      return url.replace(/50x50\.jpg/gi, '500x500.jpg').replace(/150x150\.jpg/gi, '500x500.jpg');
    }
  }

  // If it's a single object { url: '...', link: '...' }
  if (typeof rawImage === 'object') {
    const url = rawImage.url || rawImage.link;
    if (url && typeof url === 'string') {
      return url.replace(/50x50\.jpg/gi, '500x500.jpg').replace(/150x150\.jpg/gi, '500x500.jpg');
    }
  }

  return generateFallbackCover(fallbackTitle, type);
}

// Re-export ImageWithFallback component from its .tsx file
export { ImageWithFallback } from '../components/ImageWithFallback';
export type { ImageWithFallbackProps } from '../components/ImageWithFallback';

