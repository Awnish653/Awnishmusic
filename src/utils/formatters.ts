/**
 * Safely decodes HTML entities commonly returned by music APIs
 */
export function decodeHtml(html?: string): string {
  if (!html) return '';
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

/**
 * Format seconds into mm:ss or hh:mm:ss
 */
export function formatDuration(seconds?: number | string): string {
  if (seconds === undefined || seconds === null) return '0:00';
  const sec = typeof seconds === 'string' ? parseInt(seconds, 10) : Math.floor(seconds);
  if (isNaN(sec) || sec < 0) return '0:00';

  const hrs = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const remainingSecs = sec % 60;

  if (hrs > 0) {
    return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  }
  return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
}

/**
 * Format numbers into compact units (e.g. 1.5M, 420K)
 */
export function formatCount(count?: number | string): string {
  if (!count) return '0';
  const num = typeof count === 'string' ? parseInt(count.replace(/,/g, ''), 10) : count;
  if (isNaN(num)) return String(count);

  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toLocaleString();
}

/**
 * Clean audio URL by removing trailing unprintable control characters (\u0004 etc.)
 */
export function sanitizeAudioUrl(url?: string): string {
  if (!url) return '';
  // Strip control chars (0x00 to 0x1F and 0x7F to 0x9F) and trim
  return url.replace(/[\x00-\x1F\x7F-\x9F]+/g, '').trim();
}

/**
 * Get greeting based on current hour
 */
export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return 'Good Morning';
  } else if (hour >= 12 && hour < 17) {
    return 'Good Afternoon';
  } else if (hour >= 17 && hour < 22) {
    return 'Good Evening';
  } else {
    return 'Good Night';
  }
}
