/**
 * Generate a dynamic high-res SVG data URL with stylish gradient & initials/music glyph
 */
export function generateFallbackCover(
  title: string = 'AwnishX',
  type: 'song' | 'artist' | 'album' | 'playlist' = 'song'
): string {
  const cleanTitle = (title || 'AwnishX').trim();
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

  const color1 = `hsl(${hue1}, 75%, 28%)`;
  const color2 = `hsl(${hue2}, 85%, 15%)`;
  const accent = `hsl(${(hue1 + 180) % 360}, 90%, 65%)`;

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
            ? `<circle cx="200" cy="170" r="70" stroke="${accent}" stroke-width="6" fill="none" opacity="0.6"/>
               <text x="200" y="195" font-family="system-ui, -apple-system, sans-serif" font-size="72" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="2">${initials}</text>`
            : `<circle cx="200" cy="180" r="90" stroke="#ffffff" stroke-width="4" stroke-opacity="0.25" fill="none"/>
               <circle cx="200" cy="180" r="40" stroke="${accent}" stroke-width="4" stroke-opacity="0.7" fill="none"/>
               <circle cx="200" cy="180" r="14" fill="#ffffff"/>
               <text x="200" y="325" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="800" fill="#ffffff" text-anchor="middle" opacity="0.9">${initials}</text>`
        }
      </g>
      
      <!-- Brand watermark tag -->
      <text x="20" y="380" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="#ffffff" opacity="0.5" letter-spacing="1">AWNISHX MUSIC</text>
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

