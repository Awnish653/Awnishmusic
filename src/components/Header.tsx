import React from 'react';
import { ChevronLeft, ChevronRight, Search, ListMusic, Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { queue, setIsQueueOpen, isQueueOpen } = usePlayer();

  const isSearchPage = location.pathname.startsWith('/search');

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 px-4 sm:px-8 py-3 bg-zinc-950/70 backdrop-blur-xl border-b border-white/5">
      {/* History Navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="w-8 h-8 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center border border-white/5 transition"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => navigate(1)}
          aria-label="Go forward"
          className="w-8 h-8 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center border border-white/5 transition"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Center Search bar shortcut (if not on search page) */}
      {!isSearchPage && (
        <div
          onClick={() => navigate('/search')}
          className="hidden sm:flex items-center gap-2.5 px-4 py-2 rounded-full bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/5 hover:border-white/15 text-zinc-400 hover:text-zinc-200 cursor-pointer w-full max-w-sm transition"
        >
          <Search className="w-4 h-4 text-zinc-500" />
          <span className="text-xs truncate">Search songs, artists, albums, or playlists...</span>
        </div>
      )}

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Playing Queue Trigger */}
        <button
          onClick={() => setIsQueueOpen(prev => !prev)}
          aria-label="Toggle Playing Queue"
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
            isQueueOpen
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-zinc-900/80 hover:bg-zinc-800 border-white/10 text-zinc-300 hover:text-white'
          }`}
        >
          <ListMusic className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Queue</span>
          {queue.length > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] font-mono rounded-full bg-white/20">
              {queue.length}
            </span>
          )}
        </button>

        {/* Live Status Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>JioSaavn Core Connected</span>
        </div>
      </div>
    </header>
  );
};
