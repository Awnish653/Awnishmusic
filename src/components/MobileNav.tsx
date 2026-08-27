import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Library, Heart } from 'lucide-react';

export const MobileNav: React.FC = () => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-t border-white/10 px-4 py-2 flex items-center justify-around">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            isActive ? 'text-indigo-400 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
          }`
        }
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px]">Home</span>
      </NavLink>

      <NavLink
        to="/search"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            isActive ? 'text-indigo-400 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
          }`
        }
      >
        <Search className="w-5 h-5" />
        <span className="text-[10px]">Search</span>
      </NavLink>

      <NavLink
        to="/library"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            isActive ? 'text-indigo-400 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
          }`
        }
      >
        <Library className="w-5 h-5" />
        <span className="text-[10px]">Library</span>
      </NavLink>

      <NavLink
        to="/liked"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            isActive ? 'text-rose-400 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
          }`
        }
      >
        <Heart className="w-5 h-5" />
        <span className="text-[10px]">Liked</span>
      </NavLink>
    </nav>
  );
};
