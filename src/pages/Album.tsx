import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Shuffle, Heart, Disc3, Clock, Share2, Sparkles } from 'lucide-react';
import { getAlbumById, searchSongs } from '../services/api';
import { Album as AlbumType, Song } from '../types/music';
import { SongRow } from '../components/SongRow';
import { SongCard } from '../components/SongCard';
import { DetailHeroSkeleton, RowSkeleton } from '../components/LoadingSkeleton';
import { ErrorState } from '../components/FeedbackStates';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../utils/formatters';

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
      <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto pb-32">
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
      <div className="p-4 sm:p-8 max-w-7xl mx-auto pb-32">
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
    <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto pb-32 animate-fade-in">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-end p-6 md:p-8 rounded-3xl bg-gradient-to-b from-indigo-950/40 via-zinc-900/60 to-zinc-900/30 border border-white/10 shadow-2xl">
        {/* Cover Art */}
        <div className="w-52 h-52 sm:w-60 sm:h-60 rounded-2xl overflow-hidden bg-zinc-800 shadow-2xl shrink-0 ring-1 ring-white/10">
          <img
            src={album.image}
            alt={album.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Album Meta */}
        <div className="flex flex-col space-y-3 text-center md:text-left flex-1 min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-semibold self-center md:self-start">
            <Disc3 className="w-3.5 h-3.5" />
            <span>Album</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight break-words">
            {album.name}
          </h1>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-zinc-300">
            <span className="font-semibold text-white hover:underline cursor-pointer" onClick={() => navigate(`/search?q=${encodeURIComponent(album.artist || '')}`)}>
              {album.artist}
            </span>
            {album.year && <span>• {album.year}</span>}
            <span>• {songs.length} songs</span>
            {totalDurationSecs > 0 && <span>• {formatDuration(totalDurationSecs)} total</span>}
            {album.language && <span className="capitalize">• {album.language}</span>}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center md:justify-start gap-3 pt-3">
            <button
              onClick={handlePlayAll}
              disabled={songs.length === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Play All</span>
            </button>

            <button
              onClick={handleShuffle}
              disabled={songs.length === 0}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-zinc-800/90 hover:bg-zinc-700 text-white font-semibold text-sm border border-white/10 transition active:scale-95 disabled:opacity-50"
            >
              <Shuffle className="w-4 h-4" />
              <span>Shuffle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Song List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-4 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider border-b border-white/5">
          <div className="flex items-center gap-4">
            <span className="w-6 text-center">#</span>
            <span>Title</span>
          </div>
          <div className="flex items-center gap-8">
            <span className="hidden md:inline">Album</span>
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {songs.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">No tracks available in this album.</div>
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
        <div className="space-y-4 pt-6 border-t border-white/5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">More Like This</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {relatedSongs.map(song => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
