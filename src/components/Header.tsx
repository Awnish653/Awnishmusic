import React, { useState, useRef, useEffect } from 'react';
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
  ListMusic,
  X
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import { BrandLogo } from './BrandLogo';
import { SearchSuggestionsDropdown } from './SearchSuggestionsDropdown';
import { USER_AVATAR_SRC } from '../utils/image';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleShuffle, isShuffled, isQueueOpen, setIsQueueOpen, queue } = usePlayer();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'top' | 'releases' | 'feed' | 'shuffle'>('top');
  
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(e.target as Node)
      ) {
        setIsMobileSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsDropdownOpen(false);
      setIsMobileSearchOpen(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Determine breadcrumb title based on path
  const getBreadcrumbTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'awnishxmusic';
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
      <header className="hidden lg:flex items-center justify-between gap-4 px-8 py-4 bg-white border-b border-[#E5E5E5] sticky top-0 z-40 select-none shadow-xs">
        {/* Left: Breadcrumbs & History */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="w-8 h-8 rounded-full bg-[#FAF8F5] hover:bg-[#EFECE6] text-[#18181A] flex items-center justify-center transition border border-[#E8E5DF]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate(1)}
              aria-label="Go forward"
              className="w-8 h-8 rounded-full bg-[#FAF8F5] hover:bg-[#EFECE6] text-[#18181A] flex items-center justify-center transition border border-[#E8E5DF]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm text-[#787679]">
            <span className="cursor-pointer hover:text-black transition font-medium" onClick={() => navigate('/')}>Home</span>
            <span>&gt;</span>
            <h1 className="text-base font-bold font-serif-italic text-[#18181A] tracking-tight truncate">
              {getBreadcrumbTitle()}
            </h1>
          </div>
        </div>

        {/* Center: Search Field with Auto-Suggestions Dropdown */}
        <div className="flex-1 max-w-md mx-4 relative" ref={searchContainerRef}>
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-[#888890] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search songs, artists, albums..."
              value={searchQuery}
              onFocus={() => setIsDropdownOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!isDropdownOpen) setIsDropdownOpen(true);
              }}
              className="w-full pl-10 pr-8 py-2 rounded-full bg-[#FAF8F5] border border-[#E8E5DF] text-xs text-[#18181A] placeholder-[#888890] focus:outline-none focus:border-[#18181A] focus:bg-white transition shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Instant Auto-Suggestions Dropdown */}
          <SearchSuggestionsDropdown
            query={searchQuery}
            isOpen={isDropdownOpen}
            onClose={() => setIsDropdownOpen(false)}
            onSelectSuggestion={(term) => {
              setSearchQuery(term);
              setIsDropdownOpen(false);
              navigate(`/search?q=${encodeURIComponent(term)}`);
            }}
            isDark={false}
          />
        </div>

        {/* Right: Quick Navigation Tabs & Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleCategoryClick('releases')}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#555558] hover:text-[#18181A] hover:bg-[#FAF8F5] transition"
          >
            New Releases
          </button>
          <button
            onClick={() => handleCategoryClick('feed')}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#555558] hover:text-[#18181A] hover:bg-[#FAF8F5] transition"
          >
            New Feed
          </button>
          <button
            onClick={() => handleCategoryClick('shuffle')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
              isShuffled
                ? 'bg-[#18181A] text-white shadow-xs'
                : 'text-[#555558] hover:text-[#18181A] hover:bg-[#FAF8F5]'
            }`}
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Shuffle Play</span>
          </button>

          <div className="h-5 w-px bg-[#E8E5DF] mx-1" />

          {/* Settings Icon */}
          <button
            onClick={() => navigate('/library?tab=settings')}
            aria-label="Settings"
            className="w-8 h-8 rounded-full bg-[#FAF8F5] hover:bg-[#EFECE6] text-[#555558] hover:text-[#18181A] flex items-center justify-center transition border border-[#E8E5DF]"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Notification Icon */}
          <button
            aria-label="Notifications"
            className="w-8 h-8 rounded-full bg-[#FAF8F5] hover:bg-[#EFECE6] text-[#555558] hover:text-[#18181A] flex items-center justify-center transition border border-[#E8E5DF] relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E5F939] border-2 border-white ring-1 ring-black/20" />
          </button>

          {/* User Profile Avatar */}
          <div
            onClick={() => navigate('/library')}
            className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-[#E8E5DF] cursor-pointer hover:scale-105 transition bg-[#143454] shadow-2xs flex items-center justify-center"
            title="User Profile (AwnishX)"
          >
            <img
              src={USER_AVATAR_SRC}
              alt="User Avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </header>

      {/* MOBILE TOP AREA (< 1024px) */}
      <header className="lg:hidden sticky top-0 z-30 bg-[#0D0E12]/95 backdrop-blur-xl border-b border-white/5 pt-4 pb-1 px-4 select-none">
        {/* Top bar: Large Heading + Search Icon + Notifications + Profile Avatar */}
        <div className="flex items-center justify-between gap-3 mb-2">
          <h1 className="text-2xl font-serif-italic font-bold text-white tracking-tight">
            {getBreadcrumbTitle()}
          </h1>

          <div className="flex items-center gap-2.5">
            {/* Quick Search Button */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              aria-label="Search"
              className="p-1.5 text-zinc-300 hover:text-white flex items-center justify-center active:scale-95 transition"
            >
              <Search className="w-5 h-5 text-zinc-300" />
            </button>

            {/* Notification Bell with badge */}
            <button
              aria-label="Notifications"
              className="p-1.5 text-zinc-300 hover:text-white flex items-center justify-center relative active:scale-95 transition"
            >
              <Bell className="w-5 h-5 text-zinc-300" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#E5F939] ring-2 ring-[#0D0E12]" />
            </button>

            {/* Profile Avatar */}
            <div
              onClick={() => navigate('/library')}
              className="w-8 h-8 rounded-full overflow-hidden ring-1.5 ring-white/30 cursor-pointer active:scale-95 transition shadow-xs bg-[#143454] flex items-center justify-center"
              title="User Profile (AwnishX)"
            >
              <img
                src={USER_AVATAR_SRC}
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Expandable Mobile Search Bar with Auto Suggestions */}
        {isMobileSearchOpen && (
          <div className="relative mb-3 animate-in fade-in slide-in-from-top-1" ref={mobileSearchRef}>
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search songs, artists, albums..."
                value={searchQuery}
                autoFocus
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 rounded-2xl bg-[#151820] border border-white/15 text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-[#E5F939] transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            <SearchSuggestionsDropdown
              query={searchQuery}
              isOpen={isMobileSearchOpen}
              onClose={() => setIsMobileSearchOpen(false)}
              onSelectSuggestion={(term) => {
                setSearchQuery(term);
                setIsMobileSearchOpen(false);
                navigate(`/search?q=${encodeURIComponent(term)}`);
              }}
              isDark={true}
            />
          </div>
        )}

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
                  isSelected ? 'text-[#E5F939] font-bold' : 'text-[#888890] hover:text-zinc-300'
                }`}
              >
                <span>{tab.label}</span>
                {isSelected && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#E5F939] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </header>
    </>
  );
};
