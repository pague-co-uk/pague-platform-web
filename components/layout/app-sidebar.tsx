"use client";

import type {
  NavigationItem,
  NavigationSection,
} from "@/lib/navigation/get-navigation";

import Link from "next/link";

import {
  usePathname,
} from "next/navigation";

import {
  useEffect,
  useState,
} from "react";

import {
  NavigationIcon,
} from "./navigation-icon";

// ============================================================================
// Props
// ============================================================================

interface AppSidebarProps {
  navigation:
  readonly NavigationSection[];

  open: boolean;

  onClose: () => void;
}

// ============================================================================
// Sidebar
// ============================================================================

export function AppSidebar({
  navigation,
  open = true,
  onClose,
}: AppSidebarProps) {
  const pathname =
    usePathname();

  const isActive = (
    href: string,
  ): boolean => {
    if (
      href === "/"
    ) {
      return pathname === "/";
    }

    return (
      pathname === href ||
      pathname.startsWith(
        `${href}/`,
      )
    );
  };

  return (
    <>
      {/* ====================================================================
          Mobile backdrop
      ==================================================================== */}

      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 cursor-pointer bg-slate-950/40 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* ====================================================================
          Sidebar
      ==================================================================== */}

      <aside
        aria-label="Main navigation"
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[252px] flex-col",
          "border-r border-slate-200/80 bg-white",
          "shadow-[4px_0_24px_rgba(15,23,42,0.03)]",
          "transition-transform duration-200 ease-out",
          "lg:translate-x-0 lg:shadow-none",
          open
            ? "translate-x-0"
            : "-translate-x-full",
        ].join(" ")}
      >

        {/* ==================================================================
            Mobile header
        ================================================================== */}

        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 px-5 lg:hidden">

          <span
            className="text-lg font-semibold tracking-tight text-slate-900"
            style={{
              fontFamily:
                "var(--font-display)",
            }}
          >
            Pague
          </span>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            aria-label="Close navigation"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                d="M6 6l12 12M18 6 6 18"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* ==================================================================
            Navigation
        ================================================================== */}

        <nav
          className="flex-1 overflow-y-auto px-3 py-4"
          aria-label="Primary"
        >
          <div className="space-y-1">

            {navigation.map(
              (
                section,
                sectionIndex,
              ) => (
                <div
                  key={
                    section.key ??
                    sectionIndex
                  }
                >

                  {section.label && (
                    <p
                      className="mb-2 px-3 pt-2 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400"
                      style={{
                        fontFamily:
                          "var(--font-mono)",
                      }}
                    >
                      {section.label}
                    </p>
                  )}

                  <div className="space-y-0.5">
                    {section.items.map(
                      (item) => (
                        <NavigationEntry
                          key={
                            item.key
                          }
                          item={
                            item
                          }
                          pathname={
                            pathname
                          }
                          isActive={
                            isActive
                          }
                          onClose={
                            onClose
                          }
                        />
                      ),
                    )}
                  </div>
                </div>
              ),
            )}

          </div>
        </nav>

        {/* ==================================================================
            Sidebar footer
        ================================================================== */}

        <div className="shrink-0 border-t border-slate-200/80 p-3">

          <Link
            href="/system-health"
            onClick={
              onClose
            }
            className="group flex min-h-10 cursor-pointer items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <NavigationIcon
              name="settings"
              className="h-[18px] w-[18px] shrink-0 text-slate-400 group-hover:text-slate-600"
            />

            <span className="truncate">
              System Health
            </span>
          </Link>

        </div>
      </aside>
    </>
  );
}

// ============================================================================
// Navigation entry
// ============================================================================

interface NavigationEntryProps {
  item: NavigationItem;

  pathname: string;

  isActive: (
    href: string,
  ) => boolean;

  onClose: () => void;
}

