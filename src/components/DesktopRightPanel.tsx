import React from 'react';
import { Play, Pause, ListMusic, Music, Sparkles, Clock, Disc3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import { useLibrary } from '../context/LibraryContext';
import { formatDuration } from '../utils/formatters';
import { ImageWithFallback } from '../utils/image';

interface DesktopRightPanelProps {
  fallbackSong?: any;
}

export const DesktopRightPanel: React.FC<DesktopRightPanelProps> = ({ fallbackSong }) => {
  const navigate = useNavigate();
  const {
    currentSong,
    isPlaying,
    isLoading,
    togglePlay,
    playSong,
    queue,
    currentTime,
    duration,
    setIsFullscreenOpen
  } = usePlayer();

  const { isSongLiked, toggleLike } = useLibrary();

  const activeSong = currentSong || fallbackSong;

  if (!activeSong) {
    return (
      <aside className="hidden xl:flex flex-col w-80 bg-white border-l border-gray-200 h-screen sticky top-0 z-20 p-5 pb-28 select-none shrink-0 overflow-y-auto">
        <div className="flex items-center gap-2 mb-4">
          <Music className="w-4 h-4 text-lime-600" />
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Now Playing</h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-gray-50 rounded-3xl border border-gray-100">
          <Disc3 className="w-12 h-12 text-gray-300 animate-spin" style={{ animationDuration: '6s' }} />
          <p className="text-sm font-bold text-gray-800 mt-4">Select a Track</p>
          <p className="text-xs text-gray-500 mt-1">Play any song, artist, or playlist to see live playback details here.</p>
        </div>
      </aside>
    );
  }

  const liked = isSongLiked(activeSong.id);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const upcomingQueue = queue.filter(s => s.id !== activeSong.id).slice(0, 6);

  return (
    <aside className="hidden xl:flex flex-col w-80 bg-white border-l border-gray-200 h-screen sticky top-0 z-20 p-5 pb-28 select-none shrink-0 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-lime-500 animate-pulse" />
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Now Playing</h2>
        </div>
        <button
          onClick={() => setIsFullscreenOpen(true)}
          className="text-[11px] font-semibold text-gray-500 hover:text-gray-900 transition"
        >
          Expand
        </button>
      </div>

      {/* Main Track Card */}
      <div className="bg-gray-50 rounded-3xl p-4 border border-gray-200/80 shadow-sm space-y-4">
        {/* Large Artwork */}
        <div
          onClick={() => {
            if (currentSong) {
              setIsFullscreenOpen(true);
            } else {
              playSong(activeSong);
            }
          }}
          className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-200 shadow-md group cursor-pointer"
        >
          <ImageWithFallback
            src={activeSong.image}
            alt={activeSong.title}
            fallbackTitle={activeSong.title}
            type="song"
            containerClassName="w-full h-full"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Equalizer or play overlay */}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (currentSong?.id === activeSong.id) {
                  togglePlay();
                } else {
                  playSong(activeSong);
                }
              }}
              className="w-12 h-12 rounded-full bg-lime-400 text-gray-950 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition"
            >
              {currentSong?.id === activeSong.id && isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>
          </div>

          {currentSong?.id === activeSong.id && isPlaying && (
            <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md flex items-center gap-1">
              <span className="w-1 h-3 bg-lime-400 rounded-full animate-bounce" style={{ animationDuration: '0.6s' }} />
              <span className="w-1 h-4 bg-emerald-400 rounded-full animate-bounce" style={{ animationDuration: '0.4s' }} />
              <span className="w-1 h-2 bg-yellow-300 rounded-full animate-bounce" style={{ animationDuration: '0.7s' }} />
            </div>
          )}
        </div>

        {/* Track Title & Artist */}
        <div className="space-y-1">
          <h3
            onClick={() => navigate(`/song/${activeSong.id}`)}
            className="text-base font-bold text-gray-900 truncate hover:text-lime-700 cursor-pointer"
            title={activeSong.title}
          >
            {activeSong.title}
          </h3>
          <p
            onClick={() => {
              if (activeSong.artists?.[0]?.id) navigate(`/artist/${activeSong.artists[0].id}`);
            }}
            className="text-xs text-gray-500 truncate hover:text-gray-800 cursor-pointer"
            title={activeSong.artist}
          >
            {activeSong.artist}
          </p>
        </div>

        {/* Mini progress bar if playing */}
        {currentSong?.id === activeSong.id && (
          <div className="space-y-1.5 pt-1">
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-lime-500 rounded-full transition-all duration-200"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-gray-400">
              <span>{formatDuration(currentTime)}</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Upcoming / Next in Queue Section */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ListMusic className="w-3.5 h-3.5 text-gray-700" />
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Next in Queue</h4>
          </div>
          <span className="text-[11px] font-mono text-gray-400">{upcomingQueue.length} tracks</span>
        </div>

        {upcomingQueue.length === 0 ? (
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-center text-xs text-gray-400">
            No upcoming songs. Pick any song or album to queue up tracks!
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingQueue.map((song, i) => (
              <div
                key={`${song.id}-${i}`}
                onClick={() => playSong(song, queue)}
                className="group flex items-center justify-between gap-2.5 p-2 rounded-xl bg-gray-50/70 hover:bg-gray-100 border border-gray-200/50 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <ImageWithFallback
                    src={song.image}
                    alt={song.title}
                    fallbackTitle={song.title}
                    type="song"
                    containerClassName="w-9 h-9 rounded-lg shrink-0 overflow-hidden bg-gray-200 shadow-sm"
                    className="w-full h-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-900 group-hover:text-lime-700 truncate">
                      {song.title}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">{song.artist}</p>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-gray-400 shrink-0">
                  {formatDuration(song.duration)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};
