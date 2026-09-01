import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, UserPlus, UserCheck, Mic2, Disc3 } from 'lucide-react';
import { getArtistById } from '../services/api';
import { Artist as ArtistType } from '../types/music';
import { SongRow } from '../components/SongRow';
import { AlbumCard } from '../components/AlbumCard';
import { DetailHeroSkeleton, RowSkeleton } from '../components/LoadingSkeleton';
import { ErrorState } from '../components/FeedbackStates';
import { usePlayer } from '../context/PlayerContext';
import { useLibrary } from '../context/LibraryContext';
import { formatCount } from '../utils/formatters';
import { ImageWithFallback } from '../utils/image';

export const Artist: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playSong } = usePlayer();
  const { isArtistFollowed, toggleFollowArtist } = useLibrary();

  const [artist, setArtist] = useState<ArtistType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArtistData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getArtistById(id);
      if (!data) throw new Error('Artist not found or profile could not be loaded.');
      setArtist(data);
    } catch (err: any) {
      console.error('Artist fetch error:', err);
      setError(err?.message || 'Unable to load artist profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtistData();
  }, [id]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto pb-32">
        <DetailHeroSkeleton />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <RowSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto pb-32">
        <ErrorState
          title="Artist Unavailable"
          message={error || 'Artist profile could not be found.'}
          onRetry={fetchArtistData}
        />
      </div>
    );
  }

  const isFollowed = isArtistFollowed(artist.id);
  const topSongs = artist.topSongs || [];
  const topAlbums = artist.topAlbums || [];
  const singles = artist.singles || [];

  const handlePlayAll = () => {
    if (topSongs.length > 0) {
      playSong(topSongs[0], topSongs);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto pb-32">
      {/* Artist Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-[#151920] lg:bg-white border border-white/10 lg:border-gray-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-8">
          {/* Circular Image */}
          <div className="w-40 h-40 sm:w-52 sm:h-52 rounded-full overflow-hidden bg-zinc-800 lg:bg-gray-100 shadow-md ring-4 ring-black/5 lg:ring-gray-200 shrink-0">
            <ImageWithFallback
              src={artist.image}
              alt={artist.name}
              fallbackTitle={artist.name}
              type="artist"
              isCircle
              containerClassName="w-full h-full"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Meta */}
          <div className="flex flex-col space-y-3 text-center sm:text-left flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-400/20 text-lime-400 lg:text-lime-700 text-xs font-bold self-center sm:self-start border border-lime-400/30">
              <Mic2 className="w-3.5 h-3.5" />
              <span>Verified Artist</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white lg:text-gray-900 tracking-tight">
              {artist.name}
            </h1>

            <div className="flex items-center justify-center sm:justify-start gap-3 text-xs text-zinc-400 lg:text-gray-600 font-medium">
              {artist.followerCount && Number(artist.followerCount) > 0 && (
                <span>{formatCount(artist.followerCount)} Followers</span>
              )}
              {artist.dominantLanguage && (
                <span className="capitalize">• {artist.dominantLanguage}</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center sm:justify-start gap-3 pt-2">
              <button
                onClick={handlePlayAll}
                disabled={topSongs.length === 0}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#F4FF3B] lg:bg-[#1A1A1A] text-black lg:text-white font-bold text-xs sm:text-sm shadow-md transition hover:opacity-90 active:scale-95 disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play Popular</span>
              </button>

              <button
                onClick={() => toggleFollowArtist(artist.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs sm:text-sm font-bold border transition ${
                  isFollowed
                    ? 'bg-white/10 lg:bg-gray-100 text-white lg:text-gray-900 border-white/10 lg:border-gray-300'
                    : 'bg-lime-400/20 hover:bg-lime-400 text-lime-400 hover:text-black border-lime-400/40'
                }`}
              >
                {isFollowed ? (
                  <>
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Follow</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Tracks */}
      {topSongs.length > 0 && (
        <section className="space-y-3.5">
          <h2 className="text-lg sm:text-xl font-bold text-white lg:text-gray-900 tracking-tight">Popular Songs</h2>
          <div className="space-y-2">
            {topSongs.map((song, i) => (
              <SongRow
                key={song.id || i}
                song={song}
                index={i}
                queueContext={topSongs}
              />
            ))}
          </div>
        </section>
      )}

      {/* Top Albums */}
      {topAlbums.length > 0 && (
        <section className="space-y-3.5">
          <div className="flex items-center gap-2">
            <Disc3 className="w-5 h-5 text-purple-400 lg:text-purple-600" />
            <h2 className="text-lg sm:text-xl font-bold text-white lg:text-gray-900 tracking-tight">Albums & EPs</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {topAlbums.map(album => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </section>
      )}

      {/* Singles */}
      {singles.length > 0 && (
        <section className="space-y-3.5">
          <h2 className="text-lg sm:text-xl font-bold text-white lg:text-gray-900 tracking-tight">Singles</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {singles.map(single => (
              <AlbumCard key={single.id} album={single} />
            ))}
          </div>
        </section>
      )}

      {/* Bio */}
      {artist.bio && (
        <section className="p-6 rounded-2xl bg-[#151920] lg:bg-white border border-white/5 lg:border-gray-200/80 space-y-2">
          <h3 className="text-sm sm:text-base font-bold text-white lg:text-gray-900">About {artist.name}</h3>
          <p className="text-xs sm:text-sm text-zinc-400 lg:text-gray-600 leading-relaxed max-w-3xl">{artist.bio}</p>
        </section>
      )}
    </div>
  );
};
