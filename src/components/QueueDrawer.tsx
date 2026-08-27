import React from 'react';
import {
  X,
  Trash2,
  Play,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Music,
  ListMusic,
  Plus
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useLibrary } from '../context/LibraryContext';
import { formatDuration } from '../utils/formatters';

export const QueueDrawer: React.FC = () => {
  const {
    isQueueOpen,
    setIsQueueOpen,
    queue,
    currentIndex,
    currentSong,
    suggestions,
    playSong,
    removeFromQueue,
    clearQueue,
    reorderQueue,
    addToQueue
  } = usePlayer();

  const { isSongLiked, toggleLike } = useLibrary();

  if (!isQueueOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-zinc-950/95 border-l border-white/10 h-full flex flex-col shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <ListMusic className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Playing Queue</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
              {queue.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {queue.length > 1 && (
              <button
                onClick={clearQueue}
                aria-label="Clear Queue"
                className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-zinc-900 rounded-lg transition"
                title="Clear queue (keeps currently playing track)"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setIsQueueOpen(false)}
              aria-label="Close Queue"
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* NOW PLAYING SECTION */}
          {currentSong && (
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Now Playing
              </p>
              <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={currentSong.image}
                    alt={currentSong.title}
                    className="w-12 h-12 rounded-xl object-cover shrink-0 shadow-md"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{currentSong.title}</p>
                    <p className="text-xs text-indigo-300 truncate mt-0.5">{currentSong.artist}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span className="w-1.5 h-3 bg-indigo-400 rounded-full animate-bounce" style={{ animationDuration: '0.6s' }} />
                  <span className="w-1.5 h-4 bg-violet-400 rounded-full animate-bounce" style={{ animationDuration: '0.4s' }} />
                  <span className="w-1.5 h-2 bg-indigo-300 rounded-full animate-bounce" style={{ animationDuration: '0.7s' }} />
                </div>
              </div>
            </div>
          )}

          {/* UP NEXT SECTION */}
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Up Next ({Math.max(0, queue.length - 1)})
            </p>

            {queue.length <= 1 ? (
              <div className="p-4 rounded-xl bg-zinc-900/40 border border-white/5 text-center text-xs text-zinc-500">
                No upcoming tracks in queue. Search or click any song to add.
              </div>
            ) : (
              <div className="space-y-1.5">
                {queue.map((song, idx) => {
                  if (idx === currentIndex) return null; // Already shown in Now Playing
                  return (
                    <div
                      key={`${song.id}-${idx}`}
                      className="group flex items-center justify-between gap-2 p-2 rounded-xl bg-zinc-900/40 hover:bg-zinc-800/70 border border-white/5 transition"
                    >
                      <div
                        onClick={() => playSong(song)}
                        className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                      >
                        <img
                          src={song.image}
                          alt={song.title}
                          className="w-10 h-10 rounded-lg object-cover shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-zinc-200 group-hover:text-white truncate">
                            {song.title}
                          </p>
                          <p className="text-[11px] text-zinc-400 truncate">{song.artist}</p>
                        </div>
                      </div>

                      {/* Controls: Move up, Move down, Remove */}
                      <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100">
                        {idx > 0 && (
                          <button
                            onClick={() => reorderQueue(idx, idx - 1)}
                            aria-label="Move Up"
                            className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white transition"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {idx < queue.length - 1 && (
                          <button
                            onClick={() => reorderQueue(idx, idx + 1)}
                            aria-label="Move Down"
                            className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white transition"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => removeFromQueue(idx)}
                          aria-label="Remove from Queue"
                          className="p-1 hover:bg-rose-950/40 rounded text-zinc-400 hover:text-rose-400 transition"
                          title="Remove"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* YOU MAY ALSO LIKE / RECOMMENDATIONS */}
          {suggestions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  You May Also Like
                </p>
              </div>

              <div className="space-y-1.5">
                {suggestions.slice(0, 6).map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 p-2 rounded-xl bg-zinc-900/20 hover:bg-zinc-800/60 border border-white/5 transition"
                  >
                    <div
                      onClick={() => playSong(item)}
                      className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-zinc-200 hover:text-white truncate">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-zinc-400 truncate">{item.artist}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => addToQueue(item)}
                        aria-label="Add to queue"
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
                        title="Add to queue"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => playSong(item)}
                        aria-label="Play now"
                        className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition shadow"
                        title="Play immediately"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
