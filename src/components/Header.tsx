import React, { useState } from 'react';
import {
  Search,
  Bell,
  Settings,
  Shuffle,
  Sparkles,
  Flame,
  Radio,
  User,
  Sliders,
  ChevronLeft,
  ChevronRight,
  ListMusic
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import { BrandLogo } from './BrandLogo';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleShuffle, isShuffled, isQueueOpen, setIsQueueOpen, queue } = usePlayer();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'top' | 'releases' | 'feed' | 'shuffle'>('top');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Determine breadcrumb title based on path
  const getBreadcrumbTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Browse';
    if (path.startsWith('/search')) return 'Search & Explore';
    if (path.startsWith('/library')) return 'Your Library';
    if (path.startsWith('/liked')) return 'Favorite Songs';
    if (path.startsWith('/album')) return 'Album Details';
    if (path.startsWith('/artist')) return 'Artist Spotlight';
    if (path.startsWith('/playlist')) return 'Playlist';
    if (path.startsWith('/song')) return 'Track View';
    return 'Music Stream';
  };

  const handleCategoryClick = (tab: 'top' | 'releases' | 'feed' | 'shuffle') => {
    setActiveTab(tab);
    if (tab === 'top') {
      navigate('/search?q=Top%202024');
    } else if (tab === 'releases') {
      navigate('/search?q=New%20Releases');
    } else if (tab === 'feed') {
      navigate('/search?q=Trending');
    } else if (tab === 'shuffle') {
      toggleShuffle();
    }
  };

  return (
    <>
      {/* DESKTOP TOP NAVIGATION BAR (> 1024px) */}
      <header className="hidden lg:flex items-center justify-between gap-4 px-8 py-4 bg-white border-b border-[#E5E5E5] sticky top-0 z-20 select-none shadow-xs">
        {/* Left: Breadcrumbs & History */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="w-8 h-8 rounded-full bg-[#F5F5F5] hover:bg-[#EAEAEA] text-[#1A1A1A] flex items-center justify-center transition border border-[#E5E5E5]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate(1)}
              aria-label="Go forward"
              className="w-8 h-8 rounded-full bg-[#F5F5F5] hover:bg-[#EAEAEA] text-[#1A1A1A] flex items-center justify-center transition border border-[#E5E5E5]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h1 className="text-xl font-black text-[#1A1A1A] tracking-tight truncate">
            {getBreadcrumbTitle()}
          </h1>
        </div>

        {/* Center: Search Field */}
        <div className="flex-1 max-w-md mx-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search songs, artists, albums, playlists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-[#F5F5F5] border border-[#E5E5E5] text-xs text-[#1A1A1A] placeholder-[#888888] focus:outline-none focus:border-[#1A1A1A] focus:bg-white transition shadow-inner"
            />
          </form>
        </div>

        {/* Right: Quick Navigation Tabs & Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleCategoryClick('releases')}
            className="px-3 py-1.5 rounded-full text-xs font-semibold text-[#555555] hover:text-[#1A1A1A] hover:bg-[#F5F5F5] transition"
          >
            New Releases
          </button>
          <button
            onClick={() => handleCategoryClick('feed')}
            className="px-3 py-1.5 rounded-full text-xs font-semibold text-[#555555] hover:text-[#1A1A1A] hover:bg-[#F5F5F5] transition"
          >
            New Feed
          </button>
          <button
            onClick={() => handleCategoryClick('shuffle')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              isShuffled
                ? 'bg-[#1A1A1A] text-white shadow-sm'
                : 'text-[#555555] hover:text-[#1A1A1A] hover:bg-[#F5F5F5]'
            }`}
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Shuffle Play</span>
          </button>

          <div className="h-5 w-px bg-[#E5E5E5] mx-1" />

          {/* Settings Icon */}
          <button
            onClick={() => navigate('/library?tab=settings')}
            aria-label="Settings"
            className="w-8 h-8 rounded-full bg-[#F5F5F5] hover:bg-[#EAEAEA] text-[#555555] hover:text-[#1A1A1A] flex items-center justify-center transition border border-[#E5E5E5]"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Notification Icon */}
          <button
            aria-label="Notifications"
            className="w-8 h-8 rounded-full bg-[#F5F5F5] hover:bg-[#EAEAEA] text-[#555555] hover:text-[#1A1A1A] flex items-center justify-center transition border border-[#E5E5E5] relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#F4FF3B] border-2 border-white ring-1 ring-black/20" />
          </button>

          {/* User Profile Avatar */}
          <div
            onClick={() => navigate('/library')}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#2D2B2C] to-[#555354] text-white flex items-center justify-center text-xs font-bold ring-2 ring-[#E5E5E5] cursor-pointer hover:scale-105 transition"
            title="Awnish Music Account"
          >
            <User className="w-4 h-4" />
          </div>
        </div>
      </header>

      {/* MOBILE TOP AREA (< 1024px) */}
      <header className="lg:hidden sticky top-0 z-30 bg-[#080B10]/95 backdrop-blur-xl border-b border-white/5 pt-4 pb-1 px-4 select-none">
        {/* Top bar: Large Heading + Notifications + Profile Avatar */}
        <div className="flex items-center justify-between gap-3 mb-3.5">
          <h1 className="text-2xl font-black text-white tracking-tight">
            {getBreadcrumbTitle()}
          </h1>

          <div className="flex items-center gap-3">
            {/* Notification Bell with red badge */}
            <button
              aria-label="Notifications"
              className="p-1 text-zinc-300 hover:text-white flex items-center justify-center relative active:scale-95 transition"
            >
              <Bell className="w-5 h-5 text-zinc-300" />
              <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#FF4D67] ring-2 ring-[#080B10]" />
            </button>

            {/* Profile Avatar */}
            <div
              onClick={() => navigate('/library')}
              className="w-9 h-9 rounded-full overflow-hidden ring-1 ring-white/20 cursor-pointer active:scale-95 transition shadow-sm bg-zinc-800"
            >
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
                alt="User Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>

        {/* Horizontal Category Navigation Tabs */}
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar pt-1">
          {[
            { id: 'top', label: 'Top 2023' },
            { id: 'releases', label: 'New Releases' },
            { id: 'feed', label: 'New Feed' },
            { id: 'shuffle', label: 'Shuffle Play' }
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleCategoryClick(tab.id as any)}
                className={`relative pb-2.5 text-xs font-semibold tracking-wide whitespace-nowrap transition-colors ${
                  isSelected ? 'text-[#F4FF3B] font-bold' : 'text-[#8E8E93] hover:text-zinc-300'
                }`}
              >
                <span>{tab.label}</span>
                {isSelected && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#F4FF3B] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </header>
    </>
  );
};
