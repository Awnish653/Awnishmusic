import React, { useState } from 'react';
import { Play, Pause, Heart, MoreVertical, Plus, ListPlus, Radio, Disc3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Song } from '../types/music';
import { usePlayer } from '../context/PlayerContext';
import { useLibrary } from '../context/LibraryContext';
import { formatDuration } from '../utils/formatters';

interface SongCardProps {
  song: Song;
  queueContext?: Song[];
}

export const SongCard: React.FC<SongCardProps> = ({ song, queueContext }) => {
  const navigate = useNavigate();
  const { currentSong, isPlaying, playSong, togglePlay, addToQueue, playNextInQueue } = usePlayer();
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
      className="group relative flex flex-col p-3 rounded-2xl bg-zinc-900/40 hover:bg-zinc-800/80 border border-white/5 hover:border-white/15 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-indigo-950/20"
    >
      {/* Artwork Container */}
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-zinc-800 mb-3">
        <img
          src={song.image}
          alt={song.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />

        {/* Hover Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-3">
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
            <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500' : ''}`} />
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
              <MoreVertical className="w-4 h-4" />
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
                  className="absolute right-0 bottom-full mb-2 w-48 py-1.5 rounded-xl bg-zinc-900 border border-white/10 shadow-2xl z-50 text-xs text-zinc-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      addToQueue(song);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-zinc-800 hover:text-white text-left transition"
                  >
                    <ListPlus className="w-4 h-4 text-zinc-400" />
                    Add to Queue
                  </button>
                  <button
                    onClick={() => {
                      playNextInQueue(song);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-zinc-800 hover:text-white text-left transition"
                  >
                    <Radio className="w-4 h-4 text-zinc-400" />
                    Play Next
                  </button>
                  <button
                    onClick={() => {
                      setActiveSongForModal(song);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-zinc-800 hover:text-white text-left transition"
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
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-zinc-800 hover:text-white text-left transition"
                    >
                      <Disc3 className="w-4 h-4 text-zinc-400" />
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
          className={`absolute right-3 bottom-3 w-11 h-11 rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 text-white flex items-center justify-center shadow-xl shadow-indigo-950/50 transition-all duration-300 ${
            isCurrent
              ? 'opacity-100 scale-100 ring-2 ring-white/40'
              : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105'
          }`}
        >
          {isCurrent && isPlaying ? (
            <Pause className="w-5 h-5 fill-white" />
          ) : (
            <Play className="w-5 h-5 fill-white ml-0.5" />
          )}
        </button>

        {/* Equalizer Wave Indicator if current and playing */}
        {isCurrent && isPlaying && (
          <div className="absolute top-2.5 left-2.5 px-2 py-1 rounded-full bg-black/60 backdrop-blur-md flex items-center gap-1">
            <span className="w-1 h-3 bg-indigo-400 rounded-full animate-bounce" style={{ animationDuration: '0.6s' }} />
            <span className="w-1 h-4 bg-violet-400 rounded-full animate-bounce" style={{ animationDuration: '0.4s' }} />
            <span className="w-1 h-2 bg-indigo-300 rounded-full animate-bounce" style={{ animationDuration: '0.7s' }} />
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="flex flex-col min-w-0">
        <h4
          className={`text-sm font-semibold truncate leading-tight transition ${
            isCurrent ? 'text-indigo-400' : 'text-zinc-100 group-hover:text-white'
          }`}
          title={song.title}
        >
          {song.title}
        </h4>
        <p className="text-xs text-zinc-400 truncate mt-1 hover:text-zinc-300" title={song.artist}>
          {song.artist}
        </p>
      </div>
    </div>
  );
};
