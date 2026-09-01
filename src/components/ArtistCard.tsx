import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { Artist } from '../types/music';
import { ImageWithFallback } from '../utils/image';

interface ArtistCardProps {
  artist: Artist;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({ artist }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/artist/${artist.id}`)}
      className="group flex flex-col items-center text-center p-1 sm:p-2 rounded-2xl transition-all duration-300 cursor-pointer select-none shrink-0"
    >
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mb-2 bg-zinc-800 lg:bg-[#EFEFEF] shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 border border-white/5 lg:border-[#E5E5E5]">
        <ImageWithFallback
          src={artist.image}
          alt={artist.name}
          fallbackTitle={artist.name}
          type="artist"
          containerClassName="w-full h-full"
          className="w-full h-full object-cover transition-transform duration-500"
        />

        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-9 h-9 rounded-full bg-[#F4FF3B] lg:bg-[#1A1A1A] text-black lg:text-white flex items-center justify-center shadow-lg transition-transform transform scale-75 group-hover:scale-100">
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </div>
        </div>
      </div>

      <h3 className="text-xs sm:text-sm font-semibold text-zinc-200 lg:text-[#1A1A1A] truncate w-20 sm:w-24 group-hover:text-[#F4FF3B] lg:group-hover:text-black transition-colors">
        {artist.name}
      </h3>
    </div>
  );
};
