import React from 'react';
import { AlertCircle, RefreshCw, Music2 } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  actionText?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to load music right now',
  message = 'We encountered an issue communicating with the music service. Please check your connection and try again.',
  onRetry,
  actionText = 'Try Again'
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 my-8 text-center bg-zinc-900/40 border border-white/5 rounded-2xl max-w-md mx-auto">
      <div className="w-14 h-14 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4 ring-1 ring-rose-500/20">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-zinc-400 mb-6 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
          {actionText}
        </button>
      )}
    </div>
  );
};

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Nothing here yet',
  message = 'Explore songs, albums, and artists to populate this section.',
  icon,
  action
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-zinc-900/20 border border-white/5 rounded-2xl my-6">
      <div className="w-16 h-16 rounded-full bg-zinc-800/80 text-zinc-400 flex items-center justify-center mb-4">
        {icon || <Music2 className="w-8 h-8" />}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-zinc-400 max-w-sm mb-6 leading-relaxed">{message}</p>
      {action}
    </div>
  );
};
