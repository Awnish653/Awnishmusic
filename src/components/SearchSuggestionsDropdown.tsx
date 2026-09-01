import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Music2,
  Mic2,
  Disc3,
  Play,
  Flame,
  Clock,
  ArrowRight,
  TrendingUp,
  X
} from 'lucide-react';
import { search } from '../services/api';
import { SearchResults, Song, Artist, Album } from '../types/music';
import { usePlayer } from '../context/PlayerContext';
import { storage } from '../utils/storage';
import { ImageWithFallback } from './ImageWithFallback';
import { formatDuration } from '../utils/formatters';

interface SearchSuggestionsDropdownProps {
  query: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectSuggestion?: (term: string) => void;
  className?: string;
  isDark?: boolean;
}

export const SearchSuggestionsDropdown: React.FC<SearchSuggestionsDropdownProps> = ({
  query,
  isOpen,
  onClose,
  onSelectSuggestion,
  className = '',
  isDark = false
}) => {
  const navigate = useNavigate();
  const { playSong } = usePlayer();
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => storage.getRecentSearches());
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const trendingTags = [
    'Arijit Singh',
    'Sidhu Moose Wala',
    'Karan Aujla',
    'Diljit Dosanjh',
    'Anuv Jain',
    'Shubh',
    'Bollywood Top 50',
    'Lofi Chill'
  ];

  useEffect(() => {
    if (!isOpen) return;
    setRecentSearches(storage.getRecentSearches());

    if (!query.trim() || query.trim().length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const data = await search(query.trim());
        setResults(data);
      } catch (err) {
        console.warn('Autocomplete search error:', err);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, isOpen]);

  if (!isOpen) return null;

  const handleSongClick = (song: Song) => {
    storage.addRecentSearch(song.title);
    playSong(song, results?.songs || [song]);
    onClose();
  };

  const handleArtistClick = (artist: Artist) => {
    storage.addRecentSearch(artist.name);
    navigate(`/artist/${artist.id}`);
    onClose();
  };

  const handleAlbumClick = (album: Album) => {
    storage.addRecentSearch(album.title);
    navigate(`/album/${album.id}`);
    onClose();
  };

  const handleTermClick = (term: string) => {
    storage.addRecentSearch(term);
    if (onSelectSuggestion) {
      onSelectSuggestion(term);
    } else {
      navigate(`/search?q=${encodeURIComponent(term)}`);
    }
    onClose();
  };

  const handleViewAll = () => {
    if (query.trim()) {
      storage.addRecentSearch(query.trim());
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  const bgClasses = isDark
    ? 'bg-[#151920] border-white/10 text-white shadow-2xl'
    : 'bg-white border-[#E5E5E5] text-[#1A1A1A] shadow-2xl';

  const subtextClasses = isDark ? 'text-zinc-400' : 'text-[#777777]';
  const hoverRowClasses = isDark ? 'hover:bg-white/5' : 'hover:bg-[#F5F5F5]';
  const sectionHeaderClasses = isDark ? 'text-zinc-400' : 'text-[#888888]';

  return (
    <div
      className={`absolute left-0 right-0 top-full mt-2 rounded-2xl border overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 ${bgClasses} ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="max-h-[460px] overflow-y-auto p-3 space-y-4 no-scrollbar">
        {/* State 1: When user has NOT typed enough characters -> Show Trending & Recent Searches */}
        {(!query.trim() || query.trim().length < 2) && (
          <div className="space-y-4 p-1">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider px-2">
                  <span className={`flex items-center gap-1.5 ${sectionHeaderClasses}`}>
                    <Clock className="w-3.5 h-3.5" />
                    Recent Searches
                  </span>
                  <button
                    onClick={() => {
                      storage.clearRecentSearches();
                      setRecentSearches([]);
                    }}
                    className="text-[10px] text-rose-400 hover:underline capitalize"
                  >
                    Clear
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 px-1">
                  {recentSearches.slice(0, 6).map((term) => (
                    <button
                      key={term}
                      onClick={() => handleTermClick(term)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${
                        isDark
                          ? 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200'
                          : 'bg-[#F2F2F2] hover:bg-[#EAEAEA] text-[#333333]'
                      }`}
                    >
                      <Search className="w-3 h-3 text-zinc-400" />
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Suggestions */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span className={sectionHeaderClasses}>Trending Suggestions</span>
              </div>

              <div className="flex flex-wrap gap-1.5 px-1">
                {trendingTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTermClick(tag)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                      isDark
                        ? 'bg-[#1D222C] hover:bg-[#282F3D] text-zinc-200 hover:text-[#F4FF3B]'
                        : 'bg-[#F7F7F7] hover:bg-[#EBEBEB] text-[#222222] hover:text-black border border-[#EBEBEB]'
                    }`}
                  >
                    <TrendingUp className="w-3 h-3 text-amber-500" />
                    <span>{tag}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* State 2: Loading State */}
        {loading && (
          <div className="py-8 flex flex-col items-center justify-center gap-2 text-xs">
            <div className="w-6 h-6 border-2 border-[#F4FF3B] border-t-transparent rounded-full animate-spin" />
            <span className={subtextClasses}>Searching suggestions...</span>
          </div>
        )}

        {/* State 3: Live Query Results / Suggestions */}
        {!loading && query.trim().length >= 2 && results && (
          <div className="space-y-3">
            {/* 1. Song Suggestions */}
            {results.songs.length > 0 && (
              <div className="space-y-1">
                <div className={`text-[11px] font-bold uppercase tracking-wider px-2 flex items-center gap-1.5 ${sectionHeaderClasses}`}>
                  <Music2 className="w-3.5 h-3.5 text-[#F4FF3B]" />
                  <span>Songs</span>
                </div>

                <div className="space-y-0.5">
                  {results.songs.slice(0, 4).map((song) => (
                    <div
                      key={song.id}
                      onClick={() => handleSongClick(song)}
                      className={`group flex items-center justify-between gap-3 p-2 rounded-xl cursor-pointer transition ${hoverRowClasses}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <ImageWithFallback
                          src={song.image}
                          alt={song.title}
                          fallbackTitle={song.title}
                          type="song"
                          containerClassName="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-zinc-800"
                          className="w-full h-full object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate group-hover:text-[#F4FF3B] transition-colors">
                            {song.title}
                          </p>
                          <p className={`text-[11px] truncate ${subtextClasses}`}>
                            {song.artist}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-mono ${subtextClasses}`}>
                          {formatDuration(song.duration)}
                        </span>
                        <div className="w-7 h-7 rounded-full bg-[#F4FF3B] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow">
                          <Play className="w-3 h-3 fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Artist Suggestions */}
            {results.artists.length > 0 && (
              <div className="space-y-1 pt-1 border-t border-white/5">
                <div className={`text-[11px] font-bold uppercase tracking-wider px-2 flex items-center gap-1.5 ${sectionHeaderClasses}`}>
                  <Mic2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>Artists</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 p-1">
                  {results.artists.slice(0, 3).map((artist) => (
                    <div
                      key={artist.id}
                      onClick={() => handleArtistClick(artist)}
                      className={`flex items-center gap-2 p-2 rounded-xl cursor-pointer transition ${hoverRowClasses}`}
                    >
                      <ImageWithFallback
                        src={artist.image}
                        alt={artist.name}
                        fallbackTitle={artist.name}
                        type="artist"
                        containerClassName="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-zinc-800 ring-1 ring-white/10"
                        className="w-full h-full object-cover"
                      />
                      <span className="text-xs font-semibold truncate">
                        {artist.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Album Suggestions */}
            {results.albums.length > 0 && (
              <div className="space-y-1 pt-1 border-t border-white/5">
                <div className={`text-[11px] font-bold uppercase tracking-wider px-2 flex items-center gap-1.5 ${sectionHeaderClasses}`}>
                  <Disc3 className="w-3.5 h-3.5 text-violet-400" />
                  <span>Albums</span>
                </div>

                <div className="space-y-0.5">
                  {results.albums.slice(0, 2).map((album) => (
                    <div
                      key={album.id}
                      onClick={() => handleAlbumClick(album)}
                      className={`flex items-center justify-between gap-2.5 p-2 rounded-xl cursor-pointer transition ${hoverRowClasses}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <ImageWithFallback
                          src={album.image}
                          alt={album.title}
                          fallbackTitle={album.title}
                          type="album"
                          containerClassName="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-zinc-800"
                          className="w-full h-full object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate">{album.title}</p>
                          <p className={`text-[11px] truncate ${subtextClasses}`}>{album.artist}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom "View all results for..." Button */}
            <div className="pt-2 border-t border-white/5">
              <button
                onClick={handleViewAll}
                className={`w-full py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition ${
                  isDark
                    ? 'bg-[#1F2532] hover:bg-[#2A3345] text-[#F4FF3B]'
                    : 'bg-[#F2F2F2] hover:bg-[#E5E5E5] text-[#1A1A1A]'
                }`}
              >
                <span>View all search results for &quot;{query}&quot;</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* State 4: No results found */}
        {!loading && query.trim().length >= 2 && results && results.songs.length === 0 && results.artists.length === 0 && results.albums.length === 0 && (
          <div className="py-6 text-center text-xs space-y-1">
            <p className="font-semibold">No direct suggestions for &quot;{query}&quot;</p>
            <p className={subtextClasses}>Press Enter to search full multi-API catalog</p>
          </div>
        )}
      </div>
    </div>
  );
};
