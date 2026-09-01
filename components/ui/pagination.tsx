"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

// ============================================================================
// Types
// ============================================================================

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface PaginationProps {
  meta: PaginationMeta;
}

// ============================================================================
// Pagination
// ============================================================================

export function Pagination({
  meta,
}: PaginationProps) {
  const searchParams =
    useSearchParams();

  if (
    meta.total === 0 ||
    meta.totalPages <= 1
  ) {
    return null;
  }

  const createHref = (
    page: number,
  ): string => {
    const params =
      new URLSearchParams(
        searchParams.toString(),
      );

    params.set(
      "page",
      String(page),
    );

    params.set(
      "pageSize",
      String(meta.pageSize),
    );

    return `?${params.toString()}`;
  };

  const start =
    (meta.page - 1) *
    meta.pageSize +
    1;

  const end =
    Math.min(
      meta.page *
      meta.pageSize,
      meta.total,
    );

  const pages =
    getPageNumbers(
      meta.page,
      meta.totalPages,
    );

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
    >
      {/* ==================================================================
          Result summary
      ================================================================== */}

      <p className="text-xs text-slate-500">
        Showing{" "}
        <span className="font-medium text-slate-700">
          {start}
        </span>{" "}
        to{" "}
        <span className="font-medium text-slate-700">
          {end}
        </span>{" "}
        of{" "}
        <span className="font-medium text-slate-700">
          {meta.total}
        </span>
      </p>

      {/* ==================================================================
          Controls
      ================================================================== */}

      <div className="flex items-center justify-between gap-1 sm:justify-end">
        {/* Previous */}

        <PaginationLink
          href={
            meta.page > 1
              ? createHref(
                meta.page - 1,
              )
              : undefined
          }
          ariaLabel="Previous page"
          disabled={
            meta.page <= 1
          }
        >
          <ChevronLeftIcon />
        </PaginationLink>

        {/* Page numbers */}

        <div className="hidden items-center gap-1 sm:flex">
          {pages.map(
            (page, index) =>
              page === "ellipsis" ? (
                <span
                  key={`ellipsis-${index}`}
                  className="flex h-8 w-8 items-center justify-center text-xs text-slate-400"
                  aria-hidden="true"
                >
                  …
                </span>
              ) : (
                <PaginationLink
                  key={page}
                  href={createHref(
                    page,
                  )}
                  active={
                    page ===
                    meta.page
                  }
                  ariaLabel={`Page ${page}`}
                >
                  {page}
                </PaginationLink>
              ),
          )}
        </div>

        {/* Mobile page indicator */}

        <span className="px-2 text-xs text-slate-500 sm:hidden">
          Page{" "}
          <span className="font-medium text-slate-700">
            {meta.page}
          </span>{" "}
          of{" "}
          <span className="font-medium text-slate-700">
            {meta.totalPages}
          </span>
        </span>

        {/* Next */}

        <PaginationLink
          href={
            meta.page <
              meta.totalPages
              ? createHref(
                meta.page + 1,
              )
              : undefined
          }
          ariaLabel="Next page"
          disabled={
            meta.page >=
            meta.totalPages
          }
        >
          <ChevronRightIcon />
        </PaginationLink>
      </div>
    </nav>
  );
}

// ============================================================================
// Pagination link
// ============================================================================

interface PaginationLinkProps {
  href?: string;
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  ariaLabel: string;
}

function PaginationLink({
  href,
  children,
  active = false,
  disabled = false,
  ariaLabel,
}: PaginationLinkProps) {
  const className = [
    "flex h-8 min-w-8 items-center justify-center rounded-md px-2",
    "text-xs font-medium",
    "transition-colors",
    "focus:outline-none focus:ring-2 focus:ring-blue-500/30",
    active
      ? "bg-blue-600 text-white"
      : disabled
        ? "cursor-not-allowed text-slate-300"
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
  ].join(" ");

  if (
    disabled ||
    !href
  ) {
    return (
      <span
        aria-label={ariaLabel}
        aria-disabled="true"
        className={className}
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      aria-current={
        active
          ? "page"
          : undefined
      }
      className={className}
    >
      {children}
    </Link>
  );
}

// ============================================================================
// Page numbers
// ============================================================================

type PageNumber =
  | number
  | "ellipsis";

function getPageNumbers(
  currentPage: number,
  totalPages: number,
): readonly PageNumber[] {
  if (
    totalPages <= 7
  ) {
    return Array.from(
      {
        length:
          totalPages,
      },
      (_, index) =>
        index + 1,
    );
  }

  if (
    currentPage <= 4
  ) {
    return [
      1,
      2,
      3,
      4,
      5,
      "ellipsis",
      totalPages,
    ];
  }

  if (
    currentPage >=
    totalPages - 3
  ) {
    return [
      1,
      "ellipsis",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis",
    totalPages,
  ];
}

// ============================================================================
// Icons
// ============================================================================

function ChevronLeftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="m15 18-6-6 6-6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="m9 18 6-6-6-6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}