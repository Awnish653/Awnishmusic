import React, { useState } from 'react';
import { Download, X, Check, ShieldCheck, HardDrive, Sparkles, Loader2 } from 'lucide-react';
import { Song, AudioQualityKey } from '../types/music';
import { downloadSongFile, DownloadProgress } from '../utils/downloader';
import { ImageWithFallback } from '../utils/image';
import { formatDuration } from '../utils/formatters';

interface DownloadModalProps {
  song: Song | null;
  onClose: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({ song, onClose }) => {
  const [selectedQuality, setSelectedQuality] = useState<AudioQualityKey>('320kbps');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!song) return null;

  const qualityOptions: { key: AudioQualityKey; label: string; desc: string; estSize: string; badge?: string }[] = [
    {
      key: '320kbps',
      label: '320 kbps • Ultra HD',
      desc: 'Lossless studio master audio fidelity (Best Quality)',
      estSize: song.duration ? `${Math.round((song.duration * 320) / (8 * 1024))} MB` : '~9.5 MB',
      badge: 'PRO'
    },
    {
      key: '160kbps',
      label: '160 kbps • High Definition',
      desc: 'Standard high-fidelity streaming quality',
      estSize: song.duration ? `${Math.round((song.duration * 160) / (8 * 1024))} MB` : '~4.8 MB'
    },
    {
      key: '96kbps',
      label: '96 kbps • Medium',
      desc: 'Balanced clarity and moderate bandwidth consumption',
      estSize: song.duration ? `${Math.round((song.duration * 96) / (8 * 1024))} MB` : '~2.9 MB'
    },
    {
      key: '48kbps',
      label: '48 kbps • Data Saver',
      desc: 'Lightweight format for slower connections or limited storage',
      estSize: song.duration ? `${Math.round((song.duration * 48) / (8 * 1024))} MB` : '~1.5 MB'
    }
  ];

  const handleDownload = async () => {
    setIsDownloading(true);
    setIsSuccess(false);
    setStatusMessage('Initiating download...');

    const success = await downloadSongFile(song, selectedQuality, (p: DownloadProgress) => {
      if (p.message) setStatusMessage(p.message);
      if (p.status === 'completed') {
        setIsSuccess(true);
      }
    });

    setTimeout(() => {
      setIsDownloading(false);
      if (success) {
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    }, 800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-zinc-900 border border-white/10 shadow-2xl overflow-hidden text-zinc-100 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-zinc-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Download Audio Track</h3>
              <p className="text-[11px] text-zinc-400">Offline playback with ID3 tags</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Song Preview Summary */}
        <div className="p-5 flex items-center gap-4 bg-zinc-950/20 border-b border-white/5">
          <ImageWithFallback
            src={song.image}
            alt={song.title}
            fallbackTitle={song.title}
            type="song"
            containerClassName="w-14 h-14 rounded-xl shrink-0 shadow-md ring-1 ring-white/10"
            className="w-full h-full object-cover"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-white truncate" title={song.title}>
              {song.title}
            </h4>
            <p className="text-xs text-zinc-400 truncate mt-0.5" title={song.artist}>
              {song.artist}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-1">
              <span>{formatDuration(song.duration)}</span>
              {song.album?.name && (
                <>
                  <span>•</span>
                  <span className="truncate max-w-[140px]">{song.album.name}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quality Selector */}
        <div className="p-5 space-y-3">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
            Select Audio Bitrate
          </label>

          <div className="space-y-2">
            {qualityOptions.map(opt => {
              const isSelected = selectedQuality === opt.key;
              return (
                <div
                  key={opt.key}
                  onClick={() => !isDownloading && setSelectedQuality(opt.key)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-950/60 to-violet-950/40 border-indigo-500/60 shadow-lg shadow-indigo-950/30 ring-1 ring-indigo-500/40'
                      : 'bg-zinc-800/40 border-white/5 hover:bg-zinc-800/80 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition ${
                        isSelected
                          ? 'border-indigo-400 bg-indigo-600'
                          : 'border-zinc-600 bg-zinc-800'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{opt.label}</span>
                        {opt.badge && (
                          <span className="px-1.5 py-0.2 rounded bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-[9px] font-black text-white">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-400 block mt-0.5">{opt.desc}</span>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-zinc-400 bg-black/40 px-2 py-0.5 rounded-md shrink-0 ml-2">
                    {opt.estSize}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div className="p-3 rounded-xl bg-zinc-950 border border-white/5 text-xs text-zinc-300 flex items-center gap-2 animate-fade-in">
              {isDownloading ? (
                <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
              ) : isSuccess ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              )}
              <span className="truncate">{statusMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-white/5 bg-zinc-950/40 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDownloading}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300 transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Downloading...</span>
              </>
            ) : isSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download MP3</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
