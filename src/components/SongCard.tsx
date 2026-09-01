import React, { useState } from 'react';
import { Play, Pause, Heart, MoreVertical, Plus, ListPlus, Radio, Disc3, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Song } from '../types/music';
import { usePlayer } from '../context/PlayerContext';
import { useLibrary } from '../context/LibraryContext';
import { ImageWithFallback } from '../utils/image';

interface SongCardProps {
  song: Song;
  queueContext?: Song[];
}

export const SongCard: React.FC<SongCardProps> = ({ song, queueContext }) => {
  const navigate = useNavigate();
  const { currentSong, isPlaying, playSong, togglePlay, addToQueue, playNextInQueue, openDownloadModal } = usePlayer();
  const { isSongLiked, toggleLike, setActiveSongForModal } = useLibrary();
  const [showMenu, setShowMenu] = useState(false);

  const isCurrent = currentSong?.id === song.id;
  const liked = isSongLiked(song.id);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playSong(song, queueContext);
    }
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike(song);
  };

  return (
    <div
      onClick={() => {
        if (isCurrent) {
          togglePlay();
        } else {
          playSong(song, queueContext);
        }
      }}
      className="group relative flex flex-col p-3 rounded-2xl bg-[#151820] lg:bg-white hover:bg-[#1B1F26] lg:hover:bg-[#FAF8F5] border border-white/5 lg:border-[#E8E5DF] transition-all duration-300 cursor-pointer shadow-xs hover:shadow-md"
    >
      {/* Artwork Container */}
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-zinc-800 lg:bg-[#E8E5DF] mb-3 shadow-inner">
        <ImageWithFallback
          src={song.image}
          alt={song.title}
          fallbackTitle={song.title}
          type="song"
          containerClassName="w-full h-full"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Hover Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-2.5">
          {/* Like Heart */}
          <button
            onClick={handleLikeClick}
            aria-label={liked ? 'Unlike song' : 'Like song'}
            className={`p-2 rounded-full backdrop-blur-md transition ${
              liked
                ? 'text-rose-500 bg-rose-500/20'
                : 'text-white/80 hover:text-white bg-black/40 hover:bg-black/60'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-rose-500' : ''}`} />
          </button>

          {/* Quick Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              aria-label="Song options"
              className="p-2 rounded-full text-white/80 hover:text-white bg-black/40 hover:bg-black/60 backdrop-blur-md transition"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                />
                <div
                  className="absolute right-0 bottom-full mb-2 w-52 p-1.5 rounded-2xl bg-[#151820] lg:bg-white border border-white/10 lg:border-[#E8E5DF] shadow-2xl z-50 text-xs text-white lg:text-[#18181A]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      openDownloadModal(song);
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
                </div>
              </>
            )}
          </div>
        </div>

        {/* Center Floating Play Button */}
        <button
          onClick={handlePlayClick}
          aria-label={isCurrent && isPlaying ? 'Pause' : 'Play'}
          className={`absolute right-2.5 bottom-2.5 w-10 h-10 rounded-full bg-[#E5F939] text-black flex items-center justify-center shadow-lg transition-all duration-300 font-bold ${
            isCurrent
              ? 'opacity-100 scale-100'
              : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105'
          }`}
        >
          {isCurrent && isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>

        {/* Equalizer Wave Indicator if current and playing */}
        {isCurrent && isPlaying && (
          <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-black/70 backdrop-blur-md flex items-center gap-1">
            <span className="w-1 h-3 bg-[#E5F939] rounded-full animate-bounce" style={{ animationDuration: '0.6s' }} />
            <span className="w-1 h-4 bg-[#E5F939] rounded-full animate-bounce" style={{ animationDuration: '0.4s' }} />
            <span className="w-1 h-2 bg-[#E5F939] rounded-full animate-bounce" style={{ animationDuration: '0.7s' }} />
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="flex flex-col min-w-0">
        <h4
          className={`text-xs font-bold truncate leading-tight tracking-tight transition ${
            isCurrent
              ? 'text-[#E5F939] lg:text-[#18181A]'
              : 'text-white lg:text-[#18181A] group-hover:text-[#E5F939] lg:group-hover:text-black'
          }`}
          title={song.title}
        >
          {song.title}
        </h4>
        <p className="text-[11px] font-serif-italic text-zinc-400 lg:text-[#787679] truncate mt-1" title={song.artist}>
          {song.artist}
        </p>
      </div>
    </div>
  );
};
