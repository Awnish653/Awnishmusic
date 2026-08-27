import React, { useState } from 'react';
import { Heart, Play, Shuffle, Search, Trash2, Clock, Music2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { usePlayer } from '../context/PlayerContext';
import { SongRow } from '../components/SongRow';
import { EmptyState } from '../components/FeedbackStates';
import { formatDuration } from '../utils/formatters';

export const LikedSongs: React.FC = () => {
  const navigate = useNavigate();
  const { likedSongs, toggleLike } = useLibrary();
  const { playSong } = usePlayer();
  const [filterQuery, setFilterQuery] = useState('');

  const filteredSongs = likedSongs.filter(s =>
    s.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
    s.artist.toLowerCase().includes(filterQuery.toLowerCase()) ||
    (s.album?.name && s.album.name.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  const totalDurationSecs = likedSongs.reduce((acc, s) => acc + (s.duration || 0), 0);

  const handlePlayAll = () => {
    if (filteredSongs.length > 0) {
      playSong(filteredSongs[0], filteredSongs);
    }
  };

  const handleShuffle = () => {
    if (filteredSongs.length > 0) {
      const shuffled = [...filteredSongs].sort(() => Math.random() - 0.5);
      playSong(shuffled[0], shuffled);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto pb-32 animate-fade-in">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-end p-6 md:p-8 rounded-3xl bg-gradient-to-b from-rose-950/40 via-zinc-900/60 to-zinc-900/30 border border-white/10 shadow-2xl">
        <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl bg-gradient-to-tr from-rose-600 to-violet-600 flex items-center justify-center text-white shadow-2xl shrink-0">
          <Heart className="w-24 h-24 fill-white animate-pulse" style={{ animationDuration: '3s' }} />
        </div>

        <div className="flex flex-col space-y-3 text-center md:text-left flex-1 min-w-0">
          <span className="text-xs uppercase font-bold text-rose-400 tracking-wider">
            Your Collection
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Liked Songs
          </h1>
          <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-zinc-300">
            <span>{likedSongs.length} favorites</span>
            {totalDurationSecs > 0 && <span>• {formatDuration(totalDurationSecs)} total</span>}
          </div>

          <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
            <button
              onClick={handlePlayAll}
              disabled={likedSongs.length === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-rose-600 to-violet-600 hover:from-rose-500 hover:to-violet-500 text-white font-semibold text-sm shadow-xl shadow-rose-600/30 transition hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Play All</span>
            </button>

            <button
              onClick={handleShuffle}
              disabled={likedSongs.length === 0}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-zinc-800/90 hover:bg-zinc-700 text-white font-semibold text-sm border border-white/10 transition active:scale-95 disabled:opacity-50"
            >
              <Shuffle className="w-4 h-4" />
              <span>Shuffle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Content */}
      {likedSongs.length === 0 ? (
        <EmptyState
          title="No Liked Songs Yet"
          message="Tap the heart icon on any song, album, or search result to save it here for quick offline-ready access."
          icon={<Heart className="w-8 h-8 text-rose-400" />}
          action={
            <button
              onClick={() => navigate('/search')}
              className="px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow transition"
            >
              Discover Songs
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          {/* Quick Search Filter */}
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={filterQuery}
              onChange={e => setFilterQuery(e.target.value)}
              placeholder="Filter in Liked Songs..."
              className="w-full pl-9 pr-3 py-2 bg-zinc-900/60 border border-white/10 focus:border-rose-500/50 rounded-xl text-xs text-white placeholder-zinc-500 outline-none transition"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-4 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider border-b border-white/5">
              <div className="flex items-center gap-4">
                <span className="w-6 text-center">#</span>
                <span>Title</span>
              </div>
              <div className="flex items-center gap-8">
                <span className="hidden md:inline">Album</span>
                <Clock className="w-4 h-4" />
              </div>
            </div>

            {filteredSongs.length === 0 ? (
              <p className="text-xs text-zinc-500 py-8 text-center">No songs match "{filterQuery}".</p>
            ) : (
              filteredSongs.map((song, i) => (
                <SongRow
                  key={song.id}
                  song={song}
                  index={i}
                  queueContext={filteredSongs}
                  onRemove={() => toggleLike(song)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
