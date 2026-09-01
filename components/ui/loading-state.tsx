interface LoadingStateProps {
  rows?: number;

  className?: string;
}

// ============================================================================
// Loading state
// ============================================================================

export function LoadingState({
  rows = 5,
  className = "",
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={[
        "overflow-hidden rounded-xl border border-slate-200 bg-white",
        className,
      ].join(" ")}
    >
      <div className="animate-pulse">
        {Array.from(
          { length: rows },
          (_, index) => (
            <div
              key={index}
              className="flex items-center gap-4 border-b border-slate-100 px-4 py-4 last:border-b-0"
            >
              <div className="h-9 w-9 shrink-0 rounded-lg bg-slate-100" />

              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3 w-2/5 rounded bg-slate-100" />

                <div className="h-2.5 w-1/4 rounded bg-slate-100" />
              </div>

              <div className="hidden h-3 w-20 rounded bg-slate-100 sm:block" />

              <div className="h-6 w-16 rounded-full bg-slate-100" />
            </div>
          ),
        )}
      </div>

      <span className="sr-only">
        Loading...
      </span>
    </div>
  );
}