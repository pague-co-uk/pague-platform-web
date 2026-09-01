"use client";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import type {
  ReactNode,
} from "react";
import { useState } from "react";

// ============================================================================
// Types
// ============================================================================

export interface FilterBarProps {
  children: ReactNode;

  /**
   * Search parameter names that should be removed when a filter changes.
   *
   * Defaults to resetting pagination.
   */
  resetParams?: readonly string[];

  className?: string;
}

// ============================================================================
// Filter bar
// ============================================================================

export function FilterBar({
  children,
  resetParams = ["page"],
  className = "",
}: FilterBarProps) {
  const router =
    useRouter();

  const pathname =
    usePathname();

  const searchParams =
    useSearchParams();

  const updateFilter = (
    name: string,
    value: string | null,
  ) => {
    const params =
      new URLSearchParams(
        searchParams.toString(),
      );

    if (
      value === null ||
      value === ""
    ) {
      params.delete(name);
    } else {
      params.set(
        name,
        value,
      );
    }

    for (
      const resetParam of resetParams
    ) {
      params.delete(
        resetParam,
      );
    }

    router.push(
      `${pathname}?${params.toString()}`,
    );
  };

  const clearFilters = () => {
    const params =
      new URLSearchParams(
        searchParams.toString(),
      );

    for (
      const key of Array.from(
        params.keys(),
      )
    ) {
      if (
        key !== "pageSize"
      ) {
        params.delete(
          key,
        );
      }
    }

    router.push(
      pathname,
    );
  };

  const hasFilters =
    Array.from(
      searchParams.keys(),
    ).some(
      (key) =>
        key !== "page" &&
        key !== "pageSize" &&
        key !== "sortBy" &&
        key !== "sortDirection",
    );

  return (
    <div
      className={[
        "flex flex-col gap-3",
        "rounded-xl border border-slate-200 bg-white p-3",
        "sm:flex-row sm:flex-wrap sm:items-center",
        className,
      ].join(" ")}
    >
      {/* ==================================================================
          Filter controls
      ================================================================== */}

      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        {children}
      </div>

      {/* ==================================================================
          Clear filters
      ================================================================== */}

      {hasFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="self-start rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 sm:self-auto"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

// ============================================================================
// Search
// ============================================================================

interface FilterSearchProps {
  name?: string;

  placeholder?: string;

  defaultValue?: string;

  className?: string;
}

export function FilterSearch({
  name = "search",
  placeholder = "Search...",
  defaultValue,
  className = "",
}: FilterSearchProps) {
  const router =
    useRouter();

  const pathname =
    usePathname();

  const searchParams =
    useSearchParams();

  const [value, setValue] =
    useState(
      defaultValue ??
      searchParams.get(
        name,
      ) ??
      "",
    );

  const submit = () => {
    const params =
      new URLSearchParams(
        searchParams.toString(),
      );

    if (value.trim()) {
      params.set(
        name,
        value.trim(),
      );
    } else {
      params.delete(name);
    }

    params.delete("page");

    router.push(
      `${pathname}?${params.toString()}`,
    );
  };

  return (
    <div
      className={[
        "relative w-full sm:max-w-xs",
        className,
      ].join(" ")}
    >
      <SearchIcon />

      <input
        type="search"
        value={value}
        onChange={(event) =>
          setValue(
            event.target.value,
          )
        }
        onKeyDown={(event) => {
          if (
            event.key === "Enter"
          ) {
            submit();
          }
        }}
        placeholder={
          placeholder
        }
        aria-label={
          placeholder
        }
        className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
      />
    </div>
  );
}

// ============================================================================
// Select
// ============================================================================

export interface FilterOption {
  value: string;

  label: string;
}

interface FilterSelectProps {
  name: string;

  options: readonly FilterOption[];

  placeholder?: string;

  className?: string;
}

export function FilterSelect({
  name,
  options,
  placeholder = "All",
  className = "",
}: FilterSelectProps) {
  const router =
    useRouter();

  const pathname =
    usePathname();

  const searchParams =
    useSearchParams();

  const value =
    searchParams.get(
      name,
    ) ?? "";

  const change = (
    nextValue: string,
  ) => {
    const params =
      new URLSearchParams(
        searchParams.toString(),
      );

    if (nextValue) {
      params.set(
        name,
        nextValue,
      );
    } else {
      params.delete(name);
    }

    params.delete("page");

    router.push(
      `${pathname}?${params.toString()}`,
    );
  };

  return (
    <select
      value={value}
      onChange={(event) =>
        change(
          event.target.value,
        )
      }
      aria-label={
        placeholder
      }
      className={[
        "h-9 min-w-[140px] rounded-lg border border-slate-200 bg-white px-3",
        "text-sm text-slate-700",
        "outline-none transition",
        "hover:border-slate-300",
        "focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10",
        className,
      ].join(" ")}
    >
      <option value="">
        {placeholder}
      </option>

      {options.map(
        (option) => (
          <option
            key={
              option.value
            }
            value={
              option.value
            }
          >
            {option.label}
          </option>
        ),
      )}
    </select>
  );
}

// ============================================================================
// Search icon
// ============================================================================

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
      aria-hidden="true"
    >
      <circle
        cx="11"
        cy="11"
        r="6.5"
      />

      <path
        d="m16 16 4 4"
        strokeLinecap="round"
      />
    </svg>
  );
}