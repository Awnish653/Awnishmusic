import React from 'react';
import { ChevronLeft, ChevronRight, Search, ListMusic, Zap, Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import { BrandLogo } from './BrandLogo';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { queue, setIsQueueOpen, isQueueOpen, audioQuality } = usePlayer();

  const isSearchPage = location.pathname.startsWith('/search');

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 px-4 sm:px-8 py-3 bg-zinc-950/80 backdrop-blur-2xl border-b border-white/5">
      {/* Mobile Brand Logo / Desktop History Navigation */}
      <div className="flex items-center gap-3">
        <div className="md:hidden">
          <BrandLogo variant="badge" size="xs" onClick={() => navigate('/')} />
        </div>

        <div className="hidden md:flex items-center gap-2">
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
      </div>

      {/* Center Search bar shortcut (if not on search page) */}
      {!isSearchPage && (
        <div
          onClick={() => navigate('/search')}
          className="flex-1 max-w-md mx-2 sm:mx-4 flex items-center gap-2.5 px-4 py-2 rounded-full bg-zinc-900/70 hover:bg-zinc-800/90 border border-white/10 hover:border-indigo-500/40 text-zinc-400 hover:text-zinc-200 cursor-pointer transition shadow-inner group"
        >
          <Search className="w-3.5 h-3.5 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
          <span className="text-xs truncate font-medium">Search any song, artist, album, or playlist...</span>
          <span className="hidden sm:inline-block ml-auto text-[10px] bg-zinc-800/90 text-zinc-400 px-1.5 py-0.5 rounded border border-white/5 font-mono">
            ⌘K
          </span>
        </div>
      )}

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Playing Queue Trigger */}
        <button
          onClick={() => setIsQueueOpen(prev => !prev)}
          aria-label="Toggle Playing Queue"
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
            isQueueOpen
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-zinc-900/80 hover:bg-zinc-800 border-white/10 text-zinc-300 hover:text-white'
          }`}
        >
          <ListMusic className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Queue</span>
          {queue.length > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] font-mono rounded-full bg-white/20 text-white">
              {queue.length}
            </span>
          )}
        </button>

        {/* Live Lossless Audio Indicator Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/50 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>Lossless Stream • {audioQuality}</span>
        </div>
      </div>
    </header>
  );
};
