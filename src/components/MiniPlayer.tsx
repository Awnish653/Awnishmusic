import React from 'react';
import { Play, Pause, SkipForward, Heart } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useLibrary } from '../context/LibraryContext';

export const MiniPlayer: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    togglePlay,
    next,
    setIsFullscreenOpen
  } = usePlayer();

  const { isSongLiked, toggleLike } = useLibrary();

  if (!currentSong) return null;

  const liked = isSongLiked(currentSong.id);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      onClick={() => setIsFullscreenOpen(true)}
      className="md:hidden fixed bottom-14 left-2 right-2 z-40 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex items-center justify-between shadow-2xl overflow-hidden cursor-pointer"
    >
      {/* Top micro progress line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-zinc-800">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-200"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Left: Thumbnail & Info */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-800 shrink-0 shadow-md">
          <img
            src={currentSong.image}
            alt={currentSong.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex flex-col min-w-0 pr-2">
          <span className="text-xs font-semibold text-white truncate leading-tight">
            {currentSong.title}
          </span>
          <span className="text-[11px] text-zinc-400 truncate mt-0.5">
            {currentSong.artist}
          </span>
        </div>
      </div>

      {/* Right: Like, Play/Pause, Next */}
      <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
        <button
          onClick={() => toggleLike(currentSong)}
          aria-label={liked ? 'Unlike' : 'Like'}
          className={`p-2 rounded-full transition ${
            liked ? 'text-rose-500' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500' : ''}`} />
        </button>

        <button
          onClick={togglePlay}
          disabled={isLoading}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow transition active:scale-95"
        >
          {isLoading ? (
            <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>

        <button
          onClick={next}
          aria-label="Next track"
          className="p-2 rounded-full text-zinc-300 hover:text-white transition"
        >
          <SkipForward className="w-4 h-4 fill-current" />
        </button>
      </div>
    </div>
  );
};
