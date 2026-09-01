import React from 'react';
import { Play, Pause, SkipBack, SkipForward, ListMusic } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { ImageWithFallback } from '../utils/image';

export const MiniPlayer: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    togglePlay,
    prev,
    next,
    setIsFullscreenOpen,
    setIsQueueOpen
  } = usePlayer();

  if (!currentSong) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      onClick={() => setIsFullscreenOpen(true)}
      className="lg:hidden fixed bottom-[68px] left-3 right-3 z-40 bg-[#151920] border border-white/10 rounded-2xl p-2.5 flex items-center justify-between shadow-2xl overflow-hidden cursor-pointer active:scale-[0.99] transition-transform select-none"
    >
      {/* Micro progress line at top */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-zinc-800">
        <div
          className="h-full bg-[#F4FF3B] transition-all duration-200"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Left: Artwork + Title + Artist */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <ImageWithFallback
          src={currentSong.image}
          alt={currentSong.title}
          fallbackTitle={currentSong.title}
          type="song"
          containerClassName="w-11 h-11 rounded-xl overflow-hidden bg-zinc-800 shrink-0 shadow-md ring-1 ring-white/10"
          className="w-full h-full object-cover"
        />
        <div className="flex flex-col min-w-0 pr-1">
          <span className="text-xs font-bold text-white truncate leading-tight">
            {currentSong.title}
          </span>
          <span className="text-[11px] text-[#A7A7A7] truncate mt-0.5 font-medium">
            {currentSong.artist}
          </span>
        </div>
      </div>

      {/* Right: Prev, Play/Pause (#F4FF3B), Next, Queue */}
      <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
        <button
          onClick={prev}
          aria-label="Previous"
          className="p-2 rounded-full text-zinc-300 hover:text-white transition active:scale-95"
        >
          <SkipBack className="w-4 h-4 fill-current" />
        </button>

        <button
          onClick={togglePlay}
          disabled={isLoading}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="w-10 h-10 rounded-full bg-[#F4FF3B] text-black flex items-center justify-center shadow-lg transition active:scale-95 disabled:opacity-80 font-bold"
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
          aria-label="Next"
          className="p-2 rounded-full text-zinc-300 hover:text-white transition active:scale-95"
        >
          <SkipForward className="w-4 h-4 fill-current" />
        </button>

        <button
          onClick={() => setIsQueueOpen(prev => !prev)}
          aria-label="Queue"
          className="p-2 rounded-full text-zinc-300 hover:text-white transition active:scale-95 ml-0.5"
        >
          <ListMusic className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

