import React, { useEffect, useState } from 'react';
import { Play, Sparkles, Flame, Music, Disc3, Mic2, Radio, Compass, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getTimeBasedGreeting } from '../utils/formatters';
import { searchAlbums, searchArtists, searchPlaylists, searchSongs } from '../services/api';
import { Song, Album, Artist, Playlist } from '../types/music';
import { SongCard } from '../components/SongCard';
import { AlbumCard } from '../components/AlbumCard';
import { ArtistCard } from '../components/ArtistCard';
import { PlaylistCard } from '../components/PlaylistCard';
import { SectionSkeleton } from '../components/LoadingSkeleton';
import { ErrorState } from '../components/FeedbackStates';
import { usePlayer } from '../context/PlayerContext';
import { ImageWithFallback } from '../utils/image';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { playSong } = usePlayer();
  const greeting = getTimeBasedGreeting();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [bollywoodHits, setBollywoodHits] = useState<Song[]>([]);
  const [arijitTracks, setArijitTracks] = useState<Song[]>([]);
  const [punjabiHits, setPunjabiHits] = useState<Song[]>([]);
  const [chillTracks, setChillTracks] = useState<Song[]>([]);
  const [trendingAlbums, setTrendingAlbums] = useState<Album[]>([]);
  const [popularArtists, setPopularArtists] = useState<Artist[]>([]);
  const [curatedPlaylists, setCuratedPlaylists] = useState<Playlist[]>([]);

  const loadHomeData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch dynamic search-based discovery sections concurrently
      const [
        bollyRes,
        arijitRes,
        punjabiRes,
        chillRes,
        albRes,
        artRes,
        plRes
      ] = await Promise.allSettled([
        searchSongs('Bollywood Hits'),
        searchSongs('Arijit Singh'),
        searchSongs('Punjabi Hits'),
        searchSongs('Chill Lo-Fi'),
        searchAlbums('Bollywood'),
        searchArtists('Arijit'),
        searchPlaylists('Hits')
      ]);

      if (bollyRes.status === 'fulfilled') setBollywoodHits(bollyRes.value.slice(0, 10));
      if (arijitRes.status === 'fulfilled') setArijitTracks(arijitRes.value.slice(0, 10));
      if (punjabiRes.status === 'fulfilled') setPunjabiHits(punjabiRes.value.slice(0, 10));
      if (chillRes.status === 'fulfilled') setChillTracks(chillRes.value.slice(0, 10));
      if (albRes.status === 'fulfilled') setTrendingAlbums(albRes.value.slice(0, 8));
      if (artRes.status === 'fulfilled') setPopularArtists(artRes.value.slice(0, 8));
      if (plRes.status === 'fulfilled') setCuratedPlaylists(plRes.value.slice(0, 8));
    } catch (err: any) {
      console.error('Home load error:', err);
      setError('Unable to load discovery stream. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  const featuredSong = bollywoodHits[0] || arijitTracks[0];

  const quickGenres = [
    { label: 'Hindi Hits', query: 'Hindi Hits' },
    { label: 'Arijit Singh', query: 'Arijit Singh' },
    { label: 'Punjabi Pop', query: 'Punjabi Hits' },
    { label: 'Romantic Melodies', query: 'Romantic' },
    { label: 'Bollywood 2000s', query: 'Bollywood 2000s' },
    { label: 'Chill Lo-Fi', query: 'Lo-Fi' }
  ];

  return (
    <div className="p-4 sm:p-8 space-y-10 max-w-7xl mx-auto pb-32">
      {/* Top Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-violet-950/70 via-indigo-950/50 to-zinc-950 border border-white/10 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/15 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-violet-600/10 rounded-full filter blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-semibold backdrop-blur-md border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Welcome to AwnishX Music</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {greeting}
            </h1>
            <p className="text-sm text-zinc-300 leading-relaxed font-normal">
              Stream millions of songs, explore curated albums, artist profiles, and custom playlists in studio quality lossless audio.
            </p>

            {/* Quick Explore Pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {quickGenres.map(g => (
                <button
                  key={g.label}
                  onClick={() => navigate(`/search?q=${encodeURIComponent(g.query)}`)}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-900/80 hover:bg-white hover:text-black text-zinc-300 border border-white/10 hover:border-white transition-all shadow-sm"
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Featured Quick Play Card */}
          {featuredSong && (
            <div
              onClick={() => playSong(featuredSong, bollywoodHits)}
              className="flex items-center gap-4 p-3.5 rounded-2xl bg-zinc-900/70 hover:bg-zinc-800/90 border border-white/10 hover:border-indigo-500/30 backdrop-blur-xl transition-all cursor-pointer group shadow-2xl max-w-sm w-full"
            >
              <ImageWithFallback
                src={featuredSong.image}
                alt={featuredSong.title}
                fallbackTitle={featuredSong.title}
                type="song"
                containerClassName="w-16 h-16 rounded-xl shrink-0 shadow-md ring-1 ring-white/10"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                  Featured Track
                </span>
                <h3 className="text-sm font-bold text-white truncate group-hover:text-indigo-300">
                  {featuredSong.title}
                </h3>
                <p className="text-xs text-zinc-400 truncate">{featuredSong.artist}</p>
              </div>
              <button
                aria-label="Play Featured Track"
                className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 group-hover:from-indigo-500 group-hover:to-violet-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/30 transition-transform group-hover:scale-110 active:scale-95"
              >
                <Play className="w-4 h-4 fill-white ml-0.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={loadHomeData} />}

      {loading ? (
        <div className="space-y-8">
          <SectionSkeleton count={6} />
          <SectionSkeleton count={6} />
          <SectionSkeleton count={6} isCircle />
        </div>
      ) : (
        <>
          {/* SECTION 1: Trending Bollywood Hits */}
          {bollywoodHits.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-rose-500" />
                  <h2 className="text-xl font-black text-white tracking-tight">Trending Bollywood Hits</h2>
                </div>
                <button
                  onClick={() => navigate('/search?q=Bollywood%20Hits')}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition"
                >
                  Show all
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {bollywoodHits.slice(0, 6).map(song => (
                  <SongCard key={song.id} song={song} queueContext={bollywoodHits} />
                ))}
              </div>
            </section>
          )}

          {/* SECTION 2: Arijit Singh Essentials */}
          {arijitTracks.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mic2 className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-xl font-black text-white tracking-tight">Arijit Singh Essentials</h2>
                </div>
                <button
                  onClick={() => navigate('/search?q=Arijit%20Singh')}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition"
                >
                  Show all
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {arijitTracks.slice(0, 6).map(song => (
                  <SongCard key={song.id} song={song} queueContext={arijitTracks} />
                ))}
              </div>
            </section>
          )}

          {/* SECTION 3: Popular Artists */}
          {popularArtists.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-xl font-black text-white tracking-tight">Popular Artists</h2>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {popularArtists.slice(0, 6).map(artist => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </div>
            </section>
          )}

          {/* SECTION 4: Top Albums */}
          {trendingAlbums.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Disc3 className="w-5 h-5 text-violet-400" />
                  <h2 className="text-xl font-black text-white tracking-tight">Popular Albums</h2>
                </div>
                <button
                  onClick={() => navigate('/search?q=Bollywood&tab=albums')}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition"
                >
                  Show all
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {trendingAlbums.slice(0, 6).map(album => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </div>
            </section>
          )}

          {/* SECTION 5: Punjabi Beats */}
          {punjabiHits.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="w-5 h-5 text-amber-400" />
                  <h2 className="text-xl font-black text-white tracking-tight">Punjabi Party & Beats</h2>
                </div>
                <button
                  onClick={() => navigate('/search?q=Punjabi%20Hits')}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition"
                >
                  Show all
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {punjabiHits.slice(0, 6).map(song => (
                  <SongCard key={song.id} song={song} queueContext={punjabiHits} />
                ))}
              </div>
            </section>
          )}

          {/* SECTION 6: Chill & Lo-Fi Beats */}
          {chillTracks.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Music className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-xl font-black text-white tracking-tight">Chill & Lo-Fi Vibes</h2>
                </div>
                <button
                  onClick={() => navigate('/search?q=Chill')}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition"
                >
                  Show all
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {chillTracks.slice(0, 6).map(song => (
                  <SongCard key={song.id} song={song} queueContext={chillTracks} />
                ))}
              </div>
            </section>
          )}

          {/* SECTION 7: Curated Playlists */}
          {curatedPlaylists.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-pink-400" />
                  <h2 className="text-xl font-black text-white tracking-tight">Featured Playlists</h2>
                </div>
                <button
                  onClick={() => navigate('/search?q=Hits&tab=playlists')}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition"
                >
                  Show all
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {curatedPlaylists.slice(0, 6).map(playlist => (
                  <PlaylistCard key={playlist.id} playlist={playlist} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};
