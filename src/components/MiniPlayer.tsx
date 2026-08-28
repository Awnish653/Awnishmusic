import React from 'react';
import { Play, Pause, SkipForward, Heart, Download } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useLibrary } from '../context/LibraryContext';
import { ImageWithFallback } from '../utils/image';

export const MiniPlayer: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    togglePlay,
    next,
    setIsFullscreenOpen,
    openDownloadModal
  } = usePlayer();

  const { isSongLiked, toggleLike } = useLibrary();

  if (!currentSong) return null;

  const liked = isSongLiked(currentSong.id);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      onClick={() => setIsFullscreenOpen(true)}
      className="md:hidden fixed bottom-14 left-2 right-2 z-40 bg-zinc-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 flex items-center justify-between shadow-2xl overflow-hidden cursor-pointer active:scale-[0.99] transition-transform"
    >
      {/* Top micro progress line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-zinc-800">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 transition-all duration-200"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Left: Thumbnail & Info */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <ImageWithFallback
          src={currentSong.image}
          alt={currentSong.title}
          fallbackTitle={currentSong.title}
          type="song"
          containerClassName="w-10 h-10 rounded-xl overflow-hidden bg-zinc-800 shrink-0 shadow-md ring-1 ring-white/10"
          className="w-full h-full object-cover"
        />
        <div className="flex flex-col min-w-0 pr-1">
          <span className="text-xs font-bold text-white truncate leading-tight">
            {currentSong.title}
          </span>
          <span className="text-[11px] text-zinc-400 truncate mt-0.5 font-medium">
            {currentSong.artist}
          </span>
        </div>
      </div>

      {/* Right: Download, Like, Play/Pause, Next */}
      <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
        <button
          onClick={() => openDownloadModal(currentSong)}
          aria-label="Download"
          title="Download MP3"
          className="p-1.5 rounded-lg text-zinc-400 hover:text-cyan-400 transition"
        >
          <Download className="w-4 h-4" />
        </button>

        <button
          onClick={() => toggleLike(currentSong)}
          aria-label={liked ? 'Unlike' : 'Like'}
          className={`p-1.5 rounded-lg transition ${
            liked ? 'text-rose-500 bg-rose-500/10' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500' : ''}`} />
        </button>

        <button
          onClick={togglePlay}
          disabled={isLoading}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="w-9 h-9 rounded-full bg-gradient-to-r from-white to-zinc-200 text-zinc-950 flex items-center justify-center shadow-lg transition active:scale-95 disabled:opacity-80"
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
          className="p-1.5 rounded-lg text-zinc-300 hover:text-white transition"
        >
          <SkipForward className="w-4 h-4 fill-current" />
        </button>
      </div>
    </div>
  );
};
