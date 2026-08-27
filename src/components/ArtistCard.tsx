import React from 'react';
import { UserCheck, UserPlus, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Artist } from '../types/music';
import { useLibrary } from '../context/LibraryContext';
import { usePlayer } from '../context/PlayerContext';
import { formatCount } from '../utils/formatters';

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
      className="group flex flex-col items-center text-center p-4 rounded-2xl bg-zinc-900/40 hover:bg-zinc-800/80 border border-white/5 hover:border-white/15 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-indigo-950/20"
    >
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-zinc-800 mb-3 shadow-xl ring-2 ring-white/5 group-hover:ring-indigo-500/40 transition">
        <img
          src={artist.image}
          alt={artist.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={handlePlayClick}
            aria-label={`Play artist ${artist.name}`}
            className="w-11 h-11 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg hover:scale-105 transition"
          >
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </button>
        </div>
      </div>

      <h4 className="text-sm font-semibold text-zinc-100 group-hover:text-white truncate max-w-full" title={artist.name}>
        {artist.name}
      </h4>

      <p className="text-xs text-zinc-400 mt-0.5">
        {artist.followerCount && Number(artist.followerCount) > 0
          ? `${formatCount(artist.followerCount)} Followers`
          : 'Artist'}
      </p>

      <button
        onClick={handleFollowClick}
        aria-label={isFollowed ? 'Following' : 'Follow'}
        className={`mt-2.5 px-3 py-1 rounded-full text-[11px] font-medium transition flex items-center gap-1.5 ${
          isFollowed
            ? 'bg-zinc-800 text-zinc-300 border border-white/10 hover:bg-zinc-700'
            : 'bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30'
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
