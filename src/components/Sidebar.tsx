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
  Zap,
  Check,
  Headphones
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { usePlayer } from '../context/PlayerContext';
import { AudioQualityKey } from '../types/music';
import { BrandLogo } from './BrandLogo';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userPlaylists, createPlaylist } = useLibrary();
  const { audioQuality, setAudioQuality } = usePlayer();
  const [showQualityMenu, setShowQualityMenu] = React.useState(false);

  const handleCreatePlaylist = () => {
    const defaultName = `Playlist #${userPlaylists.length + 1}`;
    const newPl = createPlaylist(defaultName);
    navigate(`/playlist/custom/${newPl.id}`);
  };

  const qualities: AudioQualityKey[] = ['320kbps', '160kbps', '96kbps', '48kbps', '12kbps'];

  const libraryItems = [
    {
      name: 'Browse',
      to: '/',
      icon: Compass,
      exact: true,
      isActiveMatch: (path: string, search: string) => path === '/'
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
      name: 'Local File',
      to: '/library?tab=local',
      icon: FolderSync,
      isActiveMatch: (path: string, search: string) => path === '/library' && search.includes('tab=local')
    }
  ];

  return (
    <aside className="hidden lg:flex flex-col w-60 bg-[#2D2B2C] text-white shrink-0 sticky top-0 h-screen z-30 select-none pb-28 border-r border-[#3C3A3B] shadow-2xl">
      {/* Brand Header */}
      <div className="p-6 pb-4">
        <NavLink to="/" className="inline-block group">
          <BrandLogo variant="full" size="md" />
        </NavLink>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6 no-scrollbar">
        {/* Section 1: Library */}
        <div className="space-y-1.5">
          <div className="px-3 text-[11px] font-bold text-zinc-400 tracking-wider uppercase mb-2">
            Library
          </div>
          {libraryItems.map(item => {
            const Icon = item.icon;
            const active = item.isActiveMatch(location.pathname, location.search);
            return (
              <NavLink
                key={item.name}
                to={item.to}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                  active
                    ? 'bg-[#1E1D1E] text-[#F4FF3B] font-bold shadow-md'
                    : 'text-zinc-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-[#F4FF3B]' : 'text-zinc-400'}`} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Section 2: My Music */}
        <div className="space-y-1.5">
          <div className="px-3 text-[11px] font-bold text-zinc-400 tracking-wider uppercase mb-2">
            My Music
          </div>
          {myMusicItems.map(item => {
            const Icon = item.icon;
            const active = item.isActiveMatch(location.pathname, location.search);
            return (
              <NavLink
                key={item.name}
                to={item.to}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                  active
                    ? 'bg-[#1E1D1E] text-[#F4FF3B] font-bold shadow-md'
                    : 'text-zinc-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-[#F4FF3B]' : 'text-zinc-400'}`} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Section 3: Playlists */}
        <div className="space-y-1.5 pt-2 border-t border-white/5">
          <div className="flex items-center justify-between px-3 text-[11px] font-bold text-zinc-400 tracking-wider uppercase mb-2">
            <span>Playlists</span>
            <button
              onClick={handleCreatePlaylist}
              className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition"
              title="Create Playlist"
            >
              <PlusCircle className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-0.5">
            {userPlaylists.length === 0 ? (
              <button
                onClick={handleCreatePlaylist}
                className="w-full text-left px-3 py-2 text-xs text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition flex items-center gap-2"
              >
                <PlusCircle className="w-3.5 h-3.5 text-zinc-400" />
                <span>New playlist</span>
              </button>
            ) : (
              userPlaylists.map(pl => (
                <NavLink
                  key={pl.id}
                  to={`/playlist/custom/${pl.id}`}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium truncate transition ${
                      isActive
                        ? 'text-[#F4FF3B] bg-[#1E1D1E] font-semibold'
                        : 'text-zinc-300 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <ListMusic className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                  <span className="truncate">{pl.name}</span>
                </NavLink>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Audio Fidelity Controller */}
      <div className="p-3 border-t border-[#3C3A3B] bg-[#242223]">
        <div className="relative">
          <button
            onClick={() => setShowQualityMenu(!showQualityMenu)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#1E1D1E] hover:bg-black/30 text-xs text-zinc-300 transition border border-white/5"
          >
            <div className="flex items-center gap-2">
              <Headphones className="w-3.5 h-3.5 text-[#F4FF3B]" />
              <span className="truncate">Bitrate: <strong className="text-white font-mono">{audioQuality}</strong></span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-[#F4FF3B] font-mono">
              Hi-Fi
            </span>
          </button>

          {showQualityMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowQualityMenu(false)} />
              <div className="absolute left-0 bottom-full mb-2 w-full p-1.5 bg-[#1E1D1E] border border-white/10 rounded-2xl shadow-2xl z-50 text-xs">
                <p className="text-[10px] font-semibold text-zinc-400 px-2 py-1 uppercase tracking-wider">
                  Audio Quality
                </p>
                {qualities.map(q => (
                  <button
                    key={q}
                    onClick={() => {
                      setAudioQuality(q);
                      setShowQualityMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition ${
                      audioQuality === q ? 'bg-white/15 text-[#F4FF3B] font-bold' : 'text-zinc-300 hover:bg-white/5'
                    }`}
                  >
                    <span>{q}</span>
                    {audioQuality === q && <Check className="w-3.5 h-3.5 text-[#F4FF3B]" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};
