"use client";

import {
  useEffect,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  PageContainer,
} from "@/components/layout/page-container";

import {
  PageHeader,
} from "@/components/layout/page-header";

// ============================================================================
// Props
// ============================================================================

interface ErrorPageProps {
  readonly error: Error & {
    readonly digest?: string;
  };

  readonly reset: () => void;
}

// ============================================================================
// Page
// ============================================================================

export default function ErrorPage({
  error,
  reset,
}: ErrorPageProps) {
  const router =
    useRouter();

  useEffect(() => {
    console.error(
      "[AppErrorBoundary]",
      error,
    );
  }, [error]);

  return (
    <PageContainer>
      <div className="flex min-h-[60vh] items-center justify-center py-12">
        <div className="w-full max-w-lg">
          <PageHeader
            title="Something went wrong"
            description="We couldn't load this page. Your data has not been affected."
          />

          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
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

              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-semibold text-slate-900">
                  Unable to load the page
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  An unexpected server error
                  occurred while loading this
                  page. Please try again.
                </p>

                {error.digest && (
                  <p className="mt-3 font-mono text-xs text-slate-400">
                    Reference: {error.digest}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => reset()}
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Try again
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push("/")
                }
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Go to dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}