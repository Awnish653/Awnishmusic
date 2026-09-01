import React from 'react';
import { Play, ListMusic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Playlist } from '../types/music';
import { usePlayer } from '../context/PlayerContext';
import { ImageWithFallback } from '../utils/image';

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
      className="group flex flex-col p-3 rounded-2xl bg-[#151820] lg:bg-white hover:bg-[#1B1F26] lg:hover:bg-[#FAF8F5] border border-white/5 lg:border-[#E8E5DF] transition-all duration-300 cursor-pointer shadow-2xs hover:shadow-md"
    >
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-zinc-800 lg:bg-[#E8E5DF] mb-3 shadow-2xs">
        <ImageWithFallback
          src={playlist.image}
          alt={playlist.name}
          fallbackTitle={playlist.name}
          type="playlist"
          containerClassName="w-full h-full"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Floating Quick Play Button */}
        <button
          onClick={handlePlayClick}
          aria-label={`Play playlist ${playlist.name}`}
          className="absolute right-2.5 bottom-2.5 w-10 h-10 rounded-full bg-[#E5F939] text-black flex items-center justify-center shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-110 active:scale-95 transition-all duration-300 font-bold"
        >
          <Play className="w-4 h-4 fill-current ml-0.5" />
        </button>

        {playlist.songCount !== undefined && playlist.songCount > 0 && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-semibold text-zinc-200 border border-white/10 flex items-center gap-1">
            <ListMusic className="w-3 h-3 text-[#E5F939]" />
            {playlist.songCount} Tracks
          </span>
        )}
      </div>

      <div className="flex flex-col min-w-0">
        <h4 className="text-xs sm:text-sm font-bold text-white lg:text-[#18181A] group-hover:text-[#E5F939] lg:group-hover:text-black truncate" title={playlist.name}>
          {playlist.name}
        </h4>
        <p className="text-[11px] font-serif-italic text-zinc-400 lg:text-[#787679] truncate mt-0.5" title={playlist.description || playlist.username}>
          {playlist.description || playlist.username || 'Curated Playlist'}
        </p>
      </div>
    </div>
  );
};
