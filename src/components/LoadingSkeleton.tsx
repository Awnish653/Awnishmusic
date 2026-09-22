import React from 'react';

/**
 * Card skeleton with responsive dark/light desktop support
 */
export const CardSkeleton: React.FC<{ circle?: boolean }> = ({ circle }) => (
  <div className="flex flex-col gap-3 p-3 rounded-2xl bg-zinc-900/40 lg:bg-[#F3EFE8] border border-white/5 lg:border-[#E8E5DF] animate-pulse">
    <div className={`w-full aspect-square bg-zinc-800/80 lg:bg-[#E4DFD6] ${circle ? 'rounded-full' : 'rounded-xl'}`} />
    <div className="h-4 bg-zinc-800/80 lg:bg-[#E4DFD6] rounded w-3/4" />
    <div className="h-3 bg-zinc-800/50 lg:bg-[#EBE6DE] rounded w-1/2" />
  </div>
);

/**
 * Single song row skeleton
 */
export const RowSkeleton: React.FC = () => (
  <div className="flex items-center gap-4 p-2.5 rounded-xl bg-zinc-900/30 lg:bg-[#F3EFE8]/70 border border-white/5 lg:border-[#E8E5DF] animate-pulse">
    <div className="w-12 h-12 rounded-lg bg-zinc-800/80 lg:bg-[#E4DFD6] shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-zinc-800/80 lg:bg-[#E4DFD6] rounded w-1/3" />
      <div className="h-3 bg-zinc-800/50 lg:bg-[#EBE6DE] rounded w-1/4" />
    </div>
    <div className="h-3 bg-zinc-800/40 lg:bg-[#EBE6DE] rounded w-12 hidden sm:block" />
  </div>
);

/**
 * Horizontal circular artist row skeleton matching exact Popular Artists layout
 */
export const HorizontalArtistSkeleton: React.FC = () => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <div className="h-6 w-36 rounded bg-zinc-800/80 lg:bg-[#E4DFD6] animate-pulse" />
      <div className="h-4 w-12 rounded bg-zinc-800/50 lg:bg-[#EBE6DE] animate-pulse" />
    </div>
    <div className="flex gap-4 overflow-x-auto pb-3 no-scrollbar">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2.5 shrink-0 animate-pulse">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-zinc-800/80 lg:bg-[#E4DFD6] border border-white/5 lg:border-[#E8E5DF]" />
          <div className="w-16 h-3 rounded bg-zinc-800/60 lg:bg-[#EBE6DE]" />
          <div className="w-10 h-2 rounded bg-zinc-800/40 lg:bg-[#EBE6DE]" />
        </div>
      ))}
    </div>
  </div>
);

/**
 * Genre pills row skeleton
 */
export const GenrePillsSkeleton: React.FC = () => (
  <div className="space-y-3">
    <div className="h-6 w-36 rounded bg-zinc-800/80 lg:bg-[#E4DFD6] animate-pulse" />
    <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="h-8 w-24 rounded-full bg-zinc-800/70 lg:bg-[#E4DFD6] border border-white/5 lg:border-[#E8E5DF] shrink-0 animate-pulse" />
      ))}
    </div>
  </div>
);

/**
 * Curated Playlist Hero Card skeleton matching exact shape, layout, padding & aspect ratio
 */
export const HeroPlaylistSkeleton: React.FC = () => (
  <div className="space-y-2.5">
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#38190F] via-[#261109] to-[#140803] lg:from-[#EFE7DC] lg:via-[#E8DFD3] lg:to-[#E2D8CC] p-4 sm:p-7 lg:p-10 shadow-xl border border-white/10 lg:border-[#E0D7CB] animate-pulse">
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 lg:gap-8">
        <div className="space-y-3 max-w-lg w-full">
          <div className="w-28 h-3.5 rounded bg-[#E5F939]/30 lg:bg-[#18181A]/10" />
          <div className="w-3/4 sm:w-80 h-9 sm:h-12 rounded-xl bg-white/20 lg:bg-black/15" />
          <div className="w-1/2 sm:w-64 h-4 rounded bg-white/15 lg:bg-black/10" />
          <div className="flex items-center gap-3 pt-1">
            <div className="w-24 h-3.5 rounded bg-white/15 lg:bg-black/10" />
            <div className="w-32 h-3.5 rounded bg-white/15 lg:bg-black/10" />
          </div>
          <div className="pt-2">
            <div className="w-28 sm:w-36 h-9 sm:h-11 rounded-full bg-[#E5F939]/40 lg:bg-[#18181A]/20" />
          </div>
        </div>

        <div className="w-36 h-36 sm:w-52 sm:h-52 lg:w-64 lg:h-64 rounded-2xl bg-white/10 lg:bg-black/10 shrink-0 border border-white/10 lg:border-[#D8CFBF]" />
      </div>
    </div>
    <div className="flex lg:hidden items-center justify-center gap-1.5 pt-0.5">
      <span className="w-4 h-1.5 rounded-full bg-[#E5F939]/50" />
      <span className="w-1.5 h-1.5 rounded-full bg-zinc-600/50" />
      <span className="w-1.5 h-1.5 rounded-full bg-zinc-600/50" />
      <span className="w-1.5 h-1.5 rounded-full bg-zinc-600/50" />
    </div>
  </div>
);

export const SectionSkeleton: React.FC<{ count?: number; isCircle?: boolean }> = ({ count = 6, isCircle = false }) => (
  <div className="space-y-4">
    <div className="h-6 bg-zinc-800/70 lg:bg-[#E4DFD6] rounded w-48 animate-pulse" />
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} circle={isCircle} />
      ))}
    </div>
  </div>
);

export const DetailHeroSkeleton: React.FC = () => (
  <div className="flex flex-col md:flex-row gap-6 items-center md:items-end p-6 md:p-8 rounded-3xl bg-zinc-900/40 lg:bg-[#F3EFE8] border border-white/5 lg:border-[#E8E5DF] animate-pulse">
    <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl bg-zinc-800/80 lg:bg-[#E4DFD6] shrink-0 shadow-2xl" />
    <div className="flex-1 space-y-4 text-center md:text-left w-full">
      <div className="h-4 bg-zinc-800/50 lg:bg-[#EBE6DE] rounded w-24 mx-auto md:mx-0" />
      <div className="h-8 bg-zinc-800/80 lg:bg-[#E4DFD6] rounded w-3/4 mx-auto md:mx-0" />
      <div className="h-4 bg-zinc-800/60 lg:bg-[#EBE6DE] rounded w-1/2 mx-auto md:mx-0" />
      <div className="flex gap-3 pt-2 justify-center md:justify-start">
        <div className="w-32 h-10 bg-zinc-800/90 lg:bg-[#18181A]/20 rounded-full" />
        <div className="w-10 h-10 bg-zinc-800/90 lg:bg-[#18181A]/20 rounded-full" />
      </div>
    </div>
  </div>
);
