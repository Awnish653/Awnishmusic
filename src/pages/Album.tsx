import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Shuffle, Disc3, Clock, Sparkles } from 'lucide-react';
import { getAlbumById, searchSongs } from '../services/api';
import { Album as AlbumType, Song } from '../types/music';
import { SongRow } from '../components/SongRow';
import { SongCard } from '../components/SongCard';
import { DetailHeroSkeleton, RowSkeleton } from '../components/LoadingSkeleton';
import { ErrorState } from '../components/FeedbackStates';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../utils/formatters';
import { ImageWithFallback } from '../utils/image';

export const Album: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playSong } = usePlayer();

  const [album, setAlbum] = useState<AlbumType | null>(null);
  const [relatedSongs, setRelatedSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlbumData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getAlbumById(id);
      if (!data) throw new Error('Album not found or data could not be loaded.');
      setAlbum(data);

      // Fetch related songs using artist or album name
      if (data.artist || data.name) {
        searchSongs(data.artist || data.name).then(results => {
          setRelatedSongs(results.filter(s => !data.songs?.some(ds => ds.id === s.id)).slice(0, 6));
        }).catch(console.warn);
      }
    } catch (err: any) {
      console.error('Album fetch error:', err);
      setError(err?.message || 'Unable to load album details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbumData();
  }, [id]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto pb-32">
        <DetailHeroSkeleton />
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <RowSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto pb-32">
        <ErrorState
          title="Album Unavailable"
          message={error || 'Album could not be found.'}
          onRetry={fetchAlbumData}
        />
      </div>
    );
  }

  const songs = album.songs || [];
  const totalDurationSecs = songs.reduce((acc, s) => acc + (s.duration || 0), 0);

  const handlePlayAll = () => {
    if (songs.length > 0) {
      playSong(songs[0], songs);
    }
  };

  const handleShuffle = () => {
    if (songs.length > 0) {
      const shuffled = [...songs].sort(() => Math.random() - 0.5);
      playSong(shuffled[0], shuffled);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto pb-32">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-end p-6 md:p-8 rounded-3xl bg-[#151920] lg:bg-white border border-white/10 lg:border-gray-200/80 shadow-sm">
        {/* Cover Art */}
        <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden bg-zinc-800 lg:bg-gray-100 shadow-md shrink-0 ring-1 ring-black/10">
          <ImageWithFallback
            src={album.image}
            alt={album.name}
            fallbackTitle={album.name}
            type="album"
            containerClassName="w-full h-full"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Album Meta */}
        <div className="flex flex-col space-y-3 text-center md:text-left flex-1 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-400/20 text-lime-400 lg:text-lime-700 text-xs font-bold self-center md:self-start border border-lime-400/30">
            <Disc3 className="w-3.5 h-3.5" />
            <span>Album</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white lg:text-gray-900 tracking-tight break-words">
            {album.name}
          </h1>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-zinc-400 lg:text-gray-600 font-medium">
            <span className="font-bold text-white lg:text-gray-900 hover:underline cursor-pointer" onClick={() => navigate(`/search?q=${encodeURIComponent(album.artist || '')}`)}>
              {album.artist}
            </span>
            {album.year && <span>• {album.year}</span>}
            <span>• {songs.length} songs</span>
            {totalDurationSecs > 0 && <span>• {formatDuration(totalDurationSecs)} total</span>}
            {album.language && <span className="capitalize">• {album.language}</span>}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
            <button
              onClick={handlePlayAll}
              disabled={songs.length === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#F4FF3B] lg:bg-[#1A1A1A] text-black lg:text-white font-bold text-xs sm:text-sm shadow-md transition hover:opacity-90 active:scale-95 disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play All</span>
            </button>

            <button
              onClick={handleShuffle}
              disabled={songs.length === 0}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 lg:bg-gray-100 text-white lg:text-gray-900 font-semibold text-xs sm:text-sm border border-white/10 lg:border-gray-200 transition hover:bg-white/20 lg:hover:bg-gray-200 active:scale-95 disabled:opacity-50"
            >
              <Shuffle className="w-4 h-4" />
              <span>Shuffle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Song List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-4 py-2 text-xs font-bold text-zinc-400 lg:text-gray-400 uppercase tracking-wider border-b border-white/5 lg:border-gray-200">
          <div className="flex items-center gap-4">
            <span className="w-6 text-center">#</span>
            <span>Title</span>
          </div>
          <div className="flex items-center gap-8">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {songs.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500 lg:text-gray-400">No tracks available in this album.</div>
        ) : (
          songs.map((song, i) => (
            <SongRow
              key={song.id || i}
              song={song}
              index={i}
              queueContext={songs}
              showAlbum={false}
            />
          ))
        )}
      </div>

      {/* Related Music */}
      {relatedSongs.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-white/5 lg:border-gray-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-lime-400 lg:text-lime-600" />
            <h3 className="text-lg font-bold text-white lg:text-gray-900 tracking-tight">More Like This</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
            {relatedSongs.map(song => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
