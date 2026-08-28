import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Search,
  Library,
  Heart,
  PlusCircle,
  Music2,
  Sliders,
  Check,
  Zap,
  ListMusic
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { usePlayer } from '../context/PlayerContext';
import { AudioQualityKey } from '../types/music';
import { BrandLogo } from './BrandLogo';
import { ImageWithFallback } from '../utils/image';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { userPlaylists, createPlaylist, recentlyPlayed } = useLibrary();
  const { audioQuality, setAudioQuality } = usePlayer();
  const [showQualityMenu, setShowQualityMenu] = React.useState(false);

  const handleCreatePlaylist = () => {
    const defaultName = `Playlist #${userPlaylists.length + 1}`;
    const newPl = createPlaylist(defaultName);
    navigate(`/playlist/custom/${newPl.id}`);
  };

  const qualities: AudioQualityKey[] = ['320kbps', '160kbps', '96kbps', '48kbps', '12kbps'];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-zinc-950/90 backdrop-blur-2xl border-r border-white/5 h-screen shrink-0 sticky top-0 z-30 select-none pb-28">
      {/* Brand Header */}
      <div className="p-6 pb-5">
        <NavLink to="/" className="inline-block group">
          <BrandLogo variant="full" size="md" />
        </NavLink>
      </div>

      {/* Main Navigation */}
      <div className="px-3 py-1 space-y-1">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              isActive
                ? 'bg-gradient-to-r from-indigo-600/25 via-violet-600/20 to-transparent text-white border-l-2 border-indigo-500 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
            }`
          }
        >
          <Home className="w-4 h-4 text-indigo-400" />
          <span>Discover</span>
        </NavLink>

        <NavLink
          to="/search"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              isActive
                ? 'bg-gradient-to-r from-indigo-600/25 via-violet-600/20 to-transparent text-white border-l-2 border-indigo-500 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
            }`
          }
        >
          <Search className="w-4 h-4 text-cyan-400" />
          <span>Search & Explore</span>
        </NavLink>

        <NavLink
          to="/library"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              isActive
                ? 'bg-gradient-to-r from-indigo-600/25 via-violet-600/20 to-transparent text-white border-l-2 border-indigo-500 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
            }`
          }
        >
          <Library className="w-4 h-4 text-violet-400" />
          <span>Your Library</span>
        </NavLink>

        <NavLink
          to="/liked"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              isActive
                ? 'bg-gradient-to-r from-rose-600/25 via-violet-600/20 to-transparent text-white border-l-2 border-rose-500 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
            }`
          }
        >
          <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-rose-500 to-violet-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-rose-500/30">
            <Heart className="w-3 h-3 fill-white" />
          </div>
          <span>Liked Songs</span>
        </NavLink>
      </div>

      <div className="my-3 mx-4 border-t border-white/5" />

      {/* Playlists & Recents Scrollable Area */}
      <div className="flex-1 px-3 overflow-y-auto space-y-4 pr-2">
        {/* Custom Playlists */}
        <div>
          <div className="flex items-center justify-between px-3 py-1 mb-1">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Playlists</span>
            <button
              onClick={handleCreatePlaylist}
              className="text-zinc-400 hover:text-white transition p-1 hover:bg-zinc-900 rounded-lg"
              title="Create New Playlist"
            >
              <PlusCircle className="w-4 h-4 text-indigo-400" />
            </button>
          </div>

          <div className="space-y-0.5">
            {userPlaylists.length === 0 ? (
              <button
                onClick={handleCreatePlaylist}
                className="w-full text-left px-3 py-2 text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40 rounded-xl transition flex items-center gap-2"
              >
                <PlusCircle className="w-3.5 h-3.5 text-zinc-500" />
                <span>Create first playlist</span>
              </button>
            ) : (
              userPlaylists.map(pl => (
                <NavLink
                  key={pl.id}
                  to={`/playlist/custom/${pl.id}`}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium truncate transition ${
                      isActive
                        ? 'text-indigo-400 bg-zinc-900 font-semibold'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                    }`
                  }
                >
                  <ListMusic className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
                  <span className="truncate">{pl.name}</span>
                </NavLink>
              ))
            )}
          </div>
        </div>

        {/* Recently Played shortcuts */}
        {recentlyPlayed.length > 0 && (
          <div>
            <div className="px-3 py-1 mb-1">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Recent History</span>
            </div>
            <div className="space-y-0.5">
              {recentlyPlayed.slice(0, 5).map(song => (
                <div
                  key={song.id}
                  onClick={() => navigate(`/song/${song.id}`)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-zinc-900/50 transition cursor-pointer group"
                >
                  <ImageWithFallback
                    src={song.image}
                    alt={song.title}
                    fallbackTitle={song.title}
                    type="song"
                    containerClassName="w-5 h-5 rounded-md shrink-0"
                    className="w-full h-full object-cover"
                  />
                  <span className="truncate flex-1 group-hover:text-zinc-200">{song.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer / Audio Quality Settings */}
      <div className="p-3 border-t border-white/5 bg-zinc-950/60">
        <div className="relative">
          <button
            onClick={() => setShowQualityMenu(!showQualityMenu)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-900/60 hover:bg-zinc-800 border border-white/5 text-xs text-zinc-300 transition"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Bitrate: <strong className="text-white">{audioQuality}</strong></span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950/80 text-indigo-300 font-mono border border-indigo-500/20">
              Lossless
            </span>
          </button>

          {showQualityMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowQualityMenu(false)} />
              <div className="absolute left-0 bottom-full mb-2 w-full p-1.5 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-50 text-xs">
                <p className="text-[10px] font-semibold text-zinc-400 px-2 py-1 uppercase tracking-wider">
                  Audio Fidelity
                </p>
                {qualities.map(q => (
                  <button
                    key={q}
                    onClick={() => {
                      setAudioQuality(q);
                      setShowQualityMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition ${
                      audioQuality === q ? 'bg-indigo-600/30 text-indigo-300 font-bold' : 'text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <span>{q}</span>
                    {audioQuality === q && <Check className="w-3 h-3 text-indigo-400" />}
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
