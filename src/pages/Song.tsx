import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  Heart,
  Plus,
  ListPlus,
  Sparkles,
  Music2,
  Sliders,
  Download
} from 'lucide-react';
import { getSongById, getSongSuggestions, searchSongs } from '../services/api';
import { Song as SongType } from '../types/music';
import { SongCard } from '../components/SongCard';
import { DetailHeroSkeleton } from '../components/LoadingSkeleton';
import { ErrorState } from '../components/FeedbackStates';
import { usePlayer } from '../context/PlayerContext';
import { useLibrary } from '../context/LibraryContext';
import { formatDuration, formatCount } from '../utils/formatters';
import { ImageWithFallback } from '../utils/image';

export const SongPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    currentSong,
    isPlaying,
    playSong,
    togglePlay,
    addToQueue,
    audioQuality,
    openDownloadModal
  } = usePlayer();

  const { isSongLiked, toggleLike, setActiveSongForModal } = useLibrary();

  const [song, setSong] = useState<SongType | null>(null);
  const [suggestions, setSuggestions] = useState<SongType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isCurrent = currentSong?.id === id;
  const liked = song ? isSongLiked(song.id) : false;

  const fetchSongData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getSongById(id, audioQuality);
      if (!data) throw new Error('Song could not be loaded or was not found.');
      setSong(data);

      // Fetch suggestions
      let recs = await getSongSuggestions(id, audioQuality);
      if (!recs || recs.length === 0) {
        const query = data.artist?.split(',')[0]?.trim() || data.title;
        recs = await searchSongs(query, audioQuality);
      }
      setSuggestions(recs.filter(s => s.id !== id).slice(0, 12));
    } catch (err: any) {
      console.error('Song load error:', err);
      setError(err?.message || 'Unable to load song details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongData();
  }, [id, audioQuality]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto pb-32">
        <DetailHeroSkeleton />
      </div>
    );
  }

  if (error || !song) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto pb-32">
        <ErrorState
          title="Track Unavailable"
          message={error || 'Song information is currently unreachable.'}
          onRetry={fetchSongData}
        />
      </div>
    );
  }

  const handlePlayAction = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playSong(song, [song, ...suggestions]);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto pb-32">
      {/* Song Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-[#151920] lg:bg-white border border-white/10 lg:border-gray-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 sm:gap-8">
          {/* Cover Art */}
          <div className="relative w-52 h-52 sm:w-60 sm:h-60 rounded-2xl overflow-hidden bg-zinc-800 lg:bg-gray-100 shadow-md ring-1 ring-black/10 shrink-0">
            <ImageWithFallback
              src={song.image}
              alt={song.title}
              fallbackTitle={song.title}
              type="song"
              containerClassName="w-full h-full"
              className="w-full h-full object-cover"
            />
            {isCurrent && isPlaying && (
              <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md flex items-center gap-1.5 border border-white/10">
                <span className="w-1.5 h-3.5 bg-lime-400 rounded-full animate-bounce" style={{ animationDuration: '0.6s' }} />
                <span className="w-1.5 h-5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDuration: '0.4s' }} />
                <span className="w-1.5 h-2.5 bg-yellow-300 rounded-full animate-bounce" style={{ animationDuration: '0.7s' }} />
              </div>
            )}
          </div>

          {/* Meta & Controls */}
          <div className="flex flex-col space-y-3 text-center md:text-left flex-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-400/20 text-lime-400 lg:text-lime-700 text-xs font-bold self-center md:self-start border border-lime-400/30">
              <Music2 className="w-3.5 h-3.5" />
              <span>Track Details</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white lg:text-gray-900 tracking-tight break-words">
              {song.title}
            </h1>

            <div className="space-y-1">
              <p
                onClick={() => {
                  if (song.artists?.[0]?.id) navigate(`/artist/${song.artists[0].id}`);
                }}
                className="text-xs sm:text-sm font-bold text-zinc-300 lg:text-gray-700 hover:underline cursor-pointer"
              >
                {song.artist}
              </p>
              {song.album?.name && (
                <p
                  onClick={() => {
                    if (song.album?.id) navigate(`/album/${song.album.id}`);
                  }}
                  className="text-xs text-zinc-400 lg:text-gray-500 hover:text-white lg:hover:text-black cursor-pointer"
                >
                  Album: <span className="text-zinc-200 lg:text-gray-800 font-semibold">{song.album.name}</span>
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-zinc-400 lg:text-gray-500 pt-1 font-medium">
              {song.duration && <span>{formatDuration(song.duration)}</span>}
              {song.year && <span>• {song.year}</span>}
              {song.language && <span className="capitalize">• {song.language}</span>}
              {song.playCount && <span>• {formatCount(song.playCount)} Plays</span>}
            </div>

            {/* Play Actions */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-2">
              <button
                onClick={handlePlayAction}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#F4FF3B] lg:bg-[#1A1A1A] text-black lg:text-white font-bold text-xs sm:text-sm shadow-md transition hover:opacity-90 active:scale-95"
              >
                {isCurrent && isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                    <span>Play Now</span>
                  </>
                )}
              </button>

              <button
                onClick={() => openDownloadModal(song)}
                className="flex items-center gap-2 px-4 py-3 rounded-full bg-white/10 lg:bg-gray-100 text-white lg:text-gray-900 font-bold text-xs border border-white/10 lg:border-gray-200 transition hover:bg-white/20 lg:hover:bg-gray-200"
                title="Download MP3"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>

              <button
                onClick={() => toggleLike(song)}
                className={`p-3 rounded-full border transition ${
                  liked
                    ? 'text-rose-500 bg-rose-500/10 border-rose-500/30'
                    : 'text-zinc-300 lg:text-gray-700 hover:text-white lg:hover:text-black bg-white/10 lg:bg-gray-100 border-white/10 lg:border-gray-200 hover:bg-white/20 lg:hover:bg-gray-200'
                }`}
                title={liked ? 'Unlike' : 'Like'}
              >
                <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500' : ''}`} />
              </button>

              <button
                onClick={() => addToQueue(song)}
                className="flex items-center gap-2 px-4 py-3 rounded-full bg-white/10 lg:bg-gray-100 text-white lg:text-gray-900 font-bold text-xs border border-white/10 lg:border-gray-200 transition hover:bg-white/20 lg:hover:bg-gray-200"
              >
                <ListPlus className="w-4 h-4" />
                <span>Add to Queue</span>
              </button>

              <button
                onClick={() => setActiveSongForModal(song)}
                className="flex items-center gap-2 px-4 py-3 rounded-full bg-white/10 lg:bg-gray-100 text-white lg:text-gray-900 font-bold text-xs border border-white/10 lg:border-gray-200 transition hover:bg-white/20 lg:hover:bg-gray-200"
              >
                <Plus className="w-4 h-4" />
                <span>Save to Playlist</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Available Audio Stream Formats */}
      {song.audioUrls && song.audioUrls.length > 0 && (
        <section className="p-5 rounded-2xl bg-[#151920] lg:bg-white border border-white/5 lg:border-gray-200/80 space-y-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-lime-400 lg:text-lime-600" />
            <h3 className="text-xs sm:text-sm font-bold text-white lg:text-gray-900">Available Audio Bitrates</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {song.audioUrls.map((stream, idx) => (
              <div
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-white/5 lg:bg-gray-100 border border-white/5 lg:border-gray-200 text-xs text-zinc-300 lg:text-gray-700 font-mono flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-lime-400" />
                <span>{stream.quality || 'Standard'}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recommendations / Suggestions */}
      {suggestions.length > 0 && (
        <section className="space-y-3.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-lime-400 lg:text-lime-600" />
            <h2 className="text-lg sm:text-xl font-bold text-white lg:text-gray-900 tracking-tight">You May Also Like</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {suggestions.map(rec => (
              <SongCard key={rec.id} song={rec} queueContext={suggestions} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
