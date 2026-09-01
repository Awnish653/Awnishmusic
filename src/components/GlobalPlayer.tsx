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
  Disc3,
  Download,
  Headphones
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import { useLibrary } from '../context/LibraryContext';
import { formatDuration } from '../utils/formatters';
import { AudioQualityKey } from '../types/music';
import { ImageWithFallback } from '../utils/image';

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
    setIsFullscreenOpen,
    openDownloadModal
  } = usePlayer();

  const { isSongLiked, toggleLike } = useLibrary();
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
    <div className="hidden lg:flex fixed bottom-0 left-0 right-0 h-24 bg-[#141416] border-t border-[#222226] z-50 px-8 items-center justify-between shadow-2xl text-white select-none">
      {/* LEFT SECTION: Song Details & Like & Download */}
      <div className="flex items-center gap-4 w-1/4 min-w-[240px]">
        <div
          onClick={() => navigate(`/song/${currentSong.id}`)}
          className="relative w-14 h-14 rounded-xl overflow-hidden bg-zinc-900 shrink-0 cursor-pointer group shadow-md border border-white/10"
        >
          <ImageWithFallback
            src={currentSong.image}
            alt={currentSong.title}
            fallbackTitle={currentSong.title}
            type="song"
            containerClassName="w-full h-full"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Disc3 className="w-5 h-5 text-[#E5F939] animate-spin" style={{ animationDuration: '3s' }} />
          </div>
        </div>

        <div className="flex flex-col min-w-0 pr-1">
          <span
            onClick={() => navigate(`/song/${currentSong.id}`)}
            className="text-sm font-serif-italic font-bold text-white truncate hover:underline cursor-pointer transition-colors"
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
            className="text-xs text-[#888890] truncate hover:text-white cursor-pointer mt-0.5"
            title={currentSong.artist}
          >
            {currentSong.artist}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => toggleLike(currentSong)}
            aria-label={liked ? 'Unlike song' : 'Like song'}
            className={`p-2 rounded-full transition ${
              liked ? 'text-rose-500 bg-rose-500/10' : 'text-[#888890] hover:text-white hover:bg-white/10'
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500' : ''}`} />
          </button>

          <button
            onClick={() => openDownloadModal(currentSong)}
            aria-label="Download current song"
            title="Download Audio"
            className="p-2 rounded-full text-[#888890] hover:text-white hover:bg-white/10 transition"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CENTER SECTION: Audio Controls & Progress Waveform */}
      <div className="flex flex-col items-center gap-2 max-w-xl w-2/4 px-4">
        {/* Buttons */}
        <div className="flex items-center gap-5">
          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            aria-label="Toggle Shuffle"
            className={`p-1.5 rounded-full transition ${
              isShuffled ? 'text-[#E5F939] font-bold bg-white/10' : 'text-[#888890] hover:text-white'
            }`}
            title={isShuffled ? 'Shuffle is On' : 'Shuffle is Off'}
          >
            <Shuffle className="w-4 h-4" />
          </button>

          {/* Prev */}
          <button
            onClick={prev}
            aria-label="Previous track"
            className="p-2 rounded-full text-zinc-300 hover:text-white hover:bg-white/10 transition active:scale-95"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          {/* Play / Pause with dynamic loading state */}
          <button
            onClick={togglePlay}
            disabled={isLoading}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="w-11 h-11 rounded-full bg-[#E5F939] hover:bg-[#d8ec32] text-black flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-80 font-bold"
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
            className="p-2 rounded-full text-zinc-300 hover:text-white hover:bg-white/10 transition active:scale-95"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          {/* Repeat */}
          <button
            onClick={cycleRepeatMode}
            aria-label="Repeat mode"
            className={`p-1.5 rounded-full transition ${
              repeatMode !== 'off' ? 'text-[#E5F939] font-bold bg-white/10' : 'text-[#888890] hover:text-white'
            }`}
            title={`Repeat mode: ${repeatMode}`}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
          </button>
        </div>

        {/* Progress Bar & Timestamps */}
        <div className="flex items-center gap-3 w-full">
          <span className="text-[11px] font-mono text-[#888890] w-10 text-right font-medium">
            {formatDuration(isSeeking ? seekValue : currentTime)}
          </span>

          <div className="relative flex-1 flex items-center group h-4">
            {/* Background bar */}
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden group-hover:h-2 transition-all">
              <div
                className="h-full bg-[#E5F939] rounded-full transition-all"
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

          <span className="text-[11px] font-mono text-[#888890] w-10 font-medium">
            {formatDuration(duration)}
          </span>
        </div>
      </div>

      {/* RIGHT SECTION: Audio Quality, Volume, Queue & Expand */}
      <div className="flex items-center justify-end gap-3 w-1/4 min-w-[240px]">
        {/* Audio Quality Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowQualityMenu(!showQualityMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1C1C20] hover:bg-[#25252A] border border-white/10 text-xs text-white font-semibold transition"
            title="Audio Streaming Quality"
          >
            <Headphones className="w-3 h-3 text-[#E5F939]" />
            <span className="font-mono text-[11px]">{audioQuality}</span>
          </button>

          {showQualityMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowQualityMenu(false)} />
              <div className="absolute right-0 bottom-full mb-2 w-40 p-1.5 bg-[#1C1C20] border border-white/10 rounded-2xl shadow-2xl z-50 text-xs">
                <p className="text-[10px] font-bold text-[#888890] px-2 py-1 uppercase tracking-wider">
                  Audio Quality
                </p>
                {qualities.map(q => (
                  <button
                    key={q}
                    onClick={() => {
                      setAudioQuality(q);
                      setShowQualityMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition ${
                      audioQuality === q ? 'bg-white/15 text-[#E5F939] font-bold' : 'text-zinc-300 hover:bg-white/5'
                    }`}
                  >
                    <span>{q}</span>
                    {audioQuality === q && <Check className="w-3.5 h-3.5 text-[#E5F939]" />}
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
            className="p-1.5 rounded-full text-[#888890] hover:text-white transition"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-500" />
            ) : volume < 0.5 ? (
              <Volume1 className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          <div className="w-20 relative flex items-center h-4">
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden group-hover:h-2 transition-all">
              <div
                className="h-full bg-[#E5F939] rounded-full"
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
          className={`p-2 rounded-full border transition ${
            isQueueOpen
              ? 'bg-[#E5F939] border-[#E5F939] text-black shadow-md'
              : 'bg-[#1C1C20] hover:bg-[#25252A] border-white/10 text-zinc-300 hover:text-white'
          }`}
          title="Playing Queue"
        >
          <ListMusic className="w-4 h-4" />
        </button>

        {/* Fullscreen Player Modal */}
        <button
          onClick={() => setIsFullscreenOpen(true)}
          aria-label="Open Fullscreen Player"
          className="p-2 rounded-full bg-[#1C1C20] hover:bg-[#25252A] border border-white/10 text-zinc-300 hover:text-white transition"
          title="Fullscreen Mode"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
