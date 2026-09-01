import type {
  ReactNode,
} from "react";

// ============================================================================
// Types
// ============================================================================

export interface ErrorStateProps {
  title?: string;

  description?: string;

  children?: ReactNode;
}

// ============================================================================
// Error state
// ============================================================================

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this information. Please try again.",
  children,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex min-h-[280px] flex-col items-center justify-center px-6 py-12 text-center"
    >
      {/* ==================================================================
          Icon
      ================================================================== */}

      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path
            d="M12 8v4"
            strokeLinecap="round"
          />

          <path
            d="M12 16h.01"
            strokeLinecap="round"
          />

          <path
            d="M10.3 3.7 2.7 17a2 2 0 0 0 1.74 3h15.12a2 2 0 0 0 1.74-3L13.7 3.7a2 2 0 0 0-3.4 0Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* ==================================================================
          Content
      ================================================================== */}

      <h3 className="text-sm font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-1.5 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>

      {/* ==================================================================
          Action
      ================================================================== */}

      {children && (
        <div className="mt-5">
          {children}
        </div>
      )}
    </div>
  );
}