import type {
  ReactNode,
} from "react";

// ============================================================================
// Types
// ============================================================================

interface EmptyStateProps {
  title: string;

  description?: string;

  icon?: ReactNode;

  children?: ReactNode;
}

// ============================================================================
// Empty state
// ============================================================================

export function EmptyState({
  title,
  description,
  icon,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-12 text-center">
      {icon && (
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
          {icon}
        </div>
      )}

      <h3 className="text-sm font-semibold text-slate-900">
        {title}
      </h3>

      {description && (
        <p className="mt-1.5 max-w-md text-sm leading-6 text-slate-500">
          {description}
        </p>
      )}

      {children && (
        <div className="mt-5">
          {children}
        </div>
      )}
    </div>
  );
}