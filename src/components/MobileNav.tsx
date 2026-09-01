import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Music, Music2, Disc3, Users, Heart } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    {
      name: 'Browse',
      to: '/',
      icon: Music,
      isActive: (path: string, search: string) => path === '/' && !search.includes('tab=')
    },
    {
      name: 'Songs',
      to: '/search?tab=songs',
      icon: Music2,
      isActive: (path: string, search: string) => search.includes('tab=songs')
    },
    {
      name: 'Albums',
      to: '/search?tab=albums',
      icon: Disc3,
      isActive: (path: string, search: string) => path.startsWith('/album') || search.includes('tab=albums')
    },
    {
      name: 'Artists',
      to: '/search?tab=artists',
      icon: Users,
      isActive: (path: string, search: string) => path.startsWith('/artist') || search.includes('tab=artists')
    },
    {
      name: 'My Music',
      to: '/library',
      icon: Heart,
      isActive: (path: string) => path.startsWith('/library') || path.startsWith('/liked')
    }
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080B10]/95 backdrop-blur-2xl border-t border-white/10 px-2 py-2 flex items-center justify-around select-none pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-2xl">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = item.isActive(location.pathname, location.search);

        return (
          <NavLink
            key={item.name}
            to={item.to}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
              active ? 'text-[#F4FF3B] font-bold' : 'text-[#A7A7A7] hover:text-white'
            }`}
          >
            <Icon className={`w-5 h-5 ${active ? 'text-[#F4FF3B]' : 'text-[#A7A7A7]'}`} />
            <span className="text-[10px] tracking-tight">{item.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
