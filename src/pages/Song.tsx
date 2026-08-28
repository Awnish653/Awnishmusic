import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  Heart,
  Plus,
  ListPlus,
  Radio,
  Disc3,
  Mic2,
  Clock,
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
    playNextInQueue,
    audioQuality,
    setAudioQuality,
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
      <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto pb-32">
        <DetailHeroSkeleton />
      </div>
    );
  }

  if (error || !song) {
    return (
      <div className="p-4 sm:p-8 max-w-7xl mx-auto pb-32">
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
    <div className="p-4 sm:p-8 space-y-10 max-w-7xl mx-auto pb-32 animate-fade-in">
      {/* Song Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-violet-950/70 via-zinc-900/90 to-zinc-950 border border-white/10 p-6 sm:p-10 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 sm:gap-8">
          {/* Cover Art */}
          <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-2xl overflow-hidden bg-zinc-800 shadow-2xl ring-1 ring-white/15 shrink-0">
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
                <span className="w-1.5 h-3.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDuration: '0.6s' }} />
                <span className="w-1.5 h-5 bg-violet-400 rounded-full animate-bounce" style={{ animationDuration: '0.4s' }} />
                <span className="w-1.5 h-2.5 bg-indigo-300 rounded-full animate-bounce" style={{ animationDuration: '0.7s' }} />
              </div>
            )}
          </div>

          {/* Meta & Controls */}
          <div className="flex flex-col space-y-3 text-center md:text-left flex-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-bold self-center md:self-start border border-white/10">
              <Music2 className="w-3.5 h-3.5" />
              <span>Track Details</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight break-words">
              {song.title}
            </h1>

            <div className="space-y-1">
              <p
                onClick={() => {
                  if (song.artists?.[0]?.id) navigate(`/artist/${song.artists[0].id}`);
                }}
                className="text-sm font-bold text-zinc-300 hover:text-indigo-400 cursor-pointer"
              >
                {song.artist}
              </p>
              {song.album?.name && (
                <p
                  onClick={() => {
                    if (song.album?.id) navigate(`/album/${song.album.id}`);
                  }}
                  className="text-xs text-zinc-400 hover:text-white cursor-pointer"
                >
                  Album: <span className="text-zinc-200">{song.album.name}</span>
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-zinc-400 pt-1 font-medium">
              {song.duration && <span>{formatDuration(song.duration)}</span>}
              {song.year && <span>• {song.year}</span>}
              {song.language && <span className="capitalize">• {song.language}</span>}
              {song.playCount && <span>• {formatCount(song.playCount)} Plays</span>}
            </div>

            {/* Play Actions */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-3">
              <button
                onClick={handlePlayAction}
                className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition hover:scale-105 active:scale-95"
              >
                {isCurrent && isPlaying ? (
                  <>
                    <Pause className="w-5 h-5 fill-white" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                    <span>Play Now</span>
                  </>
                )}
              </button>

              <button
                onClick={() => openDownloadModal(song)}
                className="flex items-center gap-2 px-4 py-3.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-cyan-400 font-semibold text-xs border border-white/10 transition"
                title="Download MP3"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>

              <button
                onClick={() => toggleLike(song)}
                className={`p-3.5 rounded-full border transition ${
                  liked
                    ? 'text-rose-500 bg-rose-500/10 border-rose-500/30'
                    : 'text-zinc-300 hover:text-white bg-zinc-900 border-white/10 hover:bg-zinc-800'
                }`}
                title={liked ? 'Unlike' : 'Like'}
              >
                <Heart className={`w-5 h-5 ${liked ? 'fill-rose-500' : ''}`} />
              </button>

              <button
                onClick={() => addToQueue(song)}
                className="flex items-center gap-2 px-4 py-3.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-medium text-xs border border-white/10 transition"
              >
                <ListPlus className="w-4 h-4" />
                <span>Add to Queue</span>
              </button>

              <button
                onClick={() => setActiveSongForModal(song)}
                className="flex items-center gap-2 px-4 py-3.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-medium text-xs border border-white/10 transition"
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
        <section className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Available Audio Bitrates</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {song.audioUrls.map((stream, idx) => (
              <div
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-zinc-800/60 border border-white/5 text-xs text-zinc-300 font-mono flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{stream.quality || 'Standard'}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recommendations / Suggestions */}
      {suggestions.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-black text-white tracking-tight">You May Also Like</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {suggestions.map(rec => (
              <SongCard key={rec.id} song={rec} queueContext={suggestions} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
