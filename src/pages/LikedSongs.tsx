import React, { useState } from 'react';
import { Heart, Play, Shuffle, Search, Clock } from 'lucide-react';
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto pb-32">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-end p-6 md:p-8 rounded-3xl bg-[#151920] lg:bg-white border border-white/10 lg:border-gray-200/80 shadow-sm">
        <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl bg-rose-500/15 lg:bg-rose-50 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-sm shrink-0">
          <Heart className="w-20 h-20 fill-rose-500 animate-pulse" style={{ animationDuration: '3s' }} />
        </div>

        <div className="flex flex-col space-y-3 text-center md:text-left flex-1 min-w-0">
          <span className="text-xs uppercase font-bold text-rose-500 tracking-wider">
            Your Collection
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-white lg:text-gray-900 tracking-tight">
            Liked Songs
          </h1>
          <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-zinc-400 lg:text-gray-500 font-medium">
            <span>{likedSongs.length} favorites</span>
            {totalDurationSecs > 0 && <span>• {formatDuration(totalDurationSecs)} total</span>}
          </div>

          <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
            <button
              onClick={handlePlayAll}
              disabled={likedSongs.length === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#F4FF3B] lg:bg-[#1A1A1A] text-black lg:text-white font-bold text-xs sm:text-sm shadow-md transition hover:opacity-90 active:scale-95 disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play All</span>
            </button>

            <button
              onClick={handleShuffle}
              disabled={likedSongs.length === 0}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 lg:bg-gray-100 text-white lg:text-gray-900 font-semibold text-xs sm:text-sm border border-white/10 lg:border-gray-200 transition hover:bg-white/20 lg:hover:bg-gray-200 active:scale-95 disabled:opacity-50"
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
          message="Tap the heart icon on any song, album, or search result to save it here for quick access."
          icon={<Heart className="w-8 h-8 text-rose-500" />}
          action={
            <button
              onClick={() => navigate('/search')}
              className="px-5 py-2.5 rounded-full bg-[#F4FF3B] lg:bg-[#1A1A1A] text-black lg:text-white font-bold text-xs shadow-xs transition"
            >
              Discover Songs
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          {/* Quick Search Filter */}
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 lg:text-gray-400" />
            <input
              type="text"
              value={filterQuery}
              onChange={e => setFilterQuery(e.target.value)}
              placeholder="Filter in Liked Songs..."
              className="w-full pl-9 pr-3 py-2 bg-[#151920] lg:bg-white border border-white/10 lg:border-gray-200 focus:border-[#F4FF3B] lg:focus:border-black rounded-xl text-xs text-white lg:text-gray-900 placeholder-zinc-500 lg:placeholder-gray-400 outline-none transition shadow-xs"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-4 py-2 text-xs font-bold text-zinc-400 lg:text-gray-400 uppercase tracking-wider border-b border-white/5 lg:border-gray-200">
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
              <p className="text-xs text-zinc-500 lg:text-gray-400 py-8 text-center">No songs match "{filterQuery}".</p>
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
