export type AudioQualityKey = '12kbps' | '48kbps' | '96kbps' | '160kbps' | '320kbps';

export interface AudioUrl {
  quality?: string;
  url: string;
}

export interface ImageObject {
  quality?: string;
  url: string;
}

export interface ArtistMini {
  id: string;
  name: string;
  role?: string;
  type?: string;
  image?: string | ImageObject[];
  url?: string;
}

export interface Song {
  id: string;
  title: string;
  subtitle?: string;
  artist: string;
  artists: ArtistMini[];
  album?: {
    id?: string;
    name?: string;
    url?: string;
  };
  image: string;
  images?: ImageObject[];
  duration?: number; // duration in seconds
  releaseDate?: string;
  year?: string | number;
  language?: string;
  playCount?: string | number;
  hasLyrics?: boolean;
  audioUrls: AudioUrl[];
  playableUrl: string;
  url?: string;
}

export interface Album {
  id: string;
  name: string;
  title?: string;
  description?: string;
  year?: string | number;
  type?: string;
  language?: string;
  songCount?: number;
  artists?: {
    primary?: ArtistMini[];
    featured?: ArtistMini[];
    all?: ArtistMini[];
  };
  artist?: string;
  image: string;
  images?: ImageObject[];
  songs?: Song[];
  url?: string;
  explicitContent?: boolean;
}

export interface Artist {
  id: string;
  name: string;
  image: string;
  images?: ImageObject[];
  role?: string;
  followerCount?: string | number;
  fanCount?: string | number;
  isVerified?: boolean;
  dominantLanguage?: string;
  bio?: string;
  topSongs?: Song[];
  topAlbums?: Album[];
  singles?: Album[];
  similarArtists?: ArtistMini[];
  url?: string;
}

export interface Playlist {
  id: string;
  name: string;
  title?: string;
  description?: string;
  year?: string | number;
  type?: string;
  language?: string;
  songCount?: number;
  followerCount?: string | number;
  lastUpdated?: string;
  userId?: string;
  username?: string;
  firstname?: string;
  lastname?: string;
  image: string;
  images?: ImageObject[];
  songs?: Song[];
  url?: string;
  explicitContent?: boolean;
}

export interface SearchResults {
  songs: Song[];
  albums: Album[];
  artists: Artist[];
  playlists: Playlist[];
  topQuery?: {
    results: any[];
    position: number;
  };
}

export interface UserPlaylist {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  songs: Song[];
  coverImage?: string;
}

export type RepeatMode = 'off' | 'all' | 'one';
