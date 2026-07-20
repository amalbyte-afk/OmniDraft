import { Sparkles } from 'lucide-react';

interface EmptyStateProps {
  mode: string;
}

export function EmptyState({ mode }: EmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <Sparkles className="h-8 w-8 text-primary" />
      </div>
      <h2 className="mb-2 text-xl font-semibold text-primary">
        Start your first {mode}
      </h2>
      <p className="mb-8 max-w-md text-text-secondary">
        Choose a template below or type your own message to get started.
      </p>
    </div>
  );
}
