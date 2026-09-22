export interface GaanaMusicUrls {
  low?: string;
  medium?: string;
  high?: string;
  very_high?: string;
}

export interface GaanaThumbnails {
  small?: string;
  medium?: string;
  large?: string;
}

export interface GaanaRawTrack {
  title?: string;
  artists?: string;
  album?: string;
  duration?: string;
  language?: string;
  seokey?: string;
  music?: GaanaMusicUrls;
  thumbnail?: GaanaThumbnails;
}

export interface GaanaSearchResponse {
  count?: number;
  data?: GaanaRawTrack[];
  developer?: {
    github?: string;
    telegram?: string;
  };
  query?: string;
  status?: string;
  message?: string;
}

export interface GaanaTrackResponse {
  data?: GaanaRawTrack;
  developer?: {
    github?: string;
    telegram?: string;
  };
  status?: string;
  message?: string;
}

export interface GaanaPingResponse {
  developer?: {
    github?: string;
    telegram?: string;
  };
  message?: string;
  status?: string;
}
