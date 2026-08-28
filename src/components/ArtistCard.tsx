import React from 'react';
import { UserCheck, UserPlus, Play, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Artist } from '../types/music';
import { useLibrary } from '../context/LibraryContext';
import { usePlayer } from '../context/PlayerContext';
import { formatCount } from '../utils/formatters';
import { ImageWithFallback } from '../utils/image';

interface ArtistCardProps {
  artist: Artist;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({ artist }) => {
  const navigate = useNavigate();
  const { isArtistFollowed, toggleFollowArtist } = useLibrary();
  const { playSong } = usePlayer();
  const isFollowed = isArtistFollowed(artist.id);

  const handleClick = () => {
    navigate(`/artist/${artist.id}`);
  };

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFollowArtist(artist.id);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (artist.topSongs && artist.topSongs.length > 0) {
      playSong(artist.topSongs[0], artist.topSongs);
    } else {
      navigate(`/artist/${artist.id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group flex flex-col items-center text-center p-4 rounded-2xl bg-zinc-900/40 hover:bg-zinc-800/80 border border-white/5 hover:border-white/15 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-indigo-950/30"
    >
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-zinc-800 mb-3 shadow-xl ring-2 ring-white/10 group-hover:ring-indigo-500/50 transition duration-300">
        <ImageWithFallback
          src={artist.image}
          alt={artist.name}
          fallbackTitle={artist.name}
          type="artist"
          isCircle
          containerClassName="w-full h-full"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={handlePlayClick}
            aria-label={`Play artist ${artist.name}`}
            className="w-11 h-11 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition"
          >
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 max-w-full">
        <h4 className="text-sm font-bold text-zinc-100 group-hover:text-white truncate" title={artist.name}>
          {artist.name}
        </h4>
        {artist.isVerified && (
          <span className="w-3.5 h-3.5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[9px] shrink-0 font-bold" title="Verified Artist">
            ✓
          </span>
        )}
      </div>

      <p className="text-xs text-zinc-400 mt-0.5 font-medium">
        {artist.followerCount && Number(artist.followerCount) > 0
          ? `${formatCount(artist.followerCount)} Listeners`
          : 'Featured Artist'}
      </p>

      <button
        onClick={handleFollowClick}
        aria-label={isFollowed ? 'Following' : 'Follow'}
        className={`mt-3 px-3.5 py-1 rounded-full text-[11px] font-semibold transition flex items-center gap-1.5 ${
          isFollowed
            ? 'bg-zinc-800 text-zinc-300 border border-white/10 hover:bg-zinc-700'
            : 'bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 shadow-sm'
        }`}
      >
        {isFollowed ? (
          <>
            <UserCheck className="w-3 h-3 text-emerald-400" />
            Following
          </>
        ) : (
          <>
            <UserPlus className="w-3 h-3" />
            Follow
          </>
        )}
      </button>
    </div>
  );
};