function NavigationEntry({
  item,
  pathname,
  isActive,
  onClose,
}: NavigationEntryProps) {
  // ==========================================================================
  // Parent group
  // ==========================================================================

  if (
    item.children &&
    item.children.length > 0
  ) {
    return (
      <NavigationGroup
        item={
          item
        }
        pathname={
          pathname
        }
        isActive={
          isActive
        }
        onClose={
          onClose
        }
      />
    );
  }

  // ==========================================================================
  // Item without destination
  // ==========================================================================

  if (!item.href) {
    return (
      <div className="flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-500">
        <NavigationIcon
          name={
            item.icon
          }
          className="h-[18px] w-[18px] shrink-0 text-slate-400"
        />

        <span className="truncate">
          {item.label}
        </span>
      </div>
    );
  }

  // ==========================================================================
  // Regular navigation link
  // ==========================================================================

  const active =
    isActive(
      item.href,
    );

  return (
    <Link
      href={
        item.href
      }
      onClick={
        onClose
      }
      aria-current={
        active
          ? "page"
          : undefined
      }
      className={[
        "group flex min-h-10 cursor-pointer items-center gap-3 rounded-lg px-3",
        "text-sm font-medium",
        "transition-colors duration-150",
        "focus:outline-none focus:ring-2 focus:ring-blue-500/30",
        active
          ? "bg-blue-50 text-blue-700"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
      ].join(" ")}
    >
      <NavigationIcon
        name={
          item.icon
        }
        className={[
          "h-[18px] w-[18px] shrink-0",
          active
            ? "text-blue-600"
            : "text-slate-400 group-hover:text-slate-600",
        ].join(" ")}
      />

      <span className="min-w-0 flex-1 truncate">
        {item.label}
      </span>

      {item.badge !==
        undefined && (
          <span
            className={[
              "flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5",
              "text-[10px] font-semibold leading-none",
              active
                ? "bg-blue-100 text-blue-700"
                : "bg-slate-100 text-slate-500",
            ].join(" ")}
          >
            {item.badge}
          </span>
        )}
    </Link>
  );
}

// ============================================================================
// Navigation group
// ============================================================================

interface NavigationGroupProps {
  item: NavigationItem;

  pathname: string;

  isActive: (
    href: string,
  ) => boolean;

  onClose: () => void;
}

function NavigationGroup({
  item,
  pathname,
  isActive,
  onClose,
}: NavigationGroupProps) {
  const childIsActive =
    item.children?.some(
      (child) =>
        hasActiveDescendant(
          child,
          isActive,
        ),
    ) ?? false;

  // ==========================================================================
  // Automatically open a group containing the current page.
  //
  // Otherwise groups start collapsed.
  // ==========================================================================

  const [
    expanded,
    setExpanded,
  ] = useState(
    childIsActive,
  );

  // ==========================================================================
  // If navigation changes and the current route belongs to this group,
  // make sure the group is visible.
  // ==========================================================================

  useEffect(() => {
    if (childIsActive) {
      setExpanded(true);
    }
  }, [
    childIsActive,
  ]);

  return (
    <div>

      {/* ====================================================================
          Group trigger
      ==================================================================== */}

      <button
        type="button"
        onClick={() =>
          setExpanded(
            (current) =>
              !current,
          )
        }
        aria-expanded={
          expanded
        }
        className={[
          "group flex min-h-10 w-full cursor-pointer items-center gap-3 rounded-lg px-3",
          "text-left text-sm font-medium",
          "transition-colors duration-150",
          "focus:outline-none focus:ring-2 focus:ring-blue-500/30",
          childIsActive
            ? "text-slate-900"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
        ].join(" ")}
      >

        <NavigationIcon
          name={
            item.icon
          }
          className={[
            "h-[18px] w-[18px] shrink-0",
            childIsActive
              ? "text-blue-600"
              : "text-slate-400 group-hover:text-slate-600",
          ].join(" ")}
        />

        <span className="min-w-0 flex-1 truncate">
          {item.label}
        </span>

        {/* Chevron */}

        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          className={[
            "h-4 w-4 shrink-0 text-slate-400 transition-transform duration-150",
            "group-hover:text-slate-600",
            expanded
              ? "rotate-90"
              : "",
          ].join(" ")}
          aria-hidden="true"
        >
          <path
            d="m9 18 6-6-6-6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* ====================================================================
          Children
      ==================================================================== */}

      {expanded && (
        <div
          className={[
            "ml-4 mt-0.5 space-y-0.5 border-l border-slate-200 pl-3",
          ].join(" ")}
        >
          {item.children?.map(
            (child) => (
              <NavigationEntry
                key={
                  child.key
                }
                item={
                  child
                }
                pathname={
                  pathname
                }
                isActive={
                  isActive
                }
                onClose={
                  onClose
                }
              />
            ),
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Active descendant
// ============================================================================

function hasActiveDescendant(
  item: NavigationItem,
  isActive: (
    href: string,
  ) => boolean,
): boolean {
  if (
    item.href &&
    isActive(
      item.href,
    )
  ) {
    return true;
  }

  if (
    item.children &&
    item.children.length > 0
  ) {
    return item.children.some(
      (child) =>
        hasActiveDescendant(
          child,
          isActive,
        ),
    );
  }

  return false;
}