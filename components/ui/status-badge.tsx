import type {
  ReactNode,
} from "react";

// ============================================================================
// Types
// ============================================================================

export type StatusBadgeTone =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";

interface StatusBadgeProps {
  children: ReactNode;

  tone?: StatusBadgeTone;

  dot?: boolean;

  className?: string;
}

// ============================================================================
// Status badge
// ============================================================================

export function StatusBadge({
  children,
  tone = "neutral",
  dot = true,
  className = "",
}: StatusBadgeProps) {
  return (
    <span
      className={[
        "inline-flex w-fit items-center gap-1.5",
        "rounded-full px-2.5 py-1",
        "text-[11px] font-medium leading-none",
        "whitespace-nowrap",
        toneClasses[tone],
        className,
      ].join(" ")}
    >
      {dot && (
        <span
          className={[
            "h-1.5 w-1.5 shrink-0 rounded-full",
            dotClasses[tone],
          ].join(" ")}
          aria-hidden="true"
        />
      )}

      {children}
    </span>
  );
}

// ============================================================================
// Tone
// ============================================================================

const toneClasses: Record<
  StatusBadgeTone,
  string
> = {
  success:
    "bg-emerald-50 text-emerald-700",

  warning:
    "bg-amber-50 text-amber-700",

  danger:
    "bg-red-50 text-red-700",

  info:
    "bg-blue-50 text-blue-700",

  neutral:
    "bg-slate-100 text-slate-600",
};

const dotClasses: Record<
  StatusBadgeTone,
  string
> = {
  success:
    "bg-emerald-500",

  warning:
    "bg-amber-500",

  danger:
    "bg-red-500",

  info:
    "bg-blue-500",

  neutral:
    "bg-slate-400",
};