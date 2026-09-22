export interface YouTubeSearchItem {
  id: string;
  title: string;
  channel?: string;
  duration?: number;
  duration_string?: string | null;
  thumbnail?: string;
  url?: string;
}

export interface YouTubeSearchResponse {
  success?: boolean;
  query?: string;
  count?: number;
  results?: YouTubeSearchItem[];
  error?: string;
  detail?: string;
}

export interface YouTubeAudioResponse {
  id?: string;
  title?: string;
  artist?: string;
  duration?: number;
  thumbnail?: string;
  quality?: string;
  stream_url?: string;
  url?: string;
  detail?: string;
  error?: string;
  success?: boolean;
}

export interface YouTubeVideoResponse {
  id?: string;
  title?: string;
  channel?: string;
  duration?: number;
  thumbnail?: string;
  description?: string;
  url?: string;
  detail?: string;
  error?: string;
  success?: boolean;
}
