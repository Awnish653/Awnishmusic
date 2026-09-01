import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  PlusCircle,
  Clock,
  Music2,
  Trash2,
  Mic2,
  Sliders,
  Sparkles
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto pb-32">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white lg:text-gray-900 tracking-tight">Your Library</h1>
          <p className="text-xs sm:text-sm text-zinc-400 lg:text-gray-500 mt-0.5">
            Manage your liked tracks, playlists, history, and audio streaming preferences.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F4FF3B] lg:bg-[#1A1A1A] text-black lg:text-white font-bold text-xs shadow-md transition hover:opacity-90 active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Playlist</span>
        </button>
      </div>

      {/* Top Grid: Liked Songs & Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Liked Songs Hero Card */}
        <div
          onClick={() => navigate('/liked')}
          className="relative p-6 rounded-3xl bg-[#151920] lg:bg-white border border-white/10 lg:border-gray-200/80 shadow-sm cursor-pointer group transition hover:border-rose-500/40"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 group-hover:scale-110 transition">
              <Heart className="w-6 h-6 fill-rose-500" />
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20">
              {likedSongs.length} Songs
            </span>
          </div>

          <h2 className="text-lg font-bold text-white lg:text-gray-900 group-hover:text-rose-500 transition">
            Liked Songs
          </h2>
          <p className="text-xs text-zinc-400 lg:text-gray-500 mt-1">
            All your heart-marked tracks in one convenient playlist.
          </p>
        </div>

        {/* Audio Quality Settings Card */}
        <div className="p-6 rounded-3xl bg-[#151920] lg:bg-white border border-white/10 lg:border-gray-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-lime-400/10 flex items-center justify-center text-lime-400 lg:text-lime-700">
              <Sliders className="w-6 h-6" />
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-lime-400/15 text-lime-400 lg:text-lime-800 font-mono font-bold">
              {audioQuality}
            </span>
          </div>

          <div>
            <h2 className="text-sm sm:text-base font-bold text-white lg:text-gray-900">Streaming Bitrate</h2>
            <p className="text-xs text-zinc-400 lg:text-gray-500 mt-0.5">High definition audio fidelity.</p>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {qualities.map(q => (
              <button
                key={q}
                onClick={() => setAudioQuality(q)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition ${
                  audioQuality === q
                    ? 'bg-[#F4FF3B] lg:bg-[#1A1A1A] text-black lg:text-white shadow-xs'
                    : 'bg-white/5 lg:bg-gray-100 text-zinc-400 lg:text-gray-600 hover:text-white lg:hover:text-black'
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
          className="p-6 rounded-3xl bg-[#151920]/60 lg:bg-white/60 hover:bg-[#151920] lg:hover:bg-white border border-dashed border-white/15 lg:border-gray-300 shadow-sm cursor-pointer group flex flex-col justify-between transition"
        >
          <div className="w-12 h-12 rounded-2xl bg-lime-400/10 flex items-center justify-center text-lime-400 lg:text-lime-700 group-hover:scale-110 transition">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white lg:text-gray-900 group-hover:text-lime-400 lg:group-hover:text-lime-600 transition">
              Create New Playlist
            </h2>
            <p className="text-xs text-zinc-400 lg:text-gray-500 mt-1">
              Curate your personal mixes and party playlists.
            </p>
          </div>
        </div>
      </div>

      {/* User Playlists Section */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music2 className="w-4 h-4 text-lime-400 lg:text-lime-600" />
            <h2 className="text-lg sm:text-xl font-bold text-white lg:text-gray-900 tracking-tight">Your Playlists</h2>
          </div>
          <span className="text-xs text-zinc-400 lg:text-gray-500">{userPlaylists.length} playlists</span>
        </div>

        {userPlaylists.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#151920] lg:bg-white border border-white/5 lg:border-gray-200 text-center text-xs text-zinc-500 lg:text-gray-400">
            You haven't created any playlists yet. Tap "New Playlist" above to start.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {userPlaylists.map(pl => (
              <div
                key={pl.id}
                onClick={() => navigate(`/playlist/custom/${pl.id}`)}
                className="group p-3 rounded-2xl bg-[#151920] lg:bg-white hover:bg-[#1B1F26] lg:hover:bg-gray-50 border border-white/5 lg:border-gray-200/80 transition cursor-pointer flex flex-col space-y-2.5 shadow-sm"
              >
                <div className="w-full aspect-square rounded-xl bg-zinc-800 lg:bg-gray-100 flex items-center justify-center text-white overflow-hidden shadow-xs">
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
                    <Music2 className="w-8 h-8 text-zinc-500 lg:text-gray-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-white lg:text-gray-900 truncate group-hover:text-lime-400 lg:group-hover:text-lime-600">
                    {pl.name}
                  </h3>
                  <p className="text-[11px] text-zinc-500 lg:text-gray-400 mt-0.5">{pl.songs.length} songs</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recently Played History */}
      {recentlyPlayed.length > 0 && (
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-lime-400 lg:text-lime-600" />
              <h2 className="text-lg sm:text-xl font-bold text-white lg:text-gray-900 tracking-tight">Listening History</h2>
            </div>
            <button
              onClick={clearRecentlyPlayed}
              className="text-xs text-zinc-500 lg:text-gray-400 hover:text-rose-500 flex items-center gap-1 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear History
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {recentlyPlayed.slice(0, 12).map(song => (
              <SongCard key={song.id} song={song} queueContext={recentlyPlayed} />
            ))}
          </div>
        </section>
      )}

      {/* Followed Artists Section */}
      {followedArtists.length > 0 && (
        <section className="space-y-3.5">
          <div className="flex items-center gap-2">
            <Mic2 className="w-4 h-4 text-lime-400 lg:text-lime-600" />
            <h2 className="text-lg sm:text-xl font-bold text-white lg:text-gray-900 tracking-tight">Followed Artists</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {followedArtists.map(artistId => (
              <button
                key={artistId}
                onClick={() => navigate(`/artist/${artistId}`)}
                className="px-4 py-2 rounded-xl bg-[#151920] lg:bg-white hover:bg-[#1B1F26] lg:hover:bg-gray-50 border border-white/5 lg:border-gray-200 text-xs font-semibold text-white lg:text-gray-900 transition flex items-center gap-2"
              >
                <Mic2 className="w-3.5 h-3.5 text-lime-400 lg:text-lime-600" />
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
            className="w-full max-w-sm p-6 rounded-3xl bg-[#151920] lg:bg-white border border-white/10 lg:border-gray-200 shadow-2xl space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-base sm:text-lg font-bold text-white lg:text-gray-900">Create New Playlist</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                type="text"
                value={newPlaylistName}
                onChange={e => setNewPlaylistName(e.target.value)}
                placeholder="Playlist name"
                className="w-full px-4 py-3 bg-[#0D1015] lg:bg-gray-50 border border-white/10 lg:border-gray-200 focus:border-[#F4FF3B] lg:focus:border-black rounded-xl text-sm text-white lg:text-gray-900 placeholder-zinc-500 lg:placeholder-gray-400 outline-none"
                autoFocus
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 lg:bg-gray-100 text-zinc-400 lg:text-gray-700 text-xs hover:bg-white/10 lg:hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newPlaylistName.trim()}
                  className="px-5 py-2 rounded-xl bg-[#F4FF3B] lg:bg-[#1A1A1A] hover:opacity-90 disabled:opacity-50 text-black lg:text-white text-xs font-bold shadow-xs transition"
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
