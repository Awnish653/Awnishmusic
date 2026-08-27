import React from 'react';
import { Play, ListMusic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Playlist } from '../types/music';
import { usePlayer } from '../context/PlayerContext';

interface PlaylistCardProps {
  playlist: Playlist;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist }) => {
  const navigate = useNavigate();
  const { playSong } = usePlayer();

  const handleClick = () => {
    navigate(`/playlist/${playlist.id}`);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playlist.songs && playlist.songs.length > 0) {
      playSong(playlist.songs[0], playlist.songs);
    } else {
      navigate(`/playlist/${playlist.id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group flex flex-col p-3 rounded-2xl bg-zinc-900/40 hover:bg-zinc-800/80 border border-white/5 hover:border-white/15 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-indigo-950/20"
    >
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-zinc-800 mb-3 shadow-md">
        <img
          src={playlist.image}
          alt={playlist.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Floating Quick Play Button */}
        <button
          onClick={handlePlayClick}
          aria-label={`Play playlist ${playlist.name}`}
          className="absolute right-3 bottom-3 w-11 h-11 rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 text-white flex items-center justify-center shadow-xl shadow-black/50 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 transition-all duration-300"
        >
          <Play className="w-5 h-5 fill-white ml-0.5" />
        </button>

        {playlist.songCount !== undefined && playlist.songCount > 0 && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-medium text-zinc-300 border border-white/10 flex items-center gap-1">
            <ListMusic className="w-3 h-3 text-indigo-400" />
            {playlist.songCount} Songs
          </span>
        )}
      </div>

      <div className="flex flex-col min-w-0">
        <h4 className="text-sm font-semibold text-zinc-100 group-hover:text-white truncate" title={playlist.name}>
          {playlist.name}
        </h4>
        <p className="text-xs text-zinc-400 truncate mt-1" title={playlist.description || playlist.username}>
          {playlist.description || playlist.username || 'Curated Playlist'}
        </p>
      </div>
    </div>
  );
};
