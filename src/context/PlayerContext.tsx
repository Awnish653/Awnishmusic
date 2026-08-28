import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Song, RepeatMode, AudioQualityKey } from '../types/music';
import { storage } from '../utils/storage';
import { getSongById, getSongSuggestions, searchSongs } from '../services/api';
import { sanitizeAudioUrl } from '../utils/formatters';
import { isValidAudioStream } from '../services/normalizers';

interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  queue: Song[];
  currentIndex: number;
  audioQuality: AudioQualityKey;
  suggestions: Song[];
  isQueueOpen: boolean;
  isFullscreenOpen: boolean;
  downloadSongModal: Song | null;
  error: string | null;
  playSong: (song: Song, newQueue?: Song[]) => Promise<void>;
  togglePlay: () => void;
  play: () => void;
  pause: () => void;
  next: () => void;
  prev: () => void;
  seek: (seconds: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  cycleRepeatMode: () => void;
  toggleShuffle: () => void;
  setAudioQuality: (quality: AudioQualityKey) => void;
  addToQueue: (song: Song) => void;
  playNextInQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  setIsQueueOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  setIsFullscreenOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  openDownloadModal: (song: Song) => void;
  closeDownloadModal: () => void;
  retryPlayback: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(() => storage.getVolume());
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [isShuffled, setIsShuffled] = useState<boolean>(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [originalQueue, setOriginalQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [audioQuality, setAudioQualityState] = useState<AudioQualityKey>(() => storage.getAudioQuality());
  const [suggestions, setSuggestions] = useState<Song[]>([]);
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState<boolean>(false);
  const [downloadSongModal, setDownloadSongModal] = useState<Song | null>(null);
  const [error, setError] = useState<string | null>(null);

  const openDownloadModal = useCallback((song: Song) => {
    setDownloadSongModal(song);
  }, []);

  const closeDownloadModal = useCallback(() => {
    setDownloadSongModal(null);
  }, []);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousVolumeRef = useRef<number>(volume);

  // Initialize HTML5 Audio instance
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.volume = isMuted ? 0 : volume;
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      if (audio) {
        setCurrentTime(audio.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      if (audio && !isNaN(audio.duration)) {
        setDuration(audio.duration);
        setIsLoading(false);
      }
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
      setError(null);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleError = (e: any) => {
      console.warn('Audio playback error event:', e);
      setIsLoading(false);
      setIsPlaying(false);
      setError('Unable to stream audio track. Trying fallback or next track...');
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Update volume & muted on audio instance
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
    storage.setVolume(volume);
  }, [volume, isMuted]);

  // Audio track ended logic
  const handleSongEnded = useCallback(() => {
    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.warn);
      }
      return;
    }

    if (queue.length > 0) {
      if (currentIndex < queue.length - 1) {
        const nextSong = queue[currentIndex + 1];
        setCurrentIndex(currentIndex + 1);
        playSong(nextSong);
      } else if (repeatMode === 'all') {
        const firstSong = queue[0];
        setCurrentIndex(0);
        playSong(firstSong);
      } else {
        // Queue finished. If we have suggestions, auto-play from suggestions!
        if (suggestions.length > 0) {
          const nextSuggested = suggestions[0];
          setQueue(prev => [...prev, ...suggestions]);
          setCurrentIndex(queue.length);
          playSong(nextSuggested);
        } else {
          setIsPlaying(false);
        }
      }
    }
  }, [queue, currentIndex, repeatMode, suggestions]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.addEventListener('ended', handleSongEnded);
    return () => {
      audio.removeEventListener('ended', handleSongEnded);
    };
  }, [handleSongEnded]);

  // Fetch suggestions when currentSong changes
  useEffect(() => {
    if (!currentSong?.id) return;
    let isCancelled = false;

    async function loadSuggestions() {
      try {
        let list = await getSongSuggestions(currentSong!.id, audioQuality);
        // If empty, fall back to searching artist or related genre
        if (!list || list.length === 0) {
          const artistQuery = currentSong?.artist?.split(',')[0]?.trim();
          if (artistQuery) {
            list = await searchSongs(artistQuery, audioQuality);
          }
        }
        if (!isCancelled && list && list.length > 0) {
          const filtered = list.filter(s => s.id !== currentSong!.id);
          setSuggestions(filtered.slice(0, 10));
        }
      } catch (err) {
        console.warn('Failed to load suggestions:', err);
      }
    }

    loadSuggestions();
    return () => {
      isCancelled = true;
    };
  }, [currentSong?.id, audioQuality]);

  // Play a specific song
  const playSong = async (song: Song, newQueue?: Song[]) => {
    if (!song) return;
    setError(null);
    setIsLoading(true);

    try {
      let resolvedSong: Song = { ...song };

      // If song lacks valid stream or audioUrls, fetch full song details
      const hasValidPlayableUrl = isValidAudioStream(resolvedSong.playableUrl);
      const hasValidAudioList = Array.isArray(resolvedSong.audioUrls) && resolvedSong.audioUrls.some(a => isValidAudioStream(a.url));

      if (!hasValidPlayableUrl || !hasValidAudioList) {
        try {
          if (song.id) {
            const detailed = await getSongById(song.id, audioQuality);
            if (detailed && (isValidAudioStream(detailed.playableUrl) || detailed.audioUrls.some(a => isValidAudioStream(a.url)))) {
              resolvedSong = {
                ...resolvedSong,
                ...detailed,
                image: detailed.image || resolvedSong.image,
                title: detailed.title || resolvedSong.title,
                artist: detailed.artist || resolvedSong.artist,
              };
            }
          }
        } catch (e) {
          console.warn('Could not fetch complete song detail, using basic model:', e);
        }
      }

      // Pick best playable URL
      let streamUrl = isValidAudioStream(resolvedSong.playableUrl) ? sanitizeAudioUrl(resolvedSong.playableUrl) : '';
      if (!streamUrl && Array.isArray(resolvedSong.audioUrls)) {
        const match = resolvedSong.audioUrls.find(a => isValidAudioStream(a.url));
        if (match) {
          streamUrl = sanitizeAudioUrl(match.url);
        }
      }

      if (!streamUrl) {
        throw new Error('No playable audio stream available for this song. Please try another song.');
      }

      resolvedSong.playableUrl = streamUrl;
      setCurrentSong(resolvedSong);
      storage.addRecentlyPlayed(resolvedSong);

      // Handle queue update
      if (newQueue && newQueue.length > 0) {
        setOriginalQueue(newQueue);
        if (isShuffled) {
          const shuffled = [...newQueue].sort(() => Math.random() - 0.5);
          // Keep current song at start
          const withoutCurrent = shuffled.filter(s => s.id !== resolvedSong.id);
          const queueWithCurrent = [resolvedSong, ...withoutCurrent];
          setQueue(queueWithCurrent);
          setCurrentIndex(0);
        } else {
          setQueue(newQueue);
          const foundIdx = newQueue.findIndex(s => s.id === resolvedSong.id);
          setCurrentIndex(foundIdx >= 0 ? foundIdx : 0);
        }
      } else {
        // If not passing a new queue, ensure song is in existing queue
        setQueue(prev => {
          const found = prev.findIndex(s => s.id === resolvedSong.id);
          if (found >= 0) {
            setCurrentIndex(found);
            return prev;
          }
          const updated = [...prev, resolvedSong];
          setCurrentIndex(updated.length - 1);
          return updated;
        });
      }

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = streamUrl;
        audioRef.current.load();
        
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (playErr: any) {
          // If browser blocked autoplay, keep it loaded so next user click starts
          console.warn('Playback start notice:', playErr);
          if (playErr.name === 'NotAllowedError') {
            setIsPlaying(false);
          } else {
            setIsPlaying(true);
          }
        }
      }
    } catch (err: any) {
      console.error('Error starting playback:', err);
      setError(err?.message || 'Failed to play track. Audio stream could not be loaded.');
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  const retryPlayback = () => {
    if (currentSong) {
      playSong(currentSong);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      if (!currentSong && queue.length > 0) {
        playSong(queue[0]);
      } else if (audioRef.current.src) {
        audioRef.current.play().catch(console.warn);
      }
    }
  };

  const play = () => {
    if (audioRef.current && audioRef.current.src) {
      audioRef.current.play().catch(console.warn);
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const next = () => {
    if (queue.length === 0) return;
    if (currentIndex < queue.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      playSong(queue[nextIdx]);
    } else if (repeatMode === 'all') {
      setCurrentIndex(0);
      playSong(queue[0]);
    } else if (suggestions.length > 0) {
      const nextSug = suggestions[0];
      setQueue(prev => [...prev, nextSug]);
      setCurrentIndex(queue.length);
      playSong(nextSug);
    }
  };

  const prev = () => {
    if (!audioRef.current) return;
    // If more than 3 seconds in, seek to beginning of current track
    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      playSong(queue[prevIdx]);
    } else {
      audioRef.current.currentTime = 0;
    }
  };

  const seek = (seconds: number) => {
    if (audioRef.current && !isNaN(seconds)) {
      audioRef.current.currentTime = Math.max(0, Math.min(seconds, duration || 0));
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const setVolume = (vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      setVolumeState(previousVolumeRef.current || 0.85);
    } else {
      previousVolumeRef.current = volume;
      setIsMuted(true);
    }
  };

  const cycleRepeatMode = () => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  const toggleShuffle = () => {
    setIsShuffled(prev => {
      const nextShuffle = !prev;
      if (nextShuffle) {
        // Shuffle queue keeping current song first
        if (currentSong) {
          const others = queue.filter(s => s.id !== currentSong.id).sort(() => Math.random() - 0.5);
          setQueue([currentSong, ...others]);
          setCurrentIndex(0);
        } else {
          setQueue([...queue].sort(() => Math.random() - 0.5));
        }
      } else {
        // Restore original order
        if (originalQueue.length > 0) {
          setQueue(originalQueue);
          if (currentSong) {
            const idx = originalQueue.findIndex(s => s.id === currentSong.id);
            setCurrentIndex(idx >= 0 ? idx : 0);
          }
        }
      }
      return nextShuffle;
    });
  };

  const setAudioQuality = (quality: AudioQualityKey) => {
    setAudioQualityState(quality);
    storage.setAudioQuality(quality);
    // If currently playing, re-resolve song with new quality smoothly
    if (currentSong) {
      getSongById(currentSong.id, quality).then(updated => {
        if (updated && updated.playableUrl) {
          const wasPlaying = isPlaying;
          const currentPos = audioRef.current?.currentTime || 0;
          setCurrentSong(updated);
          if (audioRef.current) {
            audioRef.current.src = sanitizeAudioUrl(updated.playableUrl);
            audioRef.current.currentTime = currentPos;
            if (wasPlaying) audioRef.current.play().catch(console.warn);
          }
        }
      }).catch(console.warn);
    }
  };

  const addToQueue = (song: Song) => {
    setQueue(prev => {
      if (prev.some(s => s.id === song.id)) return prev;
      return [...prev, song];
    });
    setOriginalQueue(prev => {
      if (prev.some(s => s.id === song.id)) return prev;
      return [...prev, song];
    });
  };

  const playNextInQueue = (song: Song) => {
    setQueue(prev => {
      const filtered = prev.filter(s => s.id !== song.id);
      const insertAt = currentIndex + 1;
      const updated = [...filtered.slice(0, insertAt), song, ...filtered.slice(insertAt)];
      return updated;
    });
  };

  const removeFromQueue = (index: number) => {
    setQueue(prev => {
      const updated = prev.filter((_, i) => i !== index);
      if (index < currentIndex) {
        setCurrentIndex(currentIndex - 1);
      } else if (index === currentIndex) {
        if (updated.length > 0) {
          const nextIdx = Math.min(index, updated.length - 1);
          setCurrentIndex(nextIdx);
          playSong(updated[nextIdx]);
        } else {
          setCurrentIndex(-1);
          setCurrentSong(null);
          if (audioRef.current) audioRef.current.pause();
        }
      }
      return updated;
    });
  };

  const clearQueue = () => {
    setQueue(currentSong ? [currentSong] : []);
    setCurrentIndex(currentSong ? 0 : -1);
  };

  const reorderQueue = (fromIndex: number, toIndex: number) => {
    setQueue(prev => {
      const copy = [...prev];
      const [removed] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, removed);
      if (fromIndex === currentIndex) {
        setCurrentIndex(toIndex);
      } else if (fromIndex < currentIndex && toIndex >= currentIndex) {
        setCurrentIndex(currentIndex - 1);
      } else if (fromIndex > currentIndex && toIndex <= currentIndex) {
        setCurrentIndex(currentIndex + 1);
      }
      return copy;
    });
  };

  // Keyboard shortcut listener for universal music controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        next();
      } else if (e.code === 'ArrowLeft' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        prev();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, next, prev, toggleMute]);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        isLoading,
        currentTime,
        duration,
        volume,
        isMuted,
        repeatMode,
        isShuffled,
        queue,
        currentIndex,
        audioQuality,
        suggestions,
        isQueueOpen,
        isFullscreenOpen,
        downloadSongModal,
        error,
        playSong,
        togglePlay,
        play,
        pause,
        next,
        prev,
        seek,
        setVolume,
        toggleMute,
        cycleRepeatMode,
        toggleShuffle,
        setAudioQuality,
        addToQueue,
        playNextInQueue,
        removeFromQueue,
        clearQueue,
        reorderQueue,
        setIsQueueOpen,
        setIsFullscreenOpen,
        openDownloadModal,
        closeDownloadModal,
        retryPlayback
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
