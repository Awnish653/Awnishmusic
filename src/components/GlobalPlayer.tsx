import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Volume1,
  Heart,
  ListMusic,
  Maximize2,
  Sliders,
  Check,
  Disc3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import { useLibrary } from '../context/LibraryContext';
import { formatDuration } from '../utils/formatters';
import { AudioQualityKey } from '../types/music';

export const GlobalPlayer: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentSong,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffled,
    audioQuality,
    togglePlay,
    next,
    prev,
    seek,
    setVolume,
    toggleMute,
    cycleRepeatMode,
    toggleShuffle,
    setAudioQuality,
    setIsQueueOpen,
    isQueueOpen,
    setIsFullscreenOpen
  } = usePlayer();

  const { isSongLiked, toggleLike, setActiveSongForModal } = useLibrary();
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  if (!currentSong) return null;

  const liked = isSongLiked(currentSong.id);
  const progressPercent = duration > 0 ? ((isSeeking ? seekValue : currentTime) / duration) * 100 : 0;

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSeekValue(val);
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
    setSeekValue(currentTime);
  };

  const handleSeekEnd = (e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const val = parseFloat(target.value);
    seek(val);
    setIsSeeking(false);
  };

  const qualities: AudioQualityKey[] = ['320kbps', '160kbps', '96kbps', '48kbps', '12kbps'];

  return (
    <div className="hidden md:flex fixed bottom-0 left-0 right-0 h-24 bg-zinc-950/95 backdrop-blur-2xl border-t border-white/10 z-50 px-6 items-center justify-between shadow-2xl">
      {/* LEFT SECTION: Song Details & Like */}
      <div className="flex items-center gap-4 w-1/4 min-w-[220px]">
        <div
          onClick={() => navigate(`/song/${currentSong.id}`)}
          className="relative w-14 h-14 rounded-xl overflow-hidden bg-zinc-900 shrink-0 cursor-pointer group shadow-md"
        >
          <img
            src={currentSong.image}
            alt={currentSong.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Disc3 className="w-5 h-5 text-white animate-spin" style={{ animationDuration: '3s' }} />
          </div>
        </div>

        <div className="flex flex-col min-w-0 pr-2">
          <span
            onClick={() => navigate(`/song/${currentSong.id}`)}
            className="text-sm font-semibold text-white truncate hover:underline cursor-pointer"
            title={currentSong.title}
          >
            {currentSong.title}
          </span>
          <span
            onClick={() => {
              if (currentSong.artists?.[0]?.id) {
                navigate(`/artist/${currentSong.artists[0].id}`);
              }
            }}
            className="text-xs text-zinc-400 truncate hover:text-zinc-200 cursor-pointer mt-0.5"
            title={currentSong.artist}
          >
            {currentSong.artist}
          </span>
        </div>

        <button
          onClick={() => toggleLike(currentSong)}
          aria-label={liked ? 'Unlike song' : 'Like song'}
          className={`p-2 rounded-full transition shrink-0 ${
            liked ? 'text-rose-500 hover:text-rose-400' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500' : ''}`} />
        </button>
      </div>

      {/* CENTER SECTION: Controls & Progress Bar */}
      <div className="flex flex-col items-center gap-2 max-w-xl w-2/4 px-4">
        {/* Buttons */}
        <div className="flex items-center gap-5">
          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            aria-label="Toggle Shuffle"
            className={`p-1.5 rounded-full transition ${
              isShuffled ? 'text-indigo-400' : 'text-zinc-400 hover:text-white'
            }`}
            title={isShuffled ? 'Shuffle is On' : 'Shuffle is Off'}
          >
            <Shuffle className="w-4 h-4" />
          </button>

          {/* Prev */}
          <button
            onClick={prev}
            aria-label="Previous track"
            className="p-1.5 rounded-full text-zinc-300 hover:text-white transition active:scale-95"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          {/* Play / Pause with dynamic loading state */}
          <button
            onClick={togglePlay}
            disabled={isLoading}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="w-11 h-11 rounded-full bg-white hover:bg-zinc-200 text-black flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-80"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          {/* Next */}
          <button
            onClick={next}
            aria-label="Next track"
            className="p-1.5 rounded-full text-zinc-300 hover:text-white transition active:scale-95"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          {/* Repeat */}
          <button
            onClick={cycleRepeatMode}
            aria-label="Repeat mode"
            className={`p-1.5 rounded-full transition ${
              repeatMode !== 'off' ? 'text-indigo-400' : 'text-zinc-400 hover:text-white'
            }`}
            title={`Repeat mode: ${repeatMode}`}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
          </button>
        </div>

        {/* Progress Bar & Timestamps */}
        <div className="flex items-center gap-3 w-full">
          <span className="text-[11px] font-mono text-zinc-400 w-10 text-right">
            {formatDuration(isSeeking ? seekValue : currentTime)}
          </span>

          <div className="relative flex-1 flex items-center group h-4">
            {/* Background bar */}
            <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden group-hover:h-1.5 transition-all">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 group-hover:from-violet-400 group-hover:to-cyan-400 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Native Slider overlay */}
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.5}
              value={isSeeking ? seekValue : currentTime}
              onChange={handleSeekChange}
              onMouseDown={handleSeekStart}
              onMouseUp={handleSeekEnd}
              onTouchStart={handleSeekStart}
              onTouchEnd={handleSeekEnd}
              aria-label="Seek track position"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          <span className="text-[11px] font-mono text-zinc-400 w-10">
            {formatDuration(duration)}
          </span>
        </div>
      </div>

      {/* RIGHT SECTION: Audio Quality, Volume, Queue & Expand */}
      <div className="flex items-center justify-end gap-3 w-1/4 min-w-[220px]">
        {/* Audio Quality Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowQualityMenu(!showQualityMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs text-zinc-300 transition"
            title="Audio Streaming Quality"
          >
            <Sliders className="w-3 h-3 text-indigo-400" />
            <span className="font-mono text-[11px]">{audioQuality}</span>
          </button>

          {showQualityMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowQualityMenu(false)} />
              <div className="absolute right-0 bottom-full mb-2 w-36 p-1 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-50 text-xs">
                <p className="text-[10px] font-semibold text-zinc-400 px-2 py-1 uppercase tracking-wider">
                  Audio Quality
                </p>
                {qualities.map(q => (
                  <button
                    key={q}
                    onClick={() => {
                      setAudioQuality(q);
                      setShowQualityMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left transition ${
                      audioQuality === q ? 'bg-indigo-600/30 text-indigo-300 font-bold' : 'text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <span>{q}</span>
                    {audioQuality === q && <Check className="w-3 h-3 text-indigo-400" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-2 group">
          <button
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white transition"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : volume < 0.5 ? (
              <Volume1 className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          <div className="w-20 relative flex items-center h-4">
            <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden group-hover:h-1.5 transition-all">
              <div
                className="h-full bg-white group-hover:bg-indigo-400 rounded-full"
                style={{ width: `${isMuted ? 0 : volume * 100}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={e => setVolume(parseFloat(e.target.value))}
              aria-label="Volume slider"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Queue Drawer Button */}
        <button
          onClick={() => setIsQueueOpen(prev => !prev)}
          aria-label="Toggle Queue"
          className={`p-2 rounded-xl border transition ${
            isQueueOpen
              ? 'bg-indigo-600 border-indigo-500 text-white'
              : 'bg-zinc-900/80 hover:bg-zinc-800 border-white/10 text-zinc-300 hover:text-white'
          }`}
          title="Playing Queue"
        >
          <ListMusic className="w-4 h-4" />
        </button>

        {/* Fullscreen Player Modal */}
        <button
          onClick={() => setIsFullscreenOpen(true)}
          aria-label="Open Fullscreen Player"
          className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white transition"
          title="Fullscreen Mode"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
