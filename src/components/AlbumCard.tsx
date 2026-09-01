import React from 'react';
import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Album } from '../types/music';
import { usePlayer } from '../context/PlayerContext';
import { ImageWithFallback } from '../utils/image';

interface AlbumCardProps {
  album: Album;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({ album }) => {
  const navigate = useNavigate();
  const { playSong } = usePlayer();

  const handleClick = () => {
    navigate(`/album/${album.id}`);
  };

  const handleQuickPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (album.songs && album.songs.length > 0) {
      playSong(album.songs[0], album.songs);
    } else {
      navigate(`/album/${album.id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group flex flex-col p-3 rounded-2xl bg-[#151920] lg:bg-white hover:bg-[#1B1F26] lg:hover:bg-gray-50 border border-white/5 lg:border-gray-200/80 transition-all duration-300 cursor-pointer shadow-xs hover:shadow-md"
    >
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-zinc-800 lg:bg-gray-100 mb-3 shadow-xs">
        <ImageWithFallback
          src={album.image}
          alt={album.name}
          fallbackTitle={album.name}
          type="album"
          containerClassName="w-full h-full"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Floating Quick Play Button */}
        <button
          onClick={handleQuickPlay}
          aria-label={`Play album ${album.name}`}
          className="absolute right-2.5 bottom-2.5 w-10 h-10 rounded-full bg-lime-400 text-gray-950 flex items-center justify-center shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-110 active:scale-95 transition-all duration-300"
        >
          <Play className="w-4 h-4 fill-current ml-0.5" />
        </button>

        {album.year && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono font-medium text-zinc-200 border border-white/10">
            {album.year}
          </span>
        )}
      </div>

      <div className="flex flex-col min-w-0">
        <h4 className="text-xs sm:text-sm font-bold text-white lg:text-gray-900 group-hover:text-lime-400 lg:group-hover:text-lime-700 truncate" title={album.name}>
          {album.name}
        </h4>
        <p className="text-[11px] text-zinc-400 lg:text-gray-500 truncate mt-0.5" title={album.artist}>
          {album.artist || 'Album'}
        </p>
      </div>
    </div>
  );
};
