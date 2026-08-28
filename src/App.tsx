import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PlayerProvider } from './context/PlayerContext';
import { LibraryProvider } from './context/LibraryContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { GlobalPlayer } from './components/GlobalPlayer';
import { MiniPlayer } from './components/MiniPlayer';
import { FullscreenPlayer } from './components/FullscreenPlayer';
import { QueueDrawer } from './components/QueueDrawer';
import { AddToPlaylistModal } from './components/AddToPlaylistModal';
import { DownloadModal } from './components/DownloadModal';
import { usePlayer } from './context/PlayerContext';

// Pages
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { Album } from './pages/Album';
import { Artist } from './pages/Artist';
import { Playlist } from './pages/Playlist';
import { CustomPlaylist } from './pages/CustomPlaylist';
import { SongPage } from './pages/Song';
import { LikedSongs } from './pages/LikedSongs';
import { Library } from './pages/Library';

const AppContent: React.FC = () => {
  const { downloadSongModal, closeDownloadModal } = usePlayer();

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-row overflow-x-hidden font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Desktop Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative">
        <Header />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/album/:id" element={<Album />} />
            <Route path="/artist/:id" element={<Artist />} />
            <Route path="/playlist/:id" element={<Playlist />} />
            <Route path="/playlist/custom/:id" element={<CustomPlaylist />} />
            <Route path="/song/:id" element={<SongPage />} />
            <Route path="/liked" element={<LikedSongs />} />
            <Route path="/library" element={<Library />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Persistent Audio Players & Overlays */}
      <GlobalPlayer />
      <MiniPlayer />
      <MobileNav />
      <FullscreenPlayer />
      <QueueDrawer />
      <AddToPlaylistModal />
      {downloadSongModal && (
        <DownloadModal song={downloadSongModal} onClose={closeDownloadModal} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <LibraryProvider>
        <PlayerProvider>
          <AppContent />
        </PlayerProvider>
      </LibraryProvider>
    </BrowserRouter>
  );
}
