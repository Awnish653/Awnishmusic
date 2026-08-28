import React, { useState } from 'react';
import { Play, Pause, Heart, MoreVertical, Plus, ListPlus, Radio, Disc3, Download, Music2 } from 'lucide-react';
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

  return (
    <div
      onClick={handlePlay}
      className={`group flex items-center justify-between gap-3 p-2 sm:px-3 sm:py-2.5 rounded-2xl transition-all duration-200 cursor-pointer border select-none ${
        isCurrent
          ? 'bg-gradient-to-r from-indigo-950/70 via-violet-950/40 to-zinc-900/60 border-indigo-500/40 text-white shadow-lg shadow-indigo-950/20'
          : 'bg-zinc-900/20 hover:bg-zinc-800/60 border-transparent hover:border-white/5 text-zinc-300 hover:text-white'
      }`}
    >
      {/* Left: Index / Play / Cover / Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Index number or Equalizer / Play indicator */}
        <div className="w-6 text-center text-xs font-mono text-zinc-500 shrink-0 flex items-center justify-center">
          {isCurrent && isPlaying ? (
            <div className="flex items-end gap-0.5 h-3.5">
              <span className="w-1 bg-cyan-400 rounded-full animate-bounce" style={{ height: '80%', animationDuration: '0.6s' }} />
              <span className="w-1 bg-indigo-400 rounded-full animate-bounce" style={{ height: '100%', animationDuration: '0.4s' }} />
              <span className="w-1 bg-fuchsia-400 rounded-full animate-bounce" style={{ height: '60%', animationDuration: '0.7s' }} />
            </div>
          ) : (
            <span className="group-hover:hidden font-semibold">{index !== undefined ? index + 1 : ''}</span>
          )}
          <span className={`${isCurrent && isPlaying ? 'hidden' : 'hidden group-hover:block text-white'}`}>
            <Play className="w-3.5 h-3.5 fill-white" />
          </span>
        </div>

        {/* Cover Thumbnail */}
        {showCover && (
          <ImageWithFallback
            src={song.image}
            alt={song.title}
            fallbackTitle={song.title}
            type="song"
            containerClassName="w-11 h-11 rounded-xl shrink-0 shadow-md ring-1 ring-white/10"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}

        {/* Title and Artist */}
        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-bold truncate leading-tight tracking-tight transition ${
              isCurrent ? 'text-indigo-400 font-extrabold' : 'text-zinc-100 group-hover:text-white'
            }`}
          >
            {song.title}
          </p>
          <p className="text-xs text-zinc-400 truncate mt-0.5 hover:text-zinc-200">
            {song.artist}
          </p>
        </div>
      </div>

      {/* Center: Album Name (Desktop) */}
      {showAlbum && (
        <div className="hidden md:block w-1/4 text-xs text-zinc-400 truncate hover:text-zinc-200">
          {song.album?.name || '-'}
        </div>
      )}

      {/* Right: Download, Duration, Like, Menu */}
      <div className="flex items-center gap-1 sm:gap-2.5 shrink-0" onClick={e => e.stopPropagation()}>
        {/* Direct Quick Download Button */}
        <button
          onClick={handleDownload}
          title="Download MP3"
          aria-label="Download Song"
          className="p-1.5 rounded-lg text-zinc-400 hover:text-cyan-400 hover:bg-zinc-800/80 transition opacity-0 group-hover:opacity-100"
        >
          <Download className="w-3.5 h-3.5" />
        </button>

        {/* Like Button */}
        <button
          onClick={() => toggleLike(song)}
          aria-label={liked ? 'Unlike' : 'Like'}
          className={`p-1.5 rounded-lg transition ${
            liked
              ? 'text-rose-500 hover:text-rose-400'
              : 'text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100'
          }`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500 opacity-100' : ''}`} />
        </button>

        <span className="text-xs text-zinc-400 font-mono w-10 text-right">
          {formatDuration(song.duration)}
        </span>

        {/* 3-dots Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            aria-label="Options"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition opacity-80 group-hover:opacity-100"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div
                className="absolute right-0 top-full mt-1 w-52 p-1.5 rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl z-50 text-xs text-zinc-200"
                onClick={e => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    openDownloadModal(song);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-indigo-600/20 hover:text-indigo-300 text-left transition font-semibold"
                >
                  <Download className="w-4 h-4 text-indigo-400" />
                  Download Audio (Lossless)
                </button>
                <button
                  onClick={() => {
                    addToQueue(song);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-800 hover:text-white text-left transition"
                >
                  <ListPlus className="w-4 h-4 text-zinc-400" />
                  Add to Queue
                </button>
                <button
                  onClick={() => {
                    playNextInQueue(song);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-800 hover:text-white text-left transition"
                >
                  <Radio className="w-4 h-4 text-zinc-400" />
                  Play Next
                </button>
                <button
                  onClick={() => {
                    setActiveSongForModal(song);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-800 hover:text-white text-left transition"
                >
                  <Plus className="w-4 h-4 text-zinc-400" />
                  Add to Playlist
                </button>
                {song.album?.id && (
                  <button
                    onClick={() => {
                      navigate(`/album/${song.album?.id}`);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-800 hover:text-white text-left transition"
                  >
                    <Disc3 className="w-4 h-4 text-zinc-400" />
                    View Album
                  </button>
                )}
                {onRemove && (
                  <button
                    onClick={() => {
                      onRemove();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-950/40 text-rose-400 text-left transition border-t border-white/5 mt-1"
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
