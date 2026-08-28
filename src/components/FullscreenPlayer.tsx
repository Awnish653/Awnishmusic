import React, { useState } from 'react';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Plus,
  ListMusic,
  Sliders,
  Volume2,
  Sparkles,
  Download
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useLibrary } from '../context/LibraryContext';
import { formatDuration } from '../utils/formatters';
import { SongRow } from './SongRow';
import { ImageWithFallback } from '../utils/image';

export const FullscreenPlayer: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    repeatMode,
    isShuffled,
    audioQuality,
    queue,
    suggestions,
    togglePlay,
    next,
    prev,
    seek,
    cycleRepeatMode,
    toggleShuffle,
    isFullscreenOpen,
    setIsFullscreenOpen,
    openDownloadModal
  } = usePlayer();

  const { isSongLiked, toggleLike, setActiveSongForModal } = useLibrary();
  const [activeTab, setActiveTab] = useState<'player' | 'queue' | 'related'>('player');

  if (!isFullscreenOpen || !currentSong) return null;

  const liked = isSongLiked(currentSong.id);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col justify-between overflow-hidden animate-fade-in">
      {/* Dynamic Ambient Background Blur */}
      <div
        className="absolute inset-0 opacity-20 filter blur-3xl scale-125 pointer-events-none transition-all duration-1000"
        style={{
          backgroundImage: `url(${currentSong.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/95 to-zinc-950 pointer-events-none" />

      {/* Top Header Bar */}
      <div className="relative z-10 flex items-center justify-between p-4 sm:p-6 border-b border-white/5">
        <button
          onClick={() => setIsFullscreenOpen(false)}
          aria-label="Close fullscreen player"
          className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
          <button
            onClick={() => setActiveTab('player')}
            className={`px-3.5 py-1 text-xs font-semibold rounded-full transition ${
              activeTab === 'player' ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Now Playing
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3.5 py-1 text-xs font-semibold rounded-full transition ${
              activeTab === 'queue' ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Queue ({queue.length})
          </button>
          <button
            onClick={() => setActiveTab('related')}
            className={`px-3.5 py-1 text-xs font-semibold rounded-full transition ${
              activeTab === 'related' ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Related
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-500/30 font-mono font-semibold">
            {audioQuality}
          </span>
        </div>
      </div>

      {/* Middle Content Section */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6 py-4 flex flex-col justify-center max-w-lg mx-auto w-full">
        {activeTab === 'player' && (
          <div className="flex flex-col items-center my-auto">
            {/* High-res Artwork with subtle shadow and glow */}
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-950/50 ring-1 ring-white/15 mb-8">
              <ImageWithFallback
                src={currentSong.image}
                alt={currentSong.title}
                fallbackTitle={currentSong.title}
                type="song"
                containerClassName="w-full h-full"
                className="w-full h-full object-cover"
              />
              {isPlaying && (
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md flex items-center gap-1.5 border border-white/10">
                  <span className="w-1.5 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDuration: '0.6s' }} />
                  <span className="w-1.5 h-4 bg-indigo-400 rounded-full animate-bounce" style={{ animationDuration: '0.4s' }} />
                  <span className="w-1.5 h-2 bg-fuchsia-400 rounded-full animate-bounce" style={{ animationDuration: '0.7s' }} />
                </div>
              )}
            </div>

            {/* Song Details & Actions */}
            <div className="flex items-center justify-between w-full mb-6">
              <div className="flex flex-col min-w-0 pr-4">
                <h2 className="text-xl sm:text-2xl font-black text-white truncate tracking-tight" title={currentSong.title}>
                  {currentSong.title}
                </h2>
                <p className="text-sm text-zinc-300 font-medium truncate mt-1" title={currentSong.artist}>
                  {currentSong.artist}
                </p>
                {currentSong.album?.name && (
                  <p className="text-xs text-zinc-500 truncate mt-0.5">
                    Album: {currentSong.album.name}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openDownloadModal(currentSong)}
                  aria-label="Download Song"
                  title="Download MP3"
                  className="p-3 rounded-2xl text-zinc-300 hover:text-cyan-400 bg-white/5 hover:bg-white/10 transition"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => toggleLike(currentSong)}
                  aria-label={liked ? 'Unlike' : 'Like'}
                  className={`p-3 rounded-2xl transition ${
                    liked ? 'text-rose-500 bg-rose-500/10 ring-1 ring-rose-500/20' : 'text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${liked ? 'fill-rose-500' : ''}`} />
                </button>
                <button
                  onClick={() => setActiveSongForModal(currentSong)}
                  aria-label="Add to Playlist"
                  className="p-3 rounded-2xl text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 transition"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full mb-6">
              <div className="relative w-full flex items-center group h-5">
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 rounded-full shadow-sm"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.5}
                  value={currentTime}
                  onChange={e => seek(parseFloat(e.target.value))}
                  aria-label="Scrub track position"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              <div className="flex justify-between text-xs font-mono text-zinc-400 mt-1">
                <span>{formatDuration(currentTime)}</span>
                <span>{formatDuration(duration)}</span>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-between w-full px-4">
              <button
                onClick={toggleShuffle}
                aria-label="Shuffle"
                className={`p-2 transition ${isShuffled ? 'text-indigo-400' : 'text-zinc-400 hover:text-white'}`}
              >
                <Shuffle className="w-5 h-5" />
              </button>

              <button
                onClick={prev}
                aria-label="Previous"
                className="p-3 text-white hover:text-indigo-400 transition active:scale-95"
              >
                <SkipBack className="w-7 h-7 fill-current" />
              </button>

              <button
                onClick={togglePlay}
                disabled={isLoading}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-white to-zinc-200 text-black flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition"
              >
                {isLoading ? (
                  <span className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-7 h-7 fill-current" />
                ) : (
                  <Play className="w-7 h-7 fill-current ml-1" />
                )}
              </button>

              <button
                onClick={next}
                aria-label="Next"
                className="p-3 text-white hover:text-indigo-400 transition active:scale-95"
              >
                <SkipForward className="w-7 h-7 fill-current" />
              </button>

              <button
                onClick={cycleRepeatMode}
                aria-label="Repeat mode"
                className={`p-2 transition ${repeatMode !== 'off' ? 'text-indigo-400' : 'text-zinc-400 hover:text-white'}`}
              >
                {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'queue' && (
          <div className="space-y-3 py-2">
            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">
              Up Next in Queue ({queue.length})
            </h3>
            <div className="space-y-1">
              {queue.map((song, i) => (
                <SongRow
                  key={`${song.id}-${i}`}
                  song={song}
                  index={i}
                  queueContext={queue}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'related' && (
          <div className="space-y-3 py-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">
                Recommended For You
              </h3>
            </div>
            {suggestions.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">Finding similar tracks...</p>
            ) : (
              <div className="space-y-1">
                {suggestions.map((song, i) => (
                  <SongRow
                    key={song.id}
                    song={song}
                    index={i}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Dismiss Tip */}
      <div className="relative z-10 p-3 text-center text-[11px] text-zinc-500 border-t border-white/5">
        Swipe or tap down arrow to minimize player
      </div>
    </div>
  );
};
