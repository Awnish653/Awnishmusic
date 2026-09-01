import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Compass, Search, Disc3, Users, Heart } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    {
      name: 'Browse',
      to: '/',
      icon: Compass,
      isActive: (path: string, search: string) => path === '/' && !search.includes('tab=')
    },
    {
      name: 'Search',
      to: '/search',
      icon: Search,
      isActive: (path: string) => path.startsWith('/search')
    },
    {
      name: 'Artists',
      to: '/search?tab=artists',
      icon: Users,
      isActive: (path: string, search: string) => path.startsWith('/artist') || search.includes('tab=artists')
    },
    {
      name: 'Library',
      to: '/library',
      icon: Heart,
      isActive: (path: string) => path.startsWith('/library') || path.startsWith('/liked')
    }
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090A0E]/95 backdrop-blur-2xl border-t border-white/10 px-4 py-2 flex items-center justify-around select-none pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-2xl">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = item.isActive(location.pathname, location.search);

        return (
          <NavLink
            key={item.name}
            to={item.to}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
              active ? 'text-[#E5F939] font-bold' : 'text-[#888890] hover:text-white'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${active ? 'text-[#E5F939]' : 'text-[#888890]'}`} />
              {active && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#E5F939]" />
              )}
            </div>
            <span className="text-[10px] tracking-tight">{item.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
