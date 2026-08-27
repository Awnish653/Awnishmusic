import React, { useState } from 'react';
import { Plus, Check, Music, X, FolderPlus } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';

export const AddToPlaylistModal: React.FC = () => {
  const {
    activeSongForModal,
    setActiveSongForModal,
    userPlaylists,
    createPlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist
  } = useLibrary();

  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  if (!activeSongForModal) return null;

  const handleCreateAndAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    const pl = createPlaylist(newPlaylistName.trim());
    addSongToPlaylist(pl.id, activeSongForModal);
    setNewPlaylistName('');
    setIsCreatingNew(false);
  };

  const toggleSongInPlaylist = (playlistId: string, isContained: boolean) => {
    if (isContained) {
      removeSongFromPlaylist(playlistId, activeSongForModal.id);
    } else {
      addSongToPlaylist(playlistId, activeSongForModal);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <h3 className="text-base font-semibold text-white">Add to Playlist</h3>
            <p className="text-xs text-zinc-400 truncate max-w-[280px]">
              {activeSongForModal.title} • {activeSongForModal.artist}
            </p>
          </div>
          <button
            onClick={() => setActiveSongForModal(null)}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          {isCreatingNew ? (
            <form onSubmit={handleCreateAndAdd} className="space-y-3 p-3 bg-zinc-800/40 rounded-xl border border-white/5">
              <label className="text-xs font-medium text-zinc-300">Playlist Name</label>
              <input
                type="text"
                value={newPlaylistName}
                onChange={e => setNewPlaylistName(e.target.value)}
                placeholder="e.g. Late Night Vibes"
                autoFocus
                className="w-full px-3 py-2 text-sm bg-zinc-950 border border-white/10 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newPlaylistName.trim()}
                  className="px-4 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition"
                >
                  Create & Add
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsCreatingNew(true)}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-zinc-800/30 hover:bg-zinc-800/70 border border-white/5 hover:border-white/10 text-white transition text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition">
                <FolderPlus className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Create New Playlist</p>
                <p className="text-xs text-zinc-400">Save this song into a new collection</p>
              </div>
            </button>
          )}

          <div className="pt-2">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider px-1 pb-2">Your Playlists</p>
            {userPlaylists.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center">No playlists created yet.</p>
            ) : (
              <div className="space-y-1.5">
                {userPlaylists.map(pl => {
                  const isContained = pl.songs.some(s => s.id === activeSongForModal.id);
                  return (
                    <button
                      key={pl.id}
                      onClick={() => toggleSongInPlaylist(pl.id, isContained)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition text-left ${
                        isContained
                          ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-200'
                          : 'bg-zinc-900/50 border-white/5 hover:bg-zinc-800/60 text-zinc-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-zinc-800 overflow-hidden shrink-0 flex items-center justify-center">
                          {pl.coverImage ? (
                            <img
                              src={pl.coverImage}
                              alt={pl.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <Music className="w-5 h-5 text-zinc-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate text-white">{pl.name}</p>
                          <p className="text-xs text-zinc-400">{pl.songs.length} tracks</p>
                        </div>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition ${
                          isContained
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-zinc-700 text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 bg-zinc-950/60 flex justify-end">
          <button
            onClick={() => setActiveSongForModal(null)}
            className="px-4 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
