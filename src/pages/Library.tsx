import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  PlusCircle,
  Clock,
  Music2,
  Trash2,
  Mic2,
  Sparkles,
  Sliders,
  Check,
  Disc3
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { usePlayer } from '../context/PlayerContext';
import { SongCard } from '../components/SongCard';
import { AudioQualityKey } from '../types/music';
import { ImageWithFallback } from '../utils/image';

export const Library: React.FC = () => {
  const navigate = useNavigate();
  const {
    likedSongs,
    userPlaylists,
    createPlaylist,
    recentlyPlayed,
    clearRecentlyPlayed,
    followedArtists
  } = useLibrary();

  const { audioQuality, setAudioQuality } = usePlayer();
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    const pl = createPlaylist(newPlaylistName.trim());
    setNewPlaylistName('');
    setShowCreateModal(false);
    navigate(`/playlist/custom/${pl.id}`);
  };

  const qualities: AudioQualityKey[] = ['320kbps', '160kbps', '96kbps', '48kbps', '12kbps'];

  return (
    <div className="p-4 sm:p-8 space-y-10 max-w-7xl mx-auto pb-32 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">Your Library</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Manage your liked tracks, playlists, history, and audio streaming preferences.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Playlist</span>
        </button>
      </div>

      {/* Top Grid: Liked Songs & Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Liked Songs Hero Card */}
        <div
          onClick={() => navigate('/liked')}
          className="relative p-6 rounded-3xl bg-gradient-to-br from-rose-900/60 via-purple-900/40 to-zinc-900 border border-white/10 hover:border-rose-500/40 shadow-xl cursor-pointer group transition duration-300"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="w-12 h-12 rounded-2xl bg-rose-600/30 flex items-center justify-center text-rose-400 group-hover:scale-110 transition">
              <Heart className="w-6 h-6 fill-rose-400" />
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-black/40 text-rose-300 border border-rose-500/20 font-bold">
              {likedSongs.length} Songs
            </span>
          </div>

          <h2 className="text-xl font-black text-white group-hover:text-rose-300 transition">
            Liked Songs
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            All your heart-marked tracks in one convenient playlist.
          </p>
        </div>

        {/* Audio Quality Settings Card */}
        <div className="p-6 rounded-3xl bg-zinc-900/60 border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-indigo-950 flex items-center justify-center text-indigo-400">
              <Sliders className="w-6 h-6" />
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-500/20 font-mono font-bold">
              {audioQuality}
            </span>
          </div>

          <div>
            <h2 className="text-base font-bold text-white">Streaming Bitrate</h2>
            <p className="text-xs text-zinc-400 mt-0.5">High definition audio fidelity.</p>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {qualities.map(q => (
              <button
                key={q}
                onClick={() => setAudioQuality(q)}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition ${
                  audioQuality === q
                    ? 'bg-indigo-600 text-white font-bold shadow'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Playlists Summary Card */}
        <div
          onClick={() => setShowCreateModal(true)}
          className="p-6 rounded-3xl bg-zinc-900/40 hover:bg-zinc-900/70 border border-dashed border-white/20 hover:border-indigo-500/50 shadow-xl cursor-pointer group flex flex-col justify-between transition"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white group-hover:text-indigo-400 transition">
              Create New Playlist
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Curate your personal mixes and party playlists.
            </p>
          </div>
        </div>
      </div>

      {/* User Playlists Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music2 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-black text-white tracking-tight">Your Playlists</h2>
          </div>
          <span className="text-xs text-zinc-500">{userPlaylists.length} playlists</span>
        </div>

        {userPlaylists.length === 0 ? (
          <div className="p-8 rounded-2xl bg-zinc-900/20 border border-white/5 text-center text-xs text-zinc-500">
            You haven't created any playlists yet. Tap "New Playlist" above to start.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {userPlaylists.map(pl => (
              <div
                key={pl.id}
                onClick={() => navigate(`/playlist/custom/${pl.id}`)}
                className="group p-3 rounded-2xl bg-zinc-900/40 hover:bg-zinc-900 border border-white/5 hover:border-indigo-500/30 transition cursor-pointer flex flex-col space-y-3"
              >
                <div className="w-full aspect-square rounded-xl bg-gradient-to-tr from-indigo-900 to-violet-900 flex items-center justify-center text-white overflow-hidden shadow-md">
                  {pl.image ? (
                    <ImageWithFallback
                      src={pl.image}
                      alt={pl.name}
                      fallbackTitle={pl.name}
                      type="playlist"
                      containerClassName="w-full h-full"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Music2 className="w-10 h-10 text-white/60" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-white truncate group-hover:text-indigo-400">
                    {pl.name}
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{pl.songs.length} songs</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recently Played History */}
      {recentlyPlayed.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-black text-white tracking-tight">Listening History</h2>
            </div>
            <button
              onClick={clearRecentlyPlayed}
              className="text-xs text-zinc-500 hover:text-rose-400 flex items-center gap-1 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear History
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recentlyPlayed.slice(0, 12).map(song => (
              <SongCard key={song.id} song={song} queueContext={recentlyPlayed} />
            ))}
          </div>
        </section>
      )}

      {/* Followed Artists Section */}
      {followedArtists.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Mic2 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-black text-white tracking-tight">Followed Artists</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {followedArtists.map(artistId => (
              <button
                key={artistId}
                onClick={() => navigate(`/artist/${artistId}`)}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs text-white transition flex items-center gap-2"
              >
                <Mic2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Artist Profile</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Modal for Creating Playlist */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-sm p-6 rounded-3xl bg-zinc-900 border border-white/10 shadow-2xl space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-white">Create New Playlist</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                type="text"
                value={newPlaylistName}
                onChange={e => setNewPlaylistName(e.target.value)}
                placeholder="Playlist name"
                className="w-full px-4 py-3 bg-zinc-950 border border-white/10 focus:border-indigo-500 rounded-xl text-sm text-white placeholder-zinc-500 outline-none"
                autoFocus
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs hover:bg-zinc-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newPlaylistName.trim()}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow transition"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
