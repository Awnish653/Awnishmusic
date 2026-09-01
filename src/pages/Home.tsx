import React, { useEffect, useState } from 'react';
import {
  Play,
  Pause,
  Sparkles,
  Flame,
  Music,
  Disc3,
  Mic2,
  Radio,
  Compass,
  Layers,
  Globe,
  ArrowRight,
  Heart,
  Clock,
  Music2,
  Maximize2,
  Volume2,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getTimeBasedGreeting, formatDuration } from '../utils/formatters';
import { getUnifiedHomeData } from '../services/api';
import { Song, Album, Artist, Playlist } from '../types/music';
import { SongCard } from '../components/SongCard';
import { SongRow } from '../components/SongRow';
import { AlbumCard } from '../components/AlbumCard';
import { ArtistCard } from '../components/ArtistCard';
import { PlaylistCard } from '../components/PlaylistCard';
import { SectionSkeleton } from '../components/LoadingSkeleton';
import { ErrorState } from '../components/FeedbackStates';
import { usePlayer } from '../context/PlayerContext';
import { useLibrary } from '../context/LibraryContext';
import { ImageWithFallback } from '../utils/image';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { currentSong, isPlaying, playSong, togglePlay, currentTime, duration, setIsFullscreenOpen } = usePlayer();
  const { recentlyPlayed, isSongLiked, toggleLike } = useLibrary();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [trendingNow, setTrendingNow] = useState<Song[]>([]);
  const [weeklyCharts, setWeeklyCharts] = useState<Song[]>([]);
  const [trendingAlbums, setTrendingAlbums] = useState<Album[]>([]);
  const [popularArtists, setPopularArtists] = useState<Artist[]>([]);
  const [curatedPlaylists, setCuratedPlaylists] = useState<Playlist[]>([]);
  const [bollywoodHits, setBollywoodHits] = useState<Song[]>([]);
  const [punjabiBeats, setPunjabiBeats] = useState<Song[]>([]);
  const [chillLofi, setChillLofi] = useState<Song[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const loadHomeData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUnifiedHomeData();
      setTrendingNow(data.trendingNow || []);
      setWeeklyCharts(data.weeklyCharts || []);
      setTrendingAlbums(data.trendingAlbums || []);
      setPopularArtists(data.popularArtists || []);
      setCuratedPlaylists(data.curatedPlaylists || []);
      setBollywoodHits(data.bollywoodHits || []);
      setPunjabiBeats(data.punjabiBeats || []);
      setChillLofi(data.chillLofi || []);
      setGenres(data.genres || []);
    } catch (err: any) {
      console.error('Home load error:', err);
      setError('Unable to load discovery stream. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  // Use curated playlist if available, otherwise build featured from trending
  const heroPlaylist: Playlist = curatedPlaylists[activeSlideIndex] || curatedPlaylists[0] || {
    id: 'featured-master',
    name: 'Blinding Lights & Global Chartbusters',
    title: 'Blinding Lights & Global Chartbusters',
    subtitle: 'Curated by AwnishX Music Studio',
    type: 'playlist',
    image: trendingNow[0]?.image || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    songCount: trendingNow.length || 24,
    songs: trendingNow,
    artist: 'Various Artists',
    language: 'English, Hindi',
    explicit: false,
    playCount: 1450000
  };

  const isHeroPlaying = isPlaying && currentSong && heroPlaylist.songs?.some(s => s.id === currentSong.id);
  const heroLiked = heroPlaylist.songs?.[0] ? isSongLiked(heroPlaylist.songs[0].id) : false;

  const handleHeroPlay = () => {
    if (heroPlaylist.songs && heroPlaylist.songs.length > 0) {
      playSong(heroPlaylist.songs[0], heroPlaylist.songs);
    } else if (trendingNow.length > 0) {
      playSong(trendingNow[0], trendingNow);
    }
  };

  // Recently played pool: use user's real library history or fallback to trending top tracks
  const recentPool = recentlyPlayed.length > 0 ? recentlyPlayed : trendingNow.slice(0, 6);

  // Mobile Now Playing Progress
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 max-w-7xl mx-auto pb-36">
      {/* ============================================================ */}
      {/* 1. FEATURED / CURATED PLAYLIST HERO CARD */}
      {/* ============================================================ */}
      <div className="space-y-3">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#4A1E0D] via-[#2F1308] to-[#1C0A04] lg:from-[#2A282A] lg:via-[#353335] lg:to-[#222022] text-white p-5 sm:p-7 lg:p-10 shadow-2xl border border-white/10 lg:border-none">
          {/* Subtle amber lighting glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-orange-600/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6">
            {/* Left Column: Playlist Meta */}
            <div className="space-y-2.5 sm:space-y-3.5 max-w-lg w-full">
              <span className="inline-block text-[11px] font-extrabold tracking-wider text-white/90 uppercase">
                CURATED PLAYLIST
              </span>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-none text-white uppercase">
                {heroPlaylist.name || heroPlaylist.title || 'BLINDING LIGHT'}
              </h1>

              <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 leading-relaxed font-normal">
                {(heroPlaylist as any).subtitle || heroPlaylist.artist || 'Enjoy vivid emotions with this stunning music album. Each track is a story.'}
              </p>

              {/* Meta badges: Like, Song Count, Duration */}
              <div className="flex items-center gap-3 text-xs font-semibold text-zinc-300 pt-1">
                <button
                  onClick={() => {
                    if (heroPlaylist.songs?.[0]) toggleLike(heroPlaylist.songs[0]);
                  }}
                  className="flex items-center gap-1.5 hover:text-[#F4FF3B] transition"
                >
                  <Heart className={`w-4 h-4 ${heroLiked ? 'fill-rose-500 text-rose-500' : 'text-zinc-300'}`} />
                  <span>83,012 Likes</span>
                </button>

                <span>•</span>
                <span>{heroPlaylist.songCount || heroPlaylist.songs?.length || 18} Songs, 39 min 43 sec</span>
              </div>

              {/* Play Button */}
              <div className="pt-2">
                <button
                  onClick={handleHeroPlay}
                  className="flex items-center gap-2.5 px-6 py-2.5 sm:py-3 rounded-full bg-[#F4FF3B] hover:bg-yellow-300 text-black font-extrabold text-xs sm:text-sm shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                  {isHeroPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-current" />
                      <span>Pause Stream</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                      <span>Play Playlist</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column: Hero Artwork */}
            <div
              className="relative w-40 h-40 sm:w-52 sm:h-52 lg:w-60 lg:h-60 rounded-2xl overflow-hidden bg-zinc-900 shadow-2xl shrink-0 border border-white/10 group cursor-pointer"
              onClick={handleHeroPlay}
            >
              <ImageWithFallback
                src={heroPlaylist.image}
                alt={heroPlaylist.name || 'Hero'}
                fallbackTitle={heroPlaylist.name}
                type="playlist"
                containerClassName="w-full h-full"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-13 h-13 rounded-full bg-[#F4FF3B] text-black flex items-center justify-center shadow-xl">
                  <Play className="w-6 h-6 fill-current ml-0.5" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile 3 Carousel Dots */}
        <div className="flex lg:hidden items-center justify-center gap-1.5 pt-1">
          <span className="w-4 h-1.5 rounded-full bg-[#F4FF3B] transition-all" />
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 transition-all" />
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 transition-all" />
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. MOBILE NOW PLAYING CARD (Exact match to Reference 2) */}
      {/* ============================================================ */}
      <div className="block lg:hidden rounded-3xl bg-[#12151C] border border-white/5 p-4 sm:p-5 shadow-2xl select-none">
        {/* Header: Equalizer + Title + Full Player button */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="flex items-end gap-0.5 h-4">
              <span className="w-1 bg-[#F4FF3B] rounded-full animate-bounce" style={{ height: '70%', animationDuration: '0.6s' }} />
              <span className="w-1 bg-[#F4FF3B] rounded-full animate-bounce" style={{ height: '100%', animationDuration: '0.4s' }} />
              <span className="w-1 bg-[#F4FF3B] rounded-full animate-bounce" style={{ height: '50%', animationDuration: '0.8s' }} />
              <span className="w-1 bg-[#F4FF3B] rounded-full animate-bounce" style={{ height: '85%', animationDuration: '0.5s' }} />
            </div>
            <span className="text-sm font-bold text-white tracking-tight">
              Now Playing
            </span>
          </div>

          <button
            onClick={() => setIsFullscreenOpen(true)}
            className="text-xs font-semibold text-zinc-300 bg-[#1F2430] hover:bg-[#2A3140] px-3 py-1.5 rounded-full flex items-center gap-1.5 active:scale-95 transition"
          >
            <span>Full Player</span>
            <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
          </button>
        </div>

        {currentSong ? (
          <div className="flex items-center gap-3.5">
            {/* Song cover art */}
            <ImageWithFallback
              src={currentSong.image}
              alt={currentSong.title}
              fallbackTitle={currentSong.title}
              type="song"
              containerClassName="w-14 h-14 rounded-2xl overflow-hidden bg-zinc-800 shrink-0 shadow-md ring-1 ring-white/10"
              className="w-full h-full object-cover"
            />

            {/* Song title, artist & seekable progress line */}
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="pr-1">
                <h3 className="text-sm font-bold text-white truncate leading-tight">
                  {currentSong.title}
                </h3>
                <p className="text-xs text-[#8E8E93] truncate mt-0.5 font-medium">
                  {currentSong.artist}
                </p>
              </div>

              {/* Seekable Progress Bar with circular white thumb */}
              <div className="space-y-1">
                <div className="relative w-full h-1 bg-zinc-800 rounded-full flex items-center cursor-pointer">
                  <div
                    className="h-full bg-[#F4FF3B] rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                  <div
                    className="absolute w-3 h-3 bg-white rounded-full shadow-md -translate-x-1/2 pointer-events-none"
                    style={{ left: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-[#8E8E93]">
                  <span>{formatDuration(currentTime)}</span>
                  <span>{formatDuration(duration)}</span>
                </div>
              </div>
            </div>

            {/* Large Yellow/Lime Circular Play/Pause Button */}
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="w-12 h-12 rounded-full bg-[#F4FF3B] text-black flex items-center justify-center shadow-xl active:scale-95 transition shrink-0 font-bold"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>
          </div>
        ) : (
          <div
            onClick={handleHeroPlay}
            className="py-4 text-center text-xs text-[#8E8E93] bg-[#171B24] rounded-2xl border border-dashed border-white/10 cursor-pointer hover:border-[#F4FF3B]/50 transition"
          >
            Tap to play featured playlist
          </div>
        )}
      </div>

      {error && <ErrorState message={error} onRetry={loadHomeData} />}

      {loading ? (
        <div className="space-y-8">
          <SectionSkeleton count={6} isCircle />
          <SectionSkeleton count={6} />
          <SectionSkeleton count={6} />
        </div>
      ) : (
        <>
          {/* ============================================================ */}
          {/* 3. POPULAR ARTISTS (Horizontal circular artist row) */}
          {/* ============================================================ */}
          {popularArtists.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-extrabold text-white lg:text-[#1A1A1A] tracking-tight">
                  Popular artists
                </h2>
                <button
                  onClick={() => navigate('/search?tab=artists')}
                  className="text-xs font-bold text-[#F4FF3B] lg:text-[#777777] hover:text-white lg:hover:text-[#1A1A1A] transition"
                >
                  See all
                </button>
              </div>

              {/* Horizontal scrollable circular artist cards */}
              <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
                {popularArtists.slice(0, 10).map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </div>
            </section>
          )}

          {/* ============================================================ */}
          {/* 4. RECENTLY PLAYED / TOP RECENT HITS */}
          {/* ============================================================ */}
          {recentPool.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-extrabold text-white lg:text-[#1A1A1A] tracking-tight">
                  Recently played
                </h2>
                <button
                  onClick={() => navigate('/library?tab=history')}
                  className="text-xs font-bold text-[#F4FF3B] lg:text-[#777777] hover:text-white lg:hover:text-[#1A1A1A] transition"
                >
                  See all
                </button>
              </div>

              <div className="space-y-2">
                {recentPool.slice(0, 5).map((song, idx) => (
                  <SongRow
                    key={`${song.id}-${idx}`}
                    song={song}
                    index={idx}
                    queueContext={recentPool}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ============================================================ */}
          {/* 5. TRENDING NOW */}
          {/* ============================================================ */}
          {trendingNow.length > 0 && (
            <section className="space-y-4 pt-4 border-t border-white/5 lg:border-[#E5E5E5]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-rose-500" />
                  <h2 className="text-lg sm:text-xl font-extrabold text-white lg:text-[#1A1A1A] tracking-tight">
                    Trending Now
                  </h2>
                </div>
                <button
                  onClick={() => navigate('/search?q=Trending')}
                  className="text-xs font-bold text-[#F4FF3B] lg:text-[#777777] hover:text-white lg:hover:text-[#1A1A1A] transition"
                >
                  See all
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {trendingNow.slice(0, 6).map((song) => (
                  <SongCard key={song.id} song={song} queueContext={trendingNow} />
                ))}
              </div>
            </section>
          )}

          {/* ============================================================ */}
          {/* 6. TOP CHARTS & WEEKLY HITS */}
          {/* ============================================================ */}
          {weeklyCharts.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg sm:text-xl font-extrabold text-white lg:text-[#1A1A1A] tracking-tight">
                    Top Charts & Weekly Hits
                  </h2>
                </div>
                <button
                  onClick={() => navigate('/search?q=Charts')}
                  className="text-xs font-bold text-[#F4FF3B] lg:text-[#777777] hover:text-white lg:hover:text-[#1A1A1A] transition"
                >
                  See all
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {weeklyCharts.slice(0, 6).map((song) => (
                  <SongCard key={song.id} song={song} queueContext={weeklyCharts} />
                ))}
              </div>
            </section>
          )}

          {/* ============================================================ */}
          {/* 7. EXPLORE GENRES */}
          {/* ============================================================ */}
          {genres.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#F4FF3B] lg:text-[#1A1A1A]" />
                  <h2 className="text-lg sm:text-xl font-extrabold text-white lg:text-[#1A1A1A] tracking-tight">
                    Explore Genres
                  </h2>
                </div>
              </div>
              <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
                {genres.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => navigate(`/search?q=${encodeURIComponent(genre)}`)}
                    className="px-4 py-2.5 rounded-full bg-[#151920] lg:bg-white hover:bg-[#1B1F26] lg:hover:bg-[#F0F0F0] border border-white/10 lg:border-[#E5E5E5] text-xs font-bold text-white lg:text-[#1A1A1A] whitespace-nowrap transition-all shadow-xs hover:scale-105 active:scale-95"
                  >
                    {genre.replace(/-/g, ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* ============================================================ */}
          {/* 8. BOLLYWOOD BLOCKBUSTERS */}
          {/* ============================================================ */}
          {bollywoodHits.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mic2 className="w-5 h-5 text-pink-500" />
                  <h2 className="text-lg sm:text-xl font-extrabold text-white lg:text-[#1A1A1A] tracking-tight">
                    Bollywood Blockbusters
                  </h2>
                </div>
                <button
                  onClick={() => navigate('/search?q=Bollywood%20Hits')}
                  className="text-xs font-bold text-[#F4FF3B] lg:text-[#777777] hover:text-white lg:hover:text-[#1A1A1A] transition"
                >
                  See all
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {bollywoodHits.slice(0, 6).map((song) => (
                  <SongCard key={song.id} song={song} queueContext={bollywoodHits} />
                ))}
              </div>
            </section>
          )}

          {/* ============================================================ */}
          {/* 9. TRENDING ALBUMS */}
          {/* ============================================================ */}
          {trendingAlbums.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Disc3 className="w-5 h-5 text-violet-500" />
                  <h2 className="text-lg sm:text-xl font-extrabold text-white lg:text-[#1A1A1A] tracking-tight">
                    Trending Albums
                  </h2>
                </div>
                <button
                  onClick={() => navigate('/search?q=Trending&tab=albums')}
                  className="text-xs font-bold text-[#F4FF3B] lg:text-[#777777] hover:text-white lg:hover:text-[#1A1A1A] transition"
                >
                  See all
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {trendingAlbums.slice(0, 6).map((album) => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </div>
            </section>
          )}

          {/* ============================================================ */}
          {/* 10. PUNJABI BEATS */}
          {/* ============================================================ */}
          {punjabiBeats.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg sm:text-xl font-extrabold text-white lg:text-[#1A1A1A] tracking-tight">
                    Punjabi Beats & Party
                  </h2>
                </div>
                <button
                  onClick={() => navigate('/search?q=Punjabi%20Hits')}
                  className="text-xs font-bold text-[#F4FF3B] lg:text-[#777777] hover:text-white lg:hover:text-[#1A1A1A] transition"
                >
                  See all
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {punjabiBeats.slice(0, 6).map((song) => (
                  <SongCard key={song.id} song={song} queueContext={punjabiBeats} />
                ))}
              </div>
            </section>
          )}

          {/* ============================================================ */}
          {/* 11. CHILL & LO-FI VIBES */}
          {/* ============================================================ */}
          {chillLofi.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Music className="w-5 h-5 text-emerald-500" />
                  <h2 className="text-lg sm:text-xl font-extrabold text-white lg:text-[#1A1A1A] tracking-tight">
                    Chill & Lo-Fi Relax
                  </h2>
                </div>
                <button
                  onClick={() => navigate('/search?q=Chill')}
                  className="text-xs font-bold text-[#F4FF3B] lg:text-[#777777] hover:text-white lg:hover:text-[#1A1A1A] transition"
                >
                  See all
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {chillLofi.slice(0, 6).map((song) => (
                  <SongCard key={song.id} song={song} queueContext={chillLofi} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};
