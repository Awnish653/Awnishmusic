import React, { useState } from 'react';
import { Play, Pause, Heart, MoreVertical, Plus, ListPlus, Radio, Disc3, Download, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Song } from '../types/music';
import { usePlayer } from '../context/PlayerContext';
import { useLibrary } from '../context/LibraryContext';
import { formatDuration } from '../utils/formatters';
import { ImageWithFallback } from '../utils/image';

interface SongRowProps {
  song: Song;
  index?: number;
  queueContext?: Song[];
  showCover?: boolean;
  showAlbum?: boolean;
  onRemove?: () => void;
}

export const SongRow: React.FC<SongRowProps> = ({
  song,
  index,
  queueContext,
  showCover = true,
  showAlbum = true,
  onRemove
}) => {
  const navigate = useNavigate();
  const { currentSong, isPlaying, playSong, togglePlay, addToQueue, playNextInQueue, openDownloadModal } = usePlayer();
  const { isSongLiked, toggleLike, setActiveSongForModal } = useLibrary();
  const [showMenu, setShowMenu] = useState(false);

  const isCurrent = currentSong?.id === song.id;
  const liked = isSongLiked(song.id);

  const handlePlay = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playSong(song, queueContext);
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    openDownloadModal(song);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToQueue(song);
  };

  return (
    <div
      onClick={handlePlay}
      className={`group flex items-center justify-between gap-3 p-2 sm:px-4 sm:py-3 rounded-2xl transition-all duration-200 cursor-pointer select-none border ${
        isCurrent
          ? 'bg-[#151820] lg:bg-[#EFECE6] border-[#E5F939]/30 lg:border-[#18181A]/20 text-white lg:text-[#18181A] shadow-xs'
          : 'bg-[#0D0E12] lg:bg-white hover:bg-[#151820] lg:hover:bg-[#FAF8F5] border-white/5 lg:border-[#E8E5DF] text-white lg:text-[#18181A]'
      }`}
    >
      {/* Left: Cover / Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Cover Thumbnail */}
        {showCover && (
          <ImageWithFallback
            src={song.image}
            alt={song.title}
            fallbackTitle={song.title}
            type="song"
            containerClassName="w-12 h-12 rounded-xl shrink-0 overflow-hidden bg-zinc-800 lg:bg-[#E8E5DF] shadow-2xs ring-1 ring-white/5 lg:ring-black/5"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}

        {/* Title and Artist */}
        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-semibold truncate leading-tight transition ${
              isCurrent
                ? 'text-[#E5F939] lg:text-[#18181A] font-bold'
                : 'text-white lg:text-[#18181A]'
            }`}
          >
            {song.title}
          </p>
          <p className="text-xs font-serif-italic text-[#888890] lg:text-[#787679] truncate mt-0.5 font-normal">
            {song.artist}
          </p>
        </div>
      </div>

      {/* Center: Album Name (Desktop) */}
      {showAlbum && (
        <div className="hidden lg:block w-1/4 text-xs font-serif-italic text-[#787679] truncate hover:text-[#18181A]">
          {song.album?.name || '-'}
        </div>
      )}

      {/* Right: Quick Add (+), Duration, Like, Menu */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0" onClick={e => e.stopPropagation()}>
        {/* Duration */}
        <span className="text-xs font-mono text-[#888890] lg:text-[#787679] w-9 text-right">
          {formatDuration(song.duration)}
        </span>

        {/* Quick Add Button (+) */}
        <button
          onClick={handleQuickAdd}
          title="Add to queue"
          aria-label="Add to queue"
          className="p-1 rounded-full text-zinc-300 lg:text-[#787679] hover:text-[#E5F939] lg:hover:text-[#18181A] hover:bg-white/10 lg:hover:bg-[#EFECE6] transition"
        >
          <Plus className="w-5 h-5" />
        </button>

        {/* Like Button */}
        <button
          onClick={() => toggleLike(song)}
          aria-label={liked ? 'Unlike' : 'Like'}
          className={`hidden sm:flex p-1.5 rounded-full transition ${
            liked
              ? 'text-rose-500'
              : 'text-[#888890] lg:text-[#787679] hover:text-rose-400 opacity-0 group-hover:opacity-100'
          }`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500 opacity-100' : ''}`} />
        </button>

        {/* 3-dots Menu */}
        <div className="relative hidden lg:block">
          <button
            onClick={() => setShowMenu(!showMenu)}
            aria-label="Options"
            className="p-1.5 rounded-full text-[#888890] lg:text-[#787679] hover:text-white lg:hover:text-[#18181A] hover:bg-white/10 lg:hover:bg-[#EFECE6] transition"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div
                className="absolute right-0 top-full mt-1 w-52 p-1.5 rounded-2xl bg-[#151820] lg:bg-white border border-white/10 lg:border-[#E8E5DF] shadow-2xl z-50 text-xs text-white lg:text-[#18181A]"
                onClick={e => e.stopPropagation()}
              >
                <button
                  onClick={(e) => {
                    handleDownload(e);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 lg:hover:bg-[#FAF8F5] text-left transition font-semibold"
                >
                  <Download className="w-4 h-4 text-[#E5F939] lg:text-[#18181A]" />
                  Download Lossless Audio
                </button>
                <button
                  onClick={() => {
                    addToQueue(song);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 lg:hover:bg-[#FAF8F5] text-left transition"
                >
                  <ListPlus className="w-4 h-4 text-zinc-400 lg:text-[#787679]" />
                  Add to Queue
                </button>
                <button
                  onClick={() => {
                    playNextInQueue(song);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 lg:hover:bg-[#FAF8F5] text-left transition"
                >
                  <Radio className="w-4 h-4 text-zinc-400 lg:text-[#787679]" />
                  Play Next
                </button>
                <button
                  onClick={() => {
                    setActiveSongForModal(song);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 lg:hover:bg-[#FAF8F5] text-left transition"
                >
                  <Plus className="w-4 h-4 text-zinc-400 lg:text-[#787679]" />
                  Add to Playlist
                </button>
                {song.album?.id && (
                  <button
                    onClick={() => {
                      navigate(`/album/${song.album?.id}`);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 lg:hover:bg-[#FAF8F5] text-left transition"
                  >
                    <Disc3 className="w-4 h-4 text-zinc-400 lg:text-[#787679]" />
                    View Album
                  </button>
                )}
                {onRemove && (
                  <button
                    onClick={() => {
                      onRemove();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-500/20 text-rose-500 text-left transition border-t border-white/5 lg:border-[#E8E5DF] mt-1"
                  >
                    Remove from this list
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
