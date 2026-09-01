import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search as SearchIcon,
  X,
  Clock,
  Music,
  Disc3,
  Mic2,
  ListMusic,
  Flame,
  Trash2
} from 'lucide-react';
import {
  search,
  searchSongs,
  searchAlbums,
  searchArtists,
  searchPlaylists,
  getTrendingSongs,
  getTrendingAlbums
} from '../services/api';
import {
  Song,
  Album,
  Artist,
  Playlist,
  SearchResults
} from '../types/music';
import { storage } from '../utils/storage';
import { SongRow } from '../components/SongRow';
import { AlbumCard } from '../components/AlbumCard';
import { ArtistCard } from '../components/ArtistCard';
import { PlaylistCard } from '../components/PlaylistCard';
import { SectionSkeleton, RowSkeleton } from '../components/LoadingSkeleton';
import { EmptyState, ErrorState } from '../components/FeedbackStates';

type TabType = 'all' | 'songs' | 'albums' | 'artists' | 'playlists';

export const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryParam = searchParams.get('q') || '';
  const tabParam = (searchParams.get('tab') as TabType) || 'all';

  const [inputQuery, setInputQuery] = useState(queryParam);
  const [activeTab, setActiveTab] = useState<TabType>(tabParam);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [recentSearches, setRecentSearches] = useState<string[]>(() => storage.getRecentSearches());

  // Search Results
  const [allResults, setAllResults] = useState<SearchResults | null>(null);
  const [songResults, setSongResults] = useState<Song[]>([]);
  const [albumResults, setAlbumResults] = useState<Album[]>([]);
  const [artistResults, setArtistResults] = useState<Artist[]>([]);
  const [playlistResults, setPlaylistResults] = useState<Playlist[]>([]);

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state if URL query param changes
  useEffect(() => {
    setInputQuery(queryParam);
    if (tabParam) setActiveTab(tabParam);
    if (queryParam.trim()) {
      performSearch(queryParam.trim(), tabParam);
    } else if (tabParam === 'songs') {
      loadFallbackSongs();
    } else if (tabParam === 'albums') {
      loadFallbackAlbums();
    } else if (tabParam === 'artists') {
      performSearch('Top Artists', 'artists');
    }
  }, [queryParam, tabParam]);

  const loadFallbackSongs = async () => {
    setLoading(true);
    try {
      const songs = await getTrendingSongs();
      setSongResults(songs);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackAlbums = async () => {
    setLoading(true);
    try {
      const albums = await getTrendingAlbums();
      setAlbumResults(albums);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async (term: string, tab: TabType) => {
    if (!term) return;
    setLoading(true);
    setError(null);
    storage.addRecentSearch(term);
    setRecentSearches(storage.getRecentSearches());

    try {
      if (tab === 'all') {
        const results = await search(term);
        setAllResults(results);
      } else if (tab === 'songs') {
        const songs = await searchSongs(term);
        setSongResults(songs);
      } else if (tab === 'albums') {
        const albums = await searchAlbums(term);
        setAlbumResults(albums);
      } else if (tab === 'artists') {
        const artists = await searchArtists(term);
        setArtistResults(artists);
      } else if (tab === 'playlists') {
        const playlists = await searchPlaylists(term);
        setPlaylistResults(playlists);
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err?.message || 'Failed to complete search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputQuery(val);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (val.trim().length >= 2) {
      debounceTimeoutRef.current = setTimeout(() => {
        setSearchParams({ q: val.trim(), tab: activeTab });
      }, 500);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputQuery.trim()) {
      setSearchParams({ q: inputQuery.trim(), tab: activeTab });
    }
  };

  const handleClear = () => {
    setInputQuery('');
    setSearchParams({});
    setAllResults(null);
    setSongResults([]);
    setAlbumResults([]);
    setArtistResults([]);
    setPlaylistResults([]);
  };

  const handleTabChange = (newTab: TabType) => {
    setActiveTab(newTab);
    if (inputQuery.trim()) {
      setSearchParams({ q: inputQuery.trim(), tab: newTab });
    } else {
      setSearchParams({ tab: newTab });
    }
  };

  const handleSelectRecent = (term: string) => {
    setInputQuery(term);
    setSearchParams({ q: term, tab: activeTab });
  };

  const handleClearRecent = () => {
    storage.clearRecentSearches();
    setRecentSearches([]);
  };

  const trendingTags = ['Arijit Singh', 'Bollywood Hits', 'Sidhu Moose Wala', 'Anuv Jain', 'Lofi Chill', 'Romantic Hits', 'Shreya Ghoshal', 'English Pop', 'K-Pop Hits'];

  const hasAnyResults =
    (activeTab === 'all' && allResults && (allResults.songs.length > 0 || allResults.albums.length > 0 || allResults.artists.length > 0 || allResults.playlists.length > 0)) ||
    (activeTab === 'songs' && songResults.length > 0) ||
    (activeTab === 'albums' && albumResults.length > 0) ||
    (activeTab === 'artists' && artistResults.length > 0) ||
    (activeTab === 'playlists' && playlistResults.length > 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto pb-32">
      {/* Search Input Bar */}
      <form onSubmit={handleFormSubmit} className="relative max-w-3xl">
        <div className="relative flex items-center">
          <SearchIcon className="absolute left-4 w-5 h-5 text-zinc-400 lg:text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={inputQuery}
            onChange={handleInputChange}
            placeholder="Search songs, artists, albums or playlists..."
            className="w-full pl-12 pr-28 py-3.5 sm:py-4 bg-[#151920] lg:bg-white border border-white/10 lg:border-gray-200 focus:border-[#F4FF3B] lg:focus:border-black rounded-2xl text-white lg:text-gray-900 placeholder-zinc-500 lg:placeholder-gray-400 text-sm sm:text-base outline-none shadow-xs transition"
            autoFocus
          />

          <div className="absolute right-3 flex items-center gap-1.5">
            {inputQuery && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear search input"
                className="p-1.5 rounded-full hover:bg-white/10 lg:hover:bg-gray-100 text-zinc-400 lg:text-gray-500 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-xl bg-[#F4FF3B] lg:bg-[#1A1A1A] text-black lg:text-white text-xs font-bold shadow-xs transition hover:opacity-90"
            >
              Search
            </button>
          </div>
        </div>
      </form>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {(['all', 'songs', 'albums', 'artists', 'playlists'] as TabType[]).map(tab => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize whitespace-nowrap transition ${
              activeTab === tab
                ? 'bg-[#F4FF3B] lg:bg-[#1A1A1A] text-black lg:text-white shadow-xs'
                : 'bg-[#151920] lg:bg-gray-100 text-zinc-300 lg:text-gray-700 hover:bg-[#1B1F26] lg:hover:bg-gray-200 hover:text-white lg:hover:text-black border border-white/5 lg:border-transparent'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* When no query is typed yet: Show recent searches and trending tags */}
      {!queryParam.trim() && (activeTab === 'all') && (
        <div className="space-y-8 pt-4">
          {recentSearches.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-300 lg:text-gray-800 text-sm font-bold">
                  <Clock className="w-4 h-4 text-lime-400 lg:text-lime-600" />
                  <span>Recent Searches</span>
                </div>
                <button
                  onClick={handleClearRecent}
                  className="text-xs text-zinc-500 lg:text-gray-400 hover:text-rose-500 flex items-center gap-1 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {recentSearches.map(term => (
                  <button
                    key={term}
                    onClick={() => handleSelectRecent(term)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#151920] lg:bg-white hover:bg-[#1B1F26] lg:hover:bg-gray-50 border border-white/5 lg:border-gray-200 text-xs text-zinc-300 lg:text-gray-700 transition group"
                  >
                    <SearchIcon className="w-3.5 h-3.5 text-zinc-500 lg:text-gray-400 group-hover:text-lime-400 lg:group-hover:text-lime-600" />
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-zinc-300 lg:text-gray-800 text-sm font-bold">
              <Flame className="w-4 h-4 text-rose-500" />
              <span>Trending Searches</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {trendingTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleSelectRecent(tag)}
                  className="px-4 py-2 rounded-xl bg-[#151920] lg:bg-white hover:bg-[#1B1F26] lg:hover:bg-gray-100 border border-white/5 lg:border-gray-200 text-xs text-zinc-300 lg:text-gray-700 transition"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <ErrorState
          title="Search Failed"
          message={error}
          onRetry={() => performSearch(queryParam, activeTab)}
        />
      )}

      {/* Loading state */}
      {loading && (
        <div className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <RowSkeleton key={i} />
            ))}
          </div>
          <SectionSkeleton count={6} />
        </div>
      )}

      {/* SEARCH RESULTS DISPLAY */}
      {!loading && !error && (
        <div className="space-y-8 pt-2">
          {/* Empty state check */}
          {queryParam.trim() && !hasAnyResults && (
            <EmptyState
              title={`No results found for "${queryParam}"`}
              message="Check your spelling, try different keywords, or browse through our trending genres on the home page."
              action={
                <button
                  onClick={() => navigate('/')}
                  className="px-5 py-2.5 rounded-full bg-[#F4FF3B] lg:bg-[#1A1A1A] text-black lg:text-white font-bold text-xs shadow-md transition"
                >
                  Explore Home
                </button>
              }
            />
          )}

          {/* ALL TAB */}
          {activeTab === 'all' && allResults && (
            <>
              {/* Songs section */}
              {allResults.songs.length > 0 && (
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-bold text-white lg:text-gray-900 flex items-center gap-2">
                      <Music className="w-4 h-4 text-lime-400 lg:text-lime-600" />
                      Songs
                    </h3>
                    <button
                      onClick={() => handleTabChange('songs')}
                      className="text-xs text-lime-400 lg:text-gray-900 font-bold hover:underline"
                    >
                      View all songs ({allResults.songs.length})
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {allResults.songs.slice(0, 8).map((song, i) => (
                      <SongRow
                        key={song.id}
                        song={song}
                        index={i}
                        queueContext={allResults.songs}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Artists Section */}
              {allResults.artists.length > 0 && (
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-bold text-white lg:text-gray-900 flex items-center gap-2">
                      <Mic2 className="w-4 h-4 text-lime-400 lg:text-lime-600" />
                      Artists
                    </h3>
                    <button
                      onClick={() => handleTabChange('artists')}
                      className="text-xs text-lime-400 lg:text-gray-900 font-bold hover:underline"
                    >
                      View all artists ({allResults.artists.length})
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                    {allResults.artists.slice(0, 6).map(artist => (
                      <ArtistCard key={artist.id} artist={artist} />
                    ))}
                  </div>
                </section>
              )}

              {/* Albums Section */}
              {allResults.albums.length > 0 && (
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-bold text-white lg:text-gray-900 flex items-center gap-2">
                      <Disc3 className="w-4 h-4 text-lime-400 lg:text-lime-600" />
                      Albums
                    </h3>
                    <button
                      onClick={() => handleTabChange('albums')}
                      className="text-xs text-lime-400 lg:text-gray-900 font-bold hover:underline"
                    >
                      View all albums ({allResults.albums.length})
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                    {allResults.albums.slice(0, 6).map(album => (
                      <AlbumCard key={album.id} album={album} />
                    ))}
                  </div>
                </section>
              )}

              {/* Playlists Section */}
              {allResults.playlists.length > 0 && (
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-bold text-white lg:text-gray-900 flex items-center gap-2">
                      <ListMusic className="w-4 h-4 text-lime-400 lg:text-lime-600" />
                      Playlists
                    </h3>
                    <button
                      onClick={() => handleTabChange('playlists')}
                      className="text-xs text-lime-400 lg:text-gray-900 font-bold hover:underline"
                    >
                      View all playlists ({allResults.playlists.length})
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                    {allResults.playlists.slice(0, 6).map(playlist => (
                      <PlaylistCard key={playlist.id} playlist={playlist} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {/* DEDICATED SONGS TAB */}
          {activeTab === 'songs' && songResults.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-white lg:text-gray-900 mb-2">
                {queryParam ? `Songs matching "${queryParam}"` : 'Top Songs'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {songResults.map((song, i) => (
                  <SongRow
                    key={song.id}
                    song={song}
                    index={i}
                    queueContext={songResults}
                  />
                ))}
              </div>
            </div>
          )}

          {/* DEDICATED ALBUMS TAB */}
          {activeTab === 'albums' && albumResults.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-white lg:text-gray-900 mb-2">
                {queryParam ? `Albums matching "${queryParam}"` : 'Top Albums'}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                {albumResults.map(album => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </div>
            </div>
          )}

          {/* DEDICATED ARTISTS TAB */}
          {activeTab === 'artists' && artistResults.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-white lg:text-gray-900 mb-2">
                {queryParam ? `Artists matching "${queryParam}"` : 'Top Artists'}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                {artistResults.map(artist => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </div>
            </div>
          )}

          {/* DEDICATED PLAYLISTS TAB */}
          {activeTab === 'playlists' && playlistResults.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-white lg:text-gray-900 mb-2">
                {queryParam ? `Playlists matching "${queryParam}"` : 'Top Playlists'}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                {playlistResults.map(playlist => (
                  <PlaylistCard key={playlist.id} playlist={playlist} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
