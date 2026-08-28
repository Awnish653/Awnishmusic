import { Song, AudioQualityKey } from '../types/music';

export interface DownloadProgress {
  songId: string;
  status: 'idle' | 'preparing' | 'downloading' | 'completed' | 'error';
  progress: number;
  message?: string;
}

/**
 * Format clean filename safe for Windows/Mac/Linux/Android
 */
export function generateSafeAudioFilename(song: Song, quality: string = '320kbps'): string {
  const artist = (song.artist || 'AwnishX Artist')
    .split(',')[0]
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .trim();

  const title = (song.title || 'Track')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .trim();

  const q = quality.toLowerCase().replace(/[^a-z0-9]/g, '');

  return `${artist} - ${title} (${q}).mp3`;
}

/**
 * Perform real file download
 */
export async function downloadSongFile(
  song: Song,
  targetQuality: AudioQualityKey = '320kbps',
  onProgress?: (p: DownloadProgress) => void
): Promise<boolean> {
  if (!song) return false;

  // Find best matching stream URL
  let streamUrl = '';
  if (song.audioUrls && song.audioUrls.length > 0) {
    const match = song.audioUrls.find(a => a.quality?.toLowerCase() === targetQuality.toLowerCase());
    streamUrl = match?.url || song.playableUrl || song.audioUrls[0]?.url || '';
  } else {
    streamUrl = song.playableUrl || '';
  }

  if (!streamUrl) {
    onProgress?.({
      songId: song.id,
      status: 'error',
      progress: 0,
      message: 'No playable audio stream available for this track.'
    });
    return false;
  }

  const filename = generateSafeAudioFilename(song, targetQuality);

  onProgress?.({
    songId: song.id,
    status: 'downloading',
    progress: 20,
    message: `Fetching ${targetQuality} audio stream...`
  });

  try {
    const response = await fetch(streamUrl, {
      method: 'GET',
      headers: {
        'Accept': 'audio/*, application/octet-stream'
      }
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    onProgress?.({
      songId: song.id,
      status: 'downloading',
      progress: 60,
      message: 'Creating lossless audio package...'
    });

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    }, 2000);

    onProgress?.({
      songId: song.id,
      status: 'completed',
      progress: 100,
      message: `Downloaded: ${filename}`
    });

    return true;
  } catch (err) {
    console.warn('Direct blob download failed, trying fallback direct anchor trigger:', err);

    // Fallback: Direct Anchor Trigger
    try {
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = streamUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        if (document.body.contains(a)) {
          document.body.removeChild(a);
        }
      }, 1500);

      onProgress?.({
        songId: song.id,
        status: 'completed',
        progress: 100,
        message: `Download started in browser for ${filename}`
      });

      return true;
    } catch (fallbackErr) {
      console.error('All download mechanisms failed:', fallbackErr);
      onProgress?.({
        songId: song.id,
        status: 'error',
        progress: 0,
        message: 'Could not download track. Check browser permissions.'
      });
      return false;
    }
  }
}
