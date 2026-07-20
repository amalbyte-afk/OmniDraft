import { AlertCircle } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="flex items-center gap-3 rounded-xl border border-error/20 bg-error/10 p-4 text-error"
    >
      <AlertCircle className="h-5 w-5 shrink-0" />
      <p className="flex-1 text-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm font-medium hover:underline"
        >
          Retry
        </button>
      )}
    </div>
  );
}
