import React from 'react';

export const CardSkeleton: React.FC<{ circle?: boolean }> = ({ circle }) => (
  <div className="flex flex-col gap-3 p-3 rounded-2xl bg-zinc-900/40 border border-white/5 animate-pulse">
    <div className={`w-full aspect-square bg-zinc-800/80 ${circle ? 'rounded-full' : 'rounded-xl'}`} />
    <div className="h-4 bg-zinc-800/80 rounded w-3/4" />
    <div className="h-3 bg-zinc-800/50 rounded w-1/2" />
  </div>
);

export const RowSkeleton: React.FC = () => (
  <div className="flex items-center gap-4 p-2.5 rounded-xl bg-zinc-900/30 border border-white/5 animate-pulse">
    <div className="w-12 h-12 rounded-lg bg-zinc-800/80 shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-zinc-800/80 rounded w-1/3" />
      <div className="h-3 bg-zinc-800/50 rounded w-1/4" />
    </div>
    <div className="h-3 bg-zinc-800/40 rounded w-12 hidden sm:block" />
  </div>
);

export const SectionSkeleton: React.FC<{ count?: number; isCircle?: boolean }> = ({ count = 5, isCircle = false }) => (
  <div className="space-y-4">
    <div className="h-6 bg-zinc-800/70 rounded w-48 animate-pulse" />
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} circle={isCircle} />
      ))}
    </div>
  </div>
);

export const DetailHeroSkeleton: React.FC = () => (
  <div className="flex flex-col md:flex-row gap-6 items-center md:items-end p-6 md:p-8 rounded-3xl bg-zinc-900/40 border border-white/5 animate-pulse">
    <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl bg-zinc-800/80 shrink-0 shadow-2xl" />
    <div className="flex-1 space-y-4 text-center md:text-left w-full">
      <div className="h-4 bg-zinc-800/50 rounded w-24 mx-auto md:mx-0" />
      <div className="h-8 bg-zinc-800/80 rounded w-3/4 mx-auto md:mx-0" />
      <div className="h-4 bg-zinc-800/60 rounded w-1/2 mx-auto md:mx-0" />
      <div className="flex gap-3 pt-2 justify-center md:justify-start">
        <div className="w-32 h-10 bg-zinc-800/90 rounded-full" />
        <div className="w-10 h-10 bg-zinc-800/90 rounded-full" />
      </div>
    </div>
  </div>
);
