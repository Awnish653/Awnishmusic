import React from 'react';
import { Play, Disc3 } from 'lucide-react';
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
      className="group flex flex-col p-3 rounded-2xl bg-zinc-900/40 hover:bg-zinc-800/80 border border-white/5 hover:border-white/15 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-indigo-950/30"
    >
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-zinc-800 mb-3 shadow-md">
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
          className="absolute right-3 bottom-3 w-11 h-11 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white flex items-center justify-center shadow-xl shadow-black/50 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-110 active:scale-95 transition-all duration-300"
        >
          <Play className="w-5 h-5 fill-white ml-0.5" />
        </button>

        {album.year && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono font-medium text-zinc-300 border border-white/10">
            {album.year}
          </span>
        )}
      </div>

      <div className="flex flex-col min-w-0">
        <h4 className="text-sm font-bold text-zinc-100 group-hover:text-white truncate" title={album.name}>
          {album.name}
        </h4>
        <p className="text-xs text-zinc-400 truncate mt-1" title={album.artist}>
          {album.artist || 'Album'}
        </p>
      </div>
    </div>
  );
};
