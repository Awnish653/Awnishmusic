import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Compass,
  Music,
  Disc3,
  Users,
  Radio,
  Clock,
  Heart,
  FolderSync,
  PlusCircle,
  ListMusic,
  Play,
  Pause,
  Sparkles
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { usePlayer } from '../context/PlayerContext';
import { BrandLogo } from './BrandLogo';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userPlaylists, createPlaylist, likedSongs } = useLibrary();
  const { isPlaying, togglePlay, playSong } = usePlayer();

  const handleCreatePlaylist = () => {
    const defaultName = `Playlist #${userPlaylists.length + 1}`;
    const newPl = createPlaylist(defaultName);
    navigate(`/playlist/custom/${newPl.id}`);
  };

  const handlePlayDailyMix = () => {
    if (likedSongs.length > 0) {
      playSong(likedSongs[0], likedSongs);
    } else {
      navigate('/search?q=Daily%20Mix');
    }
  };

  const libraryItems = [
    {
      name: 'Browse',
      to: '/',
      icon: Compass,
      isActiveMatch: (path: string, search: string) => path === '/' && !search.includes('tab=')
    },
    {
      name: 'Songs',
      to: '/search?tab=songs',
      icon: Music,
      isActiveMatch: (path: string, search: string) => search.includes('tab=songs')
    },
    {
      name: 'Albums',
      to: '/search?tab=albums',
      icon: Disc3,
      isActiveMatch: (path: string, search: string) => path.startsWith('/album') || search.includes('tab=albums')
    },
    {
      name: 'Artists',
      to: '/search?tab=artists',
      icon: Users,
      isActiveMatch: (path: string, search: string) => path.startsWith('/artist') || search.includes('tab=artists')
    },
    {
      name: 'Radio',
      to: '/search?q=Radio',
      icon: Radio,
      isActiveMatch: (path: string, search: string) => search.includes('Radio')
    }
  ];

  const myMusicItems = [
    {
      name: 'Recently Played',
      to: '/library?tab=history',
      icon: Clock,
      isActiveMatch: (path: string, search: string) => path === '/library' && (search.includes('tab=history') || !search.includes('tab='))
    },
    {
      name: 'Favorite Songs',
      to: '/liked',
      icon: Heart,
      isActiveMatch: (path: string) => path === '/liked'
    },
    {
      name: 'Local Files',
      to: '/library?tab=local',
      icon: FolderSync,
      isActiveMatch: (path: string, search: string) => path === '/library' && search.includes('tab=local')
    },
    {
      name: 'Playlists',
      to: '/library?tab=playlists',
      icon: ListMusic,
      isActiveMatch: (path: string, search: string) => path === '/library' && search.includes('tab=playlists')
    }
  ];

  return (
    <aside className="hidden lg:flex flex-col w-56 xl:w-60 bg-[#141416] text-[#FAF8F5] shrink-0 sticky top-0 h-screen z-30 select-none pb-24 border-r border-[#222226] shadow-2xl">
      {/* Brand Header: Melovia */}
      <div className="px-6 pt-7 pb-5">
        <NavLink to="/" className="inline-block group">
          <BrandLogo variant="full" size="md" />
        </NavLink>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6 no-scrollbar">
        {/* Section 1: LIBRARY */}
        <div className="space-y-1">
          <div className="px-3.5 text-[10px] font-bold text-[#888890] tracking-widest uppercase mb-2">
            LIBRARY
          </div>
          {libraryItems.map(item => {
            const Icon = item.icon;
            const active = item.isActiveMatch(location.pathname, location.search);
            return (
              <NavLink
                key={item.name}
                to={item.to}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${
                  active
                    ? 'bg-[#222226] text-[#E5F939] font-bold shadow-sm'
                    : 'text-[#A0A0A8] hover:text-[#FAF8F5] hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-[#E5F939]' : 'text-[#888890]'}`} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Section 2: MY MUSIC */}
        <div className="space-y-1">
          <div className="px-3.5 text-[10px] font-bold text-[#888890] tracking-widest uppercase mb-2">
            MY MUSIC
          </div>
          {myMusicItems.map(item => {
            const Icon = item.icon;
            const active = item.isActiveMatch(location.pathname, location.search);
            return (
              <NavLink
                key={item.name}
                to={item.to}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${
                  active
                    ? 'bg-[#222226] text-[#E5F939] font-bold shadow-sm'
                    : 'text-[#A0A0A8] hover:text-[#FAF8F5] hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-[#E5F939]' : 'text-[#888890]'}`} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Daily Mix Mini Card at Sidebar Bottom */}
      <div className="p-3 mx-3 mb-2 rounded-2xl bg-[#1C1C20] border border-white/5 flex items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-tr from-purple-900 via-indigo-800 to-amber-700 shrink-0 relative flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4 text-[#E5F939] animate-pulse" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-serif-title font-bold text-white truncate">
              Daily Mix
            </span>
            <span className="text-[10px] font-serif-italic text-[#888890] truncate">
              Your daily playlist
            </span>
          </div>
        </div>

        <button
          onClick={handlePlayDailyMix}
          aria-label="Play Daily Mix"
          className="w-8 h-8 rounded-full bg-[#E5F939] text-black flex items-center justify-center shrink-0 shadow-md hover:scale-105 active:scale-95 transition"
        >
          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
        </button>
      </div>
    </aside>
  );
};

