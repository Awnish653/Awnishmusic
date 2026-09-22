import { Song } from '../../types/music';
import { YouTubeSearchItem, YouTubeAudioResponse, YouTubeVideoResponse } from './youtubeTypes';

/**
 * Normalizes a YouTube search result item into the platform's standard Song model.
 * Important: playableUrl is intentionally left empty so stream resolution happens on demand when playing.
 */
export function normalizeYouTubeSong(item: YouTubeSearchItem): Song {
  const videoId = String(item.id || '').trim();
  const title = (item.title || 'Unknown Title').trim();
  const channel = (item.channel || 'YouTube Artist').trim();
  const duration = typeof item.duration === 'number' && !isNaN(item.duration) ? item.duration : 0;
  const thumbnail = item.thumbnail || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '');

  return {
    id: `yt_${videoId}`,
    rawId: videoId,
    videoId: videoId,
    title,
    subtitle: channel,
    artist: channel,
    artists: [
      {
        id: `yt_artist_${encodeURIComponent(channel)}`,
        name: channel,
        role: 'Artist'
      }
    ],
    album: {
      id: `yt_album_${videoId}`,
      name: 'YouTube Music'
    },
    image: thumbnail,
    duration,
    audioUrls: [],
    playableUrl: '', // Explicitly empty: resolved via /api/audio on play
    source: 'youtube',
    provider: 'youtube',
    url: item.url || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : undefined)
  };
}

/**
 * Merges stream details from /api/audio or /api/video into an existing Song or creates a new Song model.
 */
export function buildYouTubeSongWithAudio(
  videoId: string,
  audioData: YouTubeAudioResponse,
  existingSong?: Partial<Song>
): Song {
  const cleanId = videoId.replace(/^(yt_|youtube_)/, '');
  const title = audioData.title || existingSong?.title || 'YouTube Track';
  const artist = audioData.artist || existingSong?.artist || 'YouTube Artist';
  const duration = audioData.duration || existingSong?.duration || 0;
  const thumbnail = audioData.thumbnail || existingSong?.image || `https://i.ytimg.com/vi/${cleanId}/hqdefault.jpg`;
  const rawUrl = audioData.stream_url || audioData.url || '';
  const isDirectMedia = rawUrl && !rawUrl.includes('youtube.com/watch') && !rawUrl.includes('youtu.be/');
  const streamUrl = isDirectMedia ? rawUrl : '';

  return {
    id: `yt_${cleanId}`,
    rawId: cleanId,
    videoId: cleanId,
    title,
    subtitle: artist,
    artist,
    artists: [
      {
        id: `yt_artist_${encodeURIComponent(artist)}`,
        name: artist,
        role: 'Artist'
      }
    ],
    album: {
      id: `yt_album_${cleanId}`,
      name: 'YouTube Music'
    },
    image: thumbnail,
    duration,
    playableUrl: streamUrl,
    audioUrls: streamUrl ? [{ quality: audioData.quality || 'best', url: streamUrl }] : [],
    source: 'youtube',
    provider: 'youtube',
    url: `https://www.youtube.com/watch?v=${cleanId}`
  };
}
