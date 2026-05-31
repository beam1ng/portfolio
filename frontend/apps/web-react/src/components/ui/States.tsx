interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="state" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span className="muted">{label}</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="state" role="alert">
      <p className="section-title">Something went wrong</p>
      <p className="muted">{message ?? 'Could not reach the portfolio API.'}</p>
      {onRetry && (
        <button type="button" className="btn btn--ghost" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="state">
      <p className="muted">{message}</p>
    </div>
  );
}
