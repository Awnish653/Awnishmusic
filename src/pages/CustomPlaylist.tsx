import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play,
  Shuffle,
  Music2,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  Clock,
  PlusCircle
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { usePlayer } from '../context/PlayerContext';
import { SongRow } from '../components/SongRow';
import { EmptyState } from '../components/FeedbackStates';
import { formatDuration } from '../utils/formatters';
import { ImageWithFallback } from '../utils/image';

export const CustomPlaylist: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    userPlaylists,
    updatePlaylist,
    deletePlaylist,
    removeSongFromPlaylist
  } = useLibrary();
  const { playSong } = usePlayer();

  const playlist = userPlaylists.find(p => p.id === id);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(playlist?.name || '');
  const [description, setDescription] = useState(playlist?.description || '');
  const [filterQuery, setFilterQuery] = useState('');

  if (!playlist) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto pb-32">
        <EmptyState
          title="Playlist Not Found"
          message="This playlist may have been removed or does not exist."
          action={
            <button
              onClick={() => navigate('/library')}
              className="px-5 py-2.5 rounded-full bg-[#F4FF3B] lg:bg-[#1A1A1A] text-black lg:text-white font-bold text-xs shadow-xs transition"
            >
              Back to Library
            </button>
          }
        />
      </div>
    );
  }

  const songs = playlist.songs || [];
  const filteredSongs = songs.filter(s =>
    s.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
    s.artist.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const totalDurationSecs = songs.reduce((acc, s) => acc + (s.duration || 0), 0);

  const handleSaveMeta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    updatePlaylist(playlist.id, { name: name.trim(), description: description.trim() });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete playlist "${playlist.name}"?`)) {
      deletePlaylist(playlist.id);
      navigate('/library');
    }
  };

  const handlePlayAll = () => {
    if (filteredSongs.length > 0) {
      playSong(filteredSongs[0], filteredSongs);
    }
  };

  const handleShuffle = () => {
    if (filteredSongs.length > 0) {
      const shuffled = [...filteredSongs].sort(() => Math.random() - 0.5);
      playSong(shuffled[0], shuffled);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-end p-6 md:p-8 rounded-3xl bg-[#151920] lg:bg-white border border-white/10 lg:border-gray-200/80 shadow-sm">
        {/* Cover Art */}
        <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl bg-zinc-800 lg:bg-gray-100 flex items-center justify-center text-white lg:text-gray-900 shadow-sm shrink-0 overflow-hidden ring-1 ring-black/10">
          {playlist.image ? (
            <ImageWithFallback
              src={playlist.image}
              alt={playlist.name}
              fallbackTitle={playlist.name}
              type="playlist"
              containerClassName="w-full h-full"
              className="w-full h-full object-cover"
            />
          ) : (
            <Music2 className="w-16 h-16 text-zinc-500 lg:text-gray-400" />
          )}
        </div>

        {/* Meta / Editable Form */}
        <div className="flex flex-col space-y-3 text-center md:text-left flex-1 min-w-0">
          <span className="text-xs uppercase font-bold text-lime-400 lg:text-lime-700 tracking-wider">
            Custom Playlist
          </span>

          {isEditing ? (
            <form onSubmit={handleSaveMeta} className="space-y-3 max-w-md">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Playlist name"
                className="w-full px-3 py-2 bg-[#0D1015] lg:bg-gray-50 border border-[#F4FF3B] lg:border-black rounded-xl text-base font-bold text-white lg:text-gray-900 outline-none"
                autoFocus
              />
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Description (optional)"
                rows={2}
                className="w-full px-3 py-2 bg-[#0D1015] lg:bg-gray-50 border border-white/10 lg:border-gray-200 rounded-xl text-xs text-white lg:text-gray-900 outline-none resize-none"
              />
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F4FF3B] lg:bg-[#1A1A1A] text-black lg:text-white text-xs font-bold shadow-xs transition"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 lg:bg-gray-100 text-zinc-300 lg:text-gray-700 text-xs transition"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex items-center justify-center md:justify-start gap-3">
                <h1 className="text-2xl sm:text-4xl font-black text-white lg:text-gray-900 tracking-tight break-words">
                  {playlist.name}
                </h1>
                <button
                  onClick={() => {
                    setName(playlist.name);
                    setDescription(playlist.description || '');
                    setIsEditing(true);
                  }}
                  className="p-1.5 text-zinc-400 lg:text-gray-400 hover:text-white lg:hover:text-black hover:bg-white/10 lg:hover:bg-gray-100 rounded-lg transition"
                  title="Edit Playlist Details"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              {playlist.description && (
                <p className="text-xs sm:text-sm text-zinc-400 lg:text-gray-600 max-w-xl">
                  {playlist.description}
                </p>
              )}

              <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-zinc-400 lg:text-gray-500 font-medium">
                <span>{songs.length} songs</span>
                {totalDurationSecs > 0 && <span>• {formatDuration(totalDurationSecs)}</span>}
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-2">
                <button
                  onClick={handlePlayAll}
                  disabled={songs.length === 0}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#F4FF3B] lg:bg-[#1A1A1A] text-black lg:text-white font-bold text-xs sm:text-sm shadow-md transition hover:opacity-90 active:scale-95 disabled:opacity-50"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Play All</span>
                </button>

                <button
                  onClick={handleShuffle}
                  disabled={songs.length === 0}
                  className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 lg:bg-gray-100 text-white lg:text-gray-900 font-semibold text-xs sm:text-sm border border-white/10 lg:border-gray-200 transition hover:bg-white/20 lg:hover:bg-gray-200 active:scale-95 disabled:opacity-50"
                >
                  <Shuffle className="w-4 h-4" />
                  <span>Shuffle</span>
                </button>

                <button
                  onClick={handleDelete}
                  className="p-3 text-zinc-400 lg:text-gray-400 hover:text-rose-500 rounded-full border border-white/10 lg:border-gray-200 transition"
                  title="Delete Playlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Playlist Content */}
      {songs.length === 0 ? (
        <EmptyState
          title="This Playlist is Empty"
          message="Search for your favorite tracks or artists and use the '+' button to add songs here."
          icon={<PlusCircle className="w-8 h-8 text-lime-400 lg:text-lime-700" />}
          action={
            <button
              onClick={() => navigate('/search')}
              className="px-5 py-2.5 rounded-full bg-[#F4FF3B] lg:bg-[#1A1A1A] text-black lg:text-white font-bold text-xs shadow-xs transition"
            >
              Search & Add Songs
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 lg:text-gray-400" />
            <input
              type="text"
              value={filterQuery}
              onChange={e => setFilterQuery(e.target.value)}
              placeholder="Filter playlist tracks..."
              className="w-full pl-9 pr-3 py-2 bg-[#151920] lg:bg-white border border-white/10 lg:border-gray-200 focus:border-[#F4FF3B] lg:focus:border-black rounded-xl text-xs text-white lg:text-gray-900 placeholder-zinc-500 lg:placeholder-gray-400 outline-none transition shadow-xs"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-4 py-2 text-xs font-bold text-zinc-400 lg:text-gray-400 uppercase tracking-wider border-b border-white/5 lg:border-gray-200">
              <div className="flex items-center gap-4">
                <span className="w-6 text-center">#</span>
                <span>Title</span>
              </div>
              <div className="flex items-center gap-8">
                <span className="hidden md:inline">Album</span>
                <Clock className="w-4 h-4" />
              </div>
            </div>

            {filteredSongs.map((song, i) => (
              <SongRow
                key={`${song.id}-${i}`}
                song={song}
                index={i}
                queueContext={filteredSongs}
                onRemove={() => removeSongFromPlaylist(playlist.id, song.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
