import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Shuffle, ListMusic, Clock, User, Heart } from 'lucide-react';
import { getPlaylistById } from '../services/api';
import { Playlist as PlaylistType } from '../types/music';
import { SongRow } from '../components/SongRow';
import { DetailHeroSkeleton, RowSkeleton } from '../components/LoadingSkeleton';
import { ErrorState } from '../components/FeedbackStates';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../utils/formatters';
import { ImageWithFallback } from '../utils/image';

export const Playlist: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playSong } = usePlayer();

  const [playlist, setPlaylist] = useState<PlaylistType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlaylistData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getPlaylistById(id);
      if (!data) throw new Error('Playlist not found or data could not be loaded.');
      setPlaylist(data);
    } catch (err: any) {
      console.error('Playlist fetch error:', err);
      setError(err?.message || 'Unable to load playlist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylistData();
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

  if (error || !playlist) {
    return (
      <div className="p-4 sm:p-8 max-w-7xl mx-auto pb-32">
        <ErrorState
          title="Playlist Unavailable"
          message={error || 'Playlist could not be found.'}
          onRetry={fetchPlaylistData}
        />
      </div>
    );
  }

  const songs = playlist.songs || [];
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
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-end p-6 md:p-8 rounded-3xl bg-gradient-to-b from-violet-950/50 via-zinc-900/80 to-zinc-900/40 border border-white/10 shadow-2xl">
        <div className="w-52 h-52 sm:w-60 sm:h-60 rounded-2xl overflow-hidden bg-zinc-800 shadow-2xl shrink-0 ring-1 ring-white/15">
          <ImageWithFallback
            src={playlist.image}
            alt={playlist.name}
            fallbackTitle={playlist.name}
            type="playlist"
            containerClassName="w-full h-full"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col space-y-3 text-center md:text-left flex-1 min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-bold self-center md:self-start border border-white/10">
            <ListMusic className="w-3.5 h-3.5" />
            <span>Curated Playlist</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight break-words">
            {playlist.name}
          </h1>

          {playlist.description && (
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
              {playlist.description}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-zinc-300 font-medium">
            {playlist.username && (
              <span className="flex items-center gap-1 font-bold text-white">
                <User className="w-3 h-3 text-indigo-400" />
                {playlist.username}
              </span>
            )}
            <span>• {songs.length} songs</span>
            {totalDurationSecs > 0 && <span>• {formatDuration(totalDurationSecs)} total</span>}
            {playlist.language && <span className="capitalize">• {playlist.language}</span>}
          </div>

          <div className="flex items-center justify-center md:justify-start gap-3 pt-3">
            <button
              onClick={handlePlayAll}
              disabled={songs.length === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition hover:scale-105 active:scale-95 disabled:opacity-50"
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

      {/* Song list */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-4 py-2 text-xs font-bold text-zinc-400 uppercase tracking-wider border-b border-white/5">
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
          <div className="p-8 text-center text-xs text-zinc-500">No tracks found in this playlist.</div>
        ) : (
          songs.map((song, i) => (
            <SongRow
              key={song.id || i}
              song={song}
              index={i}
              queueContext={songs}
            />
          ))
        )}
      </div>
    </div>
  );
};
