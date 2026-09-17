"use client";

import {
  useEffect,
} from "react";

interface GlobalErrorProps {
  readonly error: Error & {
    readonly digest?: string;
  };

  readonly reset: () => void;
}

export default function GlobalError({
  error,
  reset,
}: GlobalErrorProps) {
  useEffect(() => {
    console.error(
      "[GlobalErrorBoundary]",
      error,
    );
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <main className="flex min-h-screen items-center justify-center px-6 py-12">
          <div className="w-full max-w-lg">
            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
                    />
                  </svg>
                </div>

                <div>
                  <h1 className="text-lg font-semibold">
                    Pague encountered an error
                  </h1>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    An unexpected error
                    prevented the application
                    from loading this page.
                  </p>

                  {error.digest && (
                    <p className="mt-3 font-mono text-xs text-slate-400">
                      Reference: {error.digest}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => reset()}
                  className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}