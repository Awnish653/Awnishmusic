import React, { createContext, useContext, useState, useEffect } from 'react';
import { Song, UserPlaylist } from '../types/music';
import { storage } from '../utils/storage';

interface LibraryContextType {
  likedSongs: Song[];
  recentlyPlayed: Song[];
  userPlaylists: UserPlaylist[];
  followedArtists: string[];
  isSongLiked: (songId: string) => boolean;
  toggleLike: (song: Song) => boolean;
  createPlaylist: (name: string, description?: string) => UserPlaylist;
  renamePlaylist: (id: string, newName: string) => void;
  deletePlaylist: (id: string) => void;
  addSongToPlaylist: (playlistId: string, song: Song) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;
  toggleFollowArtist: (artistId: string) => boolean;
  isArtistFollowed: (artistId: string) => boolean;
  activeSongForModal: Song | null;
  setActiveSongForModal: (song: Song | null) => void;
  refreshLibrary: () => void;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [likedSongs, setLikedSongs] = useState<Song[]>(() => storage.getLikedSongs());
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>(() => storage.getRecentlyPlayed());
  const [userPlaylists, setUserPlaylists] = useState<UserPlaylist[]>(() => storage.getUserPlaylists());
  const [followedArtists, setFollowedArtists] = useState<string[]>(() => storage.getFollowedArtists());
  const [activeSongForModal, setActiveSongForModal] = useState<Song | null>(null);

  const refreshLibrary = () => {
    setLikedSongs(storage.getLikedSongs());
    setRecentlyPlayed(storage.getRecentlyPlayed());
    setUserPlaylists(storage.getUserPlaylists());
    setFollowedArtists(storage.getFollowedArtists());
  };

  useEffect(() => {
    const handleStorageChange = () => {
      refreshLibrary();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const isSongLiked = (songId: string): boolean => {
    return likedSongs.some(s => s.id === songId);
  };

  const toggleLike = (song: Song): boolean => {
    const { isLiked, list } = storage.toggleLikeSong(song);
    setLikedSongs(list);
    return isLiked;
  };

  const createPlaylist = (name: string, description?: string): UserPlaylist => {
    const newPlaylist = storage.createPlaylist(name, description);
    setUserPlaylists(storage.getUserPlaylists());
    return newPlaylist;
  };

  const renamePlaylist = (id: string, newName: string) => {
    storage.renamePlaylist(id, newName);
    setUserPlaylists(storage.getUserPlaylists());
  };

  const deletePlaylist = (id: string) => {
    storage.deletePlaylist(id);
    setUserPlaylists(storage.getUserPlaylists());
  };

  const addSongToPlaylist = (playlistId: string, song: Song) => {
    storage.addSongToPlaylist(playlistId, song);
    setUserPlaylists(storage.getUserPlaylists());
  };

  const removeSongFromPlaylist = (playlistId: string, songId: string) => {
    storage.removeSongFromPlaylist(playlistId, songId);
    setUserPlaylists(storage.getUserPlaylists());
  };

  const toggleFollowArtist = (artistId: string): boolean => {
    const isFollowed = storage.toggleFollowArtist(artistId);
    setFollowedArtists(storage.getFollowedArtists());
    return isFollowed;
  };

  const isArtistFollowed = (artistId: string): boolean => {
    return followedArtists.includes(artistId);
  };

  return (
    <LibraryContext.Provider
      value={{
        likedSongs,
        recentlyPlayed,
        userPlaylists,
        followedArtists,
        isSongLiked,
        toggleLike,
        createPlaylist,
        renamePlaylist,
        deletePlaylist,
        addSongToPlaylist,
        removeSongFromPlaylist,
        toggleFollowArtist,
        isArtistFollowed,
        activeSongForModal,
        setActiveSongForModal,
        refreshLibrary
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};
