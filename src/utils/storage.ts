import { Song, UserPlaylist, AudioQualityKey } from '../types/music';

const STORAGE_KEYS = {
  LIKED_SONGS: 'awnish_liked_songs_v1',
  RECENT_PLAYED: 'awnish_recently_played_v1',
  USER_PLAYLISTS: 'awnish_custom_playlists_v1',
  AUDIO_QUALITY: 'awnish_audio_quality_v1',
  VOLUME: 'awnish_volume_v1',
  MUTED: 'awnish_muted_v1',
  RECENT_SEARCHES: 'awnish_recent_searches_v1',
  FOLLOWED_ARTISTS: 'awnish_followed_artists_v1'
};

export const storage = {
  getLikedSongs(): Song[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LIKED_SONGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveLikedSongs(songs: Song[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.LIKED_SONGS, JSON.stringify(songs));
    } catch (e) {
      console.warn('Failed to save liked songs:', e);
    }
  },

  toggleLikeSong(song: Song): { isLiked: boolean; list: Song[] } {
    const list = this.getLikedSongs();
    const index = list.findIndex(s => s.id === song.id);
    let updated: Song[];
    let isLiked = false;

    if (index >= 0) {
      updated = list.filter(s => s.id !== song.id);
      isLiked = false;
    } else {
      updated = [song, ...list];
      isLiked = true;
    }
    this.saveLikedSongs(updated);
    return { isLiked, list: updated };
  },

  isSongLiked(songId: string): boolean {
    const list = this.getLikedSongs();
    return list.some(s => s.id === songId);
  },

  getRecentlyPlayed(): Song[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECENT_PLAYED);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addRecentlyPlayed(song: Song): Song[] {
    if (!song || !song.id) return this.getRecentlyPlayed();
    const list = this.getRecentlyPlayed();
    // Remove existing entry of this song if already in history, then prepend
    const filtered = list.filter(s => s.id !== song.id);
    const updated = [song, ...filtered].slice(0, 50); // Keep max 50 items
    try {
      localStorage.setItem(STORAGE_KEYS.RECENT_PLAYED, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save recent track:', e);
    }
    return updated;
  },

  getUserPlaylists(): UserPlaylist[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PLAYLISTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveUserPlaylists(playlists: UserPlaylist[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PLAYLISTS, JSON.stringify(playlists));
    } catch (e) {
      console.warn('Failed to save custom playlists:', e);
    }
  },

  createPlaylist(name: string, description?: string): UserPlaylist {
    const list = this.getUserPlaylists();
    const newPlaylist: UserPlaylist = {
      id: 'custom_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: name.trim() || 'My Playlist',
      description: description?.trim() || '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      songs: []
    };
    const updated = [newPlaylist, ...list];
    this.saveUserPlaylists(updated);
    return newPlaylist;
  },

  renamePlaylist(id: string, newName: string): boolean {
    const list = this.getUserPlaylists();
    const target = list.find(p => p.id === id);
    if (!target) return false;
    target.name = newName.trim() || target.name;
    target.updatedAt = Date.now();
    this.saveUserPlaylists(list);
    return true;
  },

  deletePlaylist(id: string): boolean {
    const list = this.getUserPlaylists();
    const updated = list.filter(p => p.id !== id);
    this.saveUserPlaylists(updated);
    return true;
  },

  addSongToPlaylist(playlistId: string, song: Song): boolean {
    const list = this.getUserPlaylists();
    const target = list.find(p => p.id === playlistId);
    if (!target) return false;
    if (target.songs.some(s => s.id === song.id)) {
      return true; // Already in playlist
    }
    target.songs.push(song);
    target.updatedAt = Date.now();
    if (!target.coverImage && song.image) {
      target.coverImage = song.image;
    }
    this.saveUserPlaylists(list);
    return true;
  },

  removeSongFromPlaylist(playlistId: string, songId: string): boolean {
    const list = this.getUserPlaylists();
    const target = list.find(p => p.id === playlistId);
    if (!target) return false;
    target.songs = target.songs.filter(s => s.id !== songId);
    target.updatedAt = Date.now();
    if (target.songs.length > 0) {
      target.coverImage = target.songs[0].image;
    } else {
      target.coverImage = undefined;
    }
    this.saveUserPlaylists(list);
    return true;
  },

  getRecentSearches(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
      return data ? JSON.parse(data) : ['Arijit Singh', 'Bollywood Hits', 'Sidhu Moose Wala', 'Chill Lo-Fi', 'Anuv Jain'];
    } catch {
      return ['Arijit Singh', 'Bollywood Hits', 'Sidhu Moose Wala'];
    }
  },

  addRecentSearch(query: string) {
    if (!query || !query.trim()) return;
    const clean = query.trim();
    const list = this.getRecentSearches().filter(q => q.toLowerCase() !== clean.toLowerCase());
    const updated = [clean, ...list].slice(0, 10);
    try {
      localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(updated));
    } catch {}
  },

  clearRecentSearches() {
    try {
      localStorage.removeItem(STORAGE_KEYS.RECENT_SEARCHES);
    } catch {}
  },

  getAudioQuality(): AudioQualityKey {
    try {
      return (localStorage.getItem(STORAGE_KEYS.AUDIO_QUALITY) as AudioQualityKey) || '320kbps';
    } catch {
      return '320kbps';
    }
  },

  setAudioQuality(quality: AudioQualityKey) {
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIO_QUALITY, quality);
    } catch {}
  },

  getVolume(): number {
    try {
      const v = localStorage.getItem(STORAGE_KEYS.VOLUME);
      return v !== null ? parseFloat(v) : 0.85;
    } catch {
      return 0.85;
    }
  },

  setVolume(vol: number) {
    try {
      localStorage.setItem(STORAGE_KEYS.VOLUME, String(vol));
    } catch {}
  },

  getFollowedArtists(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FOLLOWED_ARTISTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  toggleFollowArtist(artistId: string): boolean {
    const list = this.getFollowedArtists();
    let isFollowed = false;
    let updated: string[];
    if (list.includes(artistId)) {
      updated = list.filter(id => id !== artistId);
      isFollowed = false;
    } else {
      updated = [...list, artistId];
      isFollowed = true;
    }
    try {
      localStorage.setItem(STORAGE_KEYS.FOLLOWED_ARTISTS, JSON.stringify(updated));
    } catch {}
    return isFollowed;
  }
};
