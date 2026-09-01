import React, { useState } from 'react';
import { Disc3, ListMusic, Music2, Play, Pause, Trash2, Heart, Download, Sparkles, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import { useLibrary } from '../context/LibraryContext';
import { formatDuration } from '../utils/formatters';
import { ImageWithFallback } from '../utils/image';

export const DesktopNowPlayingPanel: React.FC = () => {
  const navigate = useNavigate();
  const [panelTab, setPanelTab] = useState<'queue' | 'suggestions'>('queue');
  const {
    currentSong,
    isPlaying,
    togglePlay,
    playSong,
    queue,
    currentIndex,
    suggestions,
    addToQueue,
    removeFromQueue,
    clearQueue,
    openDownloadModal
  } = usePlayer();
  const { isSongLiked, toggleLike } = useLibrary();

  const upcomingSongs = queue.slice(currentIndex + 1);
  const liked = currentSong ? isSongLiked(currentSong.id) : false;

  return (
    <aside className="hidden xl:flex flex-col w-80 bg-white border-l border-[#E5E5E5] h-screen shrink-0 sticky top-0 z-20 select-none pb-28 text-[#1A1A1A]">
      {/* Header */}
      <div className="p-6 pb-4 border-b border-[#EFEFEF] flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-[#1A1A1A] tracking-tight">Now Playing</h2>
        {currentSong && (
          <span className="text-[11px] font-semibold text-[#777777] bg-[#F5F5F5] px-2.5 py-1 rounded-full">
            {formatDuration(currentSong.duration)}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
        {/* Main Artwork & Details */}
        {currentSong ? (
          <div className="space-y-4">
            <div
              onClick={() => navigate(`/song/${currentSong.id}`)}
              className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#F0F0F0] shadow-xl group cursor-pointer border border-[#E5E5E5]"
            >
              <ImageWithFallback
                src={currentSong.image}
                alt={currentSong.title}
                fallbackTitle={currentSong.title}
                type="song"
                containerClassName="w-full h-full"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  className="w-14 h-14 rounded-full bg-white text-[#1A1A1A] flex items-center justify-center shadow-2xl transition hover:scale-110 active:scale-95"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Song Meta */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3
                  onClick={() => navigate(`/song/${currentSong.id}`)}
                  className="text-base font-bold text-[#1A1A1A] truncate hover:underline cursor-pointer"
                  title={currentSong.title}
                >
                  {currentSong.title}
                </h3>
                <p
                  onClick={() => {
                    if (currentSong.artists?.[0]?.id) {
                      navigate(`/artist/${currentSong.artists[0].id}`);
                    }
                  }}
                  className="text-xs text-[#777777] truncate mt-0.5 hover:text-[#1A1A1A] cursor-pointer"
                >
                  {currentSong.artist}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => toggleLike(currentSong)}
                  aria-label={liked ? 'Unlike' : 'Like'}
                  className={`p-2 rounded-full transition ${
                    liked ? 'text-rose-500 bg-rose-50' : 'text-[#777777] hover:text-[#1A1A1A] hover:bg-[#F5F5F5]'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500' : ''}`} />
                </button>
                <button
                  onClick={() => openDownloadModal(currentSong)}
                  aria-label="Download song"
                  title="Download Lossless MP3"
                  className="p-2 rounded-full text-[#777777] hover:text-[#1A1A1A] hover:bg-[#F5F5F5] transition"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="aspect-square w-full rounded-2xl bg-[#FAFAFA] border border-dashed border-[#E5E5E5] flex flex-col items-center justify-center text-center p-6 text-[#777777]">
            <Disc3 className="w-10 h-10 text-zinc-300 mb-2" />
            <p className="text-xs font-semibold text-zinc-400">No track playing</p>
            <p className="text-[11px] text-zinc-400 mt-1">Select any song or playlist to start stream</p>
          </div>
        )}

        {/* Tab Switcher: Queue vs Suggestions */}
        <div className="pt-2 border-t border-[#EFEFEF]">
          <div className="flex items-center gap-1 p-1 bg-[#F5F5F5] rounded-xl mb-3">
            <button
              onClick={() => setPanelTab('queue')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                panelTab === 'queue'
                  ? 'bg-white text-[#1A1A1A] shadow-xs'
                  : 'text-[#777777] hover:text-[#1A1A1A]'
              }`}
            >
              <ListMusic className="w-3.5 h-3.5" />
              <span>Queue ({upcomingSongs.length})</span>
            </button>
            <button
              onClick={() => setPanelTab('suggestions')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                panelTab === 'suggestions'
                  ? 'bg-white text-[#1A1A1A] shadow-xs'
                  : 'text-[#777777] hover:text-[#1A1A1A]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Suggestions ({suggestions.length})</span>
            </button>
          </div>

          {/* QUEUE VIEW */}
          {panelTab === 'queue' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                  Upcoming
                </span>
                {queue.length > 0 && (
                  <button
                    onClick={clearQueue}
                    className="text-[11px] text-[#777777] hover:text-rose-500 font-medium transition"
                    title="Clear Queue"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                {upcomingSongs.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#999999] bg-[#FAFAFA] rounded-xl border border-dashed border-[#EFEFEF]">
                    Queue is empty. Songs you play will appear here.
                  </div>
                ) : (
                  upcomingSongs.slice(0, 8).map((song, idx) => (
                    <div
                      key={`${song.id}-${idx}`}
                      onClick={() => playSong(song, queue)}
                      className="group flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-[#F5F5F5] transition cursor-pointer border border-transparent hover:border-[#EAEAEA]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <ImageWithFallback
                          src={song.image}
                          alt={song.title}
                          fallbackTitle={song.title}
                          type="song"
                          containerClassName="w-10 h-10 rounded-lg shrink-0 overflow-hidden bg-zinc-100 shadow-sm"
                          className="w-full h-full object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#1A1A1A] truncate group-hover:text-indigo-600">
                            {song.title}
                          </p>
                          <p className="text-[11px] text-[#777777] truncate mt-0.5">
                            {song.artist}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                        <span className="text-[11px] font-mono text-[#999999]">
                          {formatDuration(song.duration)}
                        </span>
                        <button
                          onClick={() => removeFromQueue(currentIndex + 1 + idx)}
                          className="p-1 rounded-md text-[#AAAAAA] hover:text-rose-500 hover:bg-white transition opacity-0 group-hover:opacity-100"
                          title="Remove from queue"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* SUGGESTIONS VIEW */}
          {panelTab === 'suggestions' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                  Recommended For You
                </span>
              </div>

              <div className="space-y-1.5">
                {suggestions.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#999999] bg-[#FAFAFA] rounded-xl border border-dashed border-[#EFEFEF]">
                    No suggestions available for this track.
                  </div>
                ) : (
                  suggestions.slice(0, 8).map((song) => (
                    <div
                      key={`panel-sug-${song.id}`}
                      className="group flex items-center justify-between gap-2.5 p-2 rounded-xl hover:bg-[#F5F5F5] transition cursor-pointer border border-transparent hover:border-[#EAEAEA]"
                    >
                      <div
                        onClick={() => playSong(song, suggestions)}
                        className="flex items-center gap-2.5 min-w-0 flex-1"
                      >
                        <ImageWithFallback
                          src={song.image}
                          alt={song.title}
                          fallbackTitle={song.title}
                          type="song"
                          containerClassName="w-10 h-10 rounded-lg shrink-0 overflow-hidden bg-zinc-100 shadow-sm"
                          className="w-full h-full object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#1A1A1A] truncate group-hover:text-indigo-600">
                            {song.title}
                          </p>
                          <p className="text-[11px] text-[#777777] truncate mt-0.5">
                            {song.artist}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => addToQueue(song)}
                          className="p-1.5 rounded-lg bg-[#F5F5F5] hover:bg-[#EAEAEA] text-[#555555] transition"
                          title="Add to queue"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => playSong(song, suggestions)}
                          className="p-1.5 rounded-lg bg-[#1A1A1A] hover:bg-black text-white transition shadow-xs"
                          title="Play now"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
