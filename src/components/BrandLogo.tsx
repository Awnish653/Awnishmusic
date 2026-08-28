import React from 'react';

interface BrandLogoProps {
  variant?: 'full' | 'compact' | 'minimal' | 'badge';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'full',
  size = 'md',
  animated = false,
  className = '',
  onClick
}) => {
  const sizeMap = {
    xs: { icon: 'w-6 h-6', text: 'text-sm', sub: 'text-[9px]', gap: 'gap-1.5' },
    sm: { icon: 'w-8 h-8', text: 'text-base', sub: 'text-[10px]', gap: 'gap-2' },
    md: { icon: 'w-10 h-10', text: 'text-xl', sub: 'text-[11px]', gap: 'gap-2.5' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl', sub: 'text-xs', gap: 'gap-3' },
    xl: { icon: 'w-16 h-16', text: 'text-3xl', sub: 'text-sm', gap: 'gap-3.5' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const IconGraphic = (
    <div
      className={`relative ${currentSize.icon} shrink-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-0.5 shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-all duration-300`}
    >
      {/* Inner background with futuristic glass/mesh depth */}
      <div className="w-full h-full rounded-[14px] bg-zinc-950/80 backdrop-blur-md flex items-center justify-center relative overflow-hidden">
        {/* Glow orb in background */}
        <div className="absolute -top-2 -left-2 w-8 h-8 bg-cyan-400/30 rounded-full blur-sm" />
        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-fuchsia-500/30 rounded-full blur-sm" />

        {/* Custom Abstract 'A' + 'X' + Soundwaves Icon */}
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1.5 relative z-10"
        >
          <defs>
            <linearGradient id="axGradPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
            <linearGradient id="axGradSecondary" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="50%" stopColor="#d946ef" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>

          {/* Equalizer Frequency Pillars in background */}
          <rect x="6" y="16" width="2" height="8" rx="1" fill="url(#axGradPrimary)" opacity="0.4" />
          <rect x="32" y="15" width="2" height="10" rx="1" fill="url(#axGradSecondary)" opacity="0.4" />

          {/* Futuristic 'A' Apex and Cross Nexus forming an 'X' */}
          {/* Left leg of A / Top-Left to Bottom-Right beam */}
          <path
            d="M 12 32 L 20 8 L 28 32"
            stroke="url(#axGradPrimary)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Glowing 'X' Crossing Wing with Soundwave Notch */}
          <path
            d="M 11 22 L 29 22"
            stroke="url(#axGradSecondary)"
            strokeWidth="2.8"
            strokeLinecap="round"
          />

          {/* Central Pulsing Audio Core Node */}
          <circle cx="20" cy="18" r="2.2" fill="#ffffff" className={animated ? 'animate-ping' : ''} />
          <circle cx="20" cy="18" r="1.5" fill="url(#axGradPrimary)" />

          {/* Dynamic Sound Beams extending from the core */}
          <path
            d="M 15 22 L 25 22"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );

  if (variant === 'compact' || variant === 'minimal') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center group cursor-pointer ${className}`}
        title="AwnishX Music"
      >
        {IconGraphic}
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-white/10 backdrop-blur-md text-zinc-200 hover:border-indigo-500/40 transition cursor-pointer ${className}`}
      >
        {IconGraphic}
        <span className="text-xs font-semibold font-display tracking-tight text-white">
          Awnish<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">X</span>
        </span>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center ${currentSize.gap} group cursor-pointer select-none ${className}`}
    >
      {IconGraphic}
      <div className="flex flex-col">
        <div className={`font-black font-display tracking-tight text-white flex items-center leading-none ${currentSize.text}`}>
          <span>Awnish</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 ml-0.5">
            X
          </span>
          <span className="ml-1.5 font-light text-zinc-300">Music</span>
        </div>
        <div className={`flex items-center gap-1 text-zinc-400 uppercase font-bold tracking-widest leading-none mt-1 ${currentSize.sub}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>Lossless Stream</span>
        </div>
      </div>
    </div>
  );
};
