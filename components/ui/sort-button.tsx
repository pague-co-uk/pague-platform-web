"use client";

import Link from "next/link";
import {
  usePathname,
  useSearchParams,
} from "next/navigation";

// ============================================================================
// Types
// ============================================================================

export type SortDirection =
  | "asc"
  | "desc";

interface SortButtonProps {
  field: string;

  label: string;

  defaultDirection?: SortDirection;

  className?: string;
}

// ============================================================================
// Sort button
// ============================================================================

export function SortButton({
  field,
  label,
  defaultDirection = "asc",
  className = "",
}: SortButtonProps) {
  const pathname =
    usePathname();

  const searchParams =
    useSearchParams();

  const currentField =
    searchParams.get("sortBy");

  const currentDirection =
    searchParams.get(
      "sortDirection",
    ) as SortDirection | null;

  const isActive =
    currentField === field;

  const nextDirection: SortDirection =
    isActive &&
      currentDirection === "asc"
      ? "desc"
      : isActive &&
        currentDirection ===
        "desc"
        ? "asc"
        : defaultDirection;

  const params =
    new URLSearchParams(
      searchParams.toString(),
    );

  params.set(
    "sortBy",
    field,
  );

  params.set(
    "sortDirection",
    nextDirection,
  );

  // Sorting always starts from the first page.
  params.delete("page");

  const href =
    `${pathname}?${params.toString()}`;

  return (
    <Link
      href={href}
      className={[
        "group inline-flex items-center gap-1.5",
        "text-[10px] font-semibold uppercase tracking-[0.1em]",
        "transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-blue-500/30",
        isActive
          ? "text-slate-700"
          : "text-slate-400 hover:text-slate-700",
        className,
      ].join(" ")}
      aria-label={
        isActive
          ? `Sort by ${label} ${nextDirection === "asc" ? "ascending" : "descending"}`
          : `Sort by ${label}`
      }
    >
      <span>
        {label}
      </span>

      <SortIcon
        active={isActive}
        direction={
          isActive
            ? currentDirection ??
            defaultDirection
            : null
        }
      />
    </Link>
  );
}

// ============================================================================
// Sort icon
// ============================================================================

interface SortIconProps {
  active: boolean;

  direction:
  | SortDirection
  | null;
}

function SortIcon({
  active,
  direction,
}: SortIconProps) {
  if (!active) {
    return (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-3.5 w-3.5 text-slate-300 transition-colors group-hover:text-slate-400"
        aria-hidden="true"
      >
        <path
          d="M5 6.5 8 3.5l3 3M5 9.5l3 3 3-3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (direction === "asc") {
    return (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        className="h-3.5 w-3.5 text-blue-600"
        aria-hidden="true"
      >
        <path
          d="m4.5 8.5 3.5-3.5 3.5 3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-3.5 w-3.5 text-blue-600"
      aria-hidden="true"
    >
      <path
        d="m4.5 7.5 3.5 3.5 3.5-3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}