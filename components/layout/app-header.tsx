"use client";

import Image from "next/image";

import Link from "next/link";

import {
  useEffect,
  useRef,
  useState,
} from "react";

// ============================================================================
// Types
// ============================================================================

interface AppHeaderUser {
  name: string;
  email: string;
  initials: string;
}

interface AppHeaderProps {
  user: AppHeaderUser;
  title: string;
  notificationCount?: number;
  onMenuClick?: () => void;
}

// ============================================================================
// App header
// ============================================================================

export function AppHeader({
  user,
  title,
  notificationCount = 0,
  onMenuClick,
}: AppHeaderProps) {
  const [
    accountMenuOpen,
    setAccountMenuOpen,
  ] = useState(false);

  const [
    isLoggingOut,
    setIsLoggingOut,
  ] = useState(false);

  const accountMenuRef =
    useRef<HTMLDivElement>(null);

  // ==========================================================================
  // Close account menu when clicking outside
  // ==========================================================================

  useEffect(() => {
    function handlePointerDown(
      event: PointerEvent,
    ) {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(
          event.target as Node,
        )
      ) {
        setAccountMenuOpen(false);
      }
    }

    if (accountMenuOpen) {
      document.addEventListener(
        "pointerdown",
        handlePointerDown,
      );
    }

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown,
      );
    };
  }, [
    accountMenuOpen,
  ]);

  // ==========================================================================
  // Close account menu with Escape
  // ==========================================================================

  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key === "Escape"
      ) {
        setAccountMenuOpen(false);
      }
    }

    if (accountMenuOpen) {
      document.addEventListener(
        "keydown",
        handleKeyDown,
      );
    }

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    accountMenuOpen,
  ]);

  // ==========================================================================
  // Logout
  // ==========================================================================

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    setAccountMenuOpen(false);

    try {
      const response =
        await fetch(
          "/api/auth/logout",
          {
            method: "POST",
            credentials: "include",
            cache: "no-store",
          },
        );

      if (!response.ok) {
        console.error(
          "[Auth] Logout failed.",
          {
            status:
              response.status,
          },
        );

        setIsLoggingOut(false);

        return;
      }

      window.location.href =
        "/login";
    } catch (error) {
      console.error(
        "[Auth] Logout request failed.",
        error,
      );

      setIsLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md sm:px-6 lg:px-7">

      {/* ====================================================================
          Left side
      ==================================================================== */}

      <div className="flex min-w-0 flex-1 items-center gap-3">

        {/* ==================================================================
            Mobile navigation
        ================================================================== */}

        <button
          type="button"
          onClick={
            onMenuClick
          }
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 lg:hidden"
          aria-label="Open navigation"
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
              d="M4 6h16M4 12h16M4 18h16"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* ==================================================================
            Pague logo

            Visible on:
            - small screens
            - medium screens
            - large screens
        ================================================================== */}

        <Link
          href="/"
          aria-label="Pague dashboard"
          className="group flex shrink-0 cursor-pointer items-center rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        >
          <Image
            src="/logo.png"
            alt="Pague"
            width={120}
            height={42}
            priority
            className="h-7 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02] sm:h-8"
          />
        </Link>

        {/* ==================================================================
            Divider
        ================================================================== */}

        <div
          className="hidden h-6 w-px bg-slate-200 md:block"
          aria-hidden="true"
        />

        {/* ==================================================================
            Page context
        ================================================================== */}

        <div className="hidden min-w-0 md:block">
          <h1
            className="truncate text-[15px] font-medium text-slate-900"
            style={{
              fontFamily:
                "var(--font-display)",
            }}
          >
            {title}
          </h1>
        </div>
      </div>

      {/* ====================================================================
          Header actions
      ==================================================================== */}

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">

        {/* ==================================================================
            Notifications
        ================================================================== */}

        <button
          type="button"
          className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          aria-label={
            notificationCount > 0
              ? `${notificationCount} unread notifications`
              : "Notifications"
          }
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            className="h-[19px] w-[19px]"
            aria-hidden="true"
          >
            <path
              d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
              strokeLinecap="round"
            />

            <path
              d="M10 21h4"
              strokeLinecap="round"
            />
          </svg>

          {notificationCount >
            0 && (
              <span
                className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-semibold leading-none text-white ring-2 ring-white"
                aria-hidden="true"
              >
                {notificationCount >
                  99
                  ? "99+"
                  : notificationCount}
              </span>
            )}
        </button>

        {/* ==================================================================
            Divider
        ================================================================== */}

        <div
          className="mx-1 hidden h-6 w-px bg-slate-200 sm:block"
          aria-hidden="true"
        />

        {/* ==================================================================
            Account menu
        ================================================================== */}

        <div
          ref={
            accountMenuRef
          }
          className="relative"
        >

          {/* ================================================================
              Account trigger
          ================================================================ */}

          <button
            type="button"
            onClick={() =>
              setAccountMenuOpen(
                (current) =>
                  !current,
              )
            }
            aria-expanded={
              accountMenuOpen
            }
            aria-haspopup="menu"
            className="group flex cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1.5 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 sm:gap-3 sm:px-2"
            aria-label="Open account menu"
          >

            {/* Avatar */}

            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-100">
              {user.initials}
            </span>

            {/* User information */}

            <span className="hidden min-w-0 text-left sm:block">
              <span className="block max-w-[160px] truncate text-xs font-medium text-slate-800">
                {user.name}
              </span>

              <span className="block max-w-[160px] truncate text-[10px] text-slate-400">
                {user.email}
              </span>
            </span>

            {/* Chevron */}

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              className={[
                "hidden h-4 w-4 text-slate-400 transition-transform duration-150 sm:block",
                accountMenuOpen
                  ? "rotate-180"
                  : "",
              ].join(" ")}
              aria-hidden="true"
            >
              <path
                d="m6 9 6 6 6-6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* ================================================================
              Dropdown
          ================================================================ */}

          {accountMenuOpen && (
            <div
              role="menu"
              aria-label="Account menu"
              className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-900/10"
            >

              {/* ============================================================
                  Account summary
              ============================================================ */}

              {/* ============================================================
                  Account actions
              ============================================================ */}

              <div className="pt-1">

                {/* ==========================================================
                    Settings
                =========================================================== */}

                <Link
                  href="/system-health"
                  role="menuitem"
                  onClick={() =>
                    setAccountMenuOpen(
                      false,
                    )
                  }
                  className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    className="h-4 w-4 shrink-0 text-slate-400"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
                    />

                    <path
                      d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.7 1.7-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56v.08h-2.4v-.08a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.7-1.7.06-.06A1.7 1.7 0 0 0 8.46 15a1.7 1.7 0 0 0-1.56-1.03h-.08v-2.4h.08A1.7 1.7 0 0 0 8.46 10a1.7 1.7 0 0 0-.34-1.88l-.06-.06 1.7-1.7.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 12.73 5.2v-.08h2.4v.08a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.7 1.7-.06.06A1.7 1.7 0 0 0 19.4 10c.25.62.85 1.03 1.52 1.03H21v2.4h-.08A1.7 1.7 0 0 0 19.4 15Z"
                    />
                  </svg>

                  <span>
                    System Health
                  </span>
                </Link>

                {/* ==========================================================
                    Change password
                =========================================================== */}

                <Link
                  href="/settings/security/change-password"
                  role="menuitem"
                  onClick={() =>
                    setAccountMenuOpen(
                      false,
                    )
                  }
                  className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    className="h-4 w-4 shrink-0 text-slate-400"
                    aria-hidden="true"
                  >
                    <rect
                      x="4"
                      y="10"
                      width="16"
                      height="10"
                      rx="2"
                    />

                    <path
                      d="M8 10V7a4 4 0 0 1 8 0v3"
                      strokeLinecap="round"
                    />

                    <path
                      d="M12 14v2"
                      strokeLinecap="round"
                    />
                  </svg>

                  <span>
                    Change password
                  </span>
                </Link>

                {/* ==========================================================
                    Divider
                =========================================================== */}

                <div
                  className="my-1.5 h-px bg-slate-100"
                  aria-hidden="true"
                />

                {/* ==========================================================
                    Logout
                =========================================================== */}

                <button
                  type="button"
                  role="menuitem"
                  onClick={
                    handleLogout
                  }
                  disabled={
                    isLoggingOut
                  }
                  className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 transition hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    className="h-4 w-4 shrink-0"
                    aria-hidden="true"
                  >
                    <path
                      d="M9 5H6.5A1.5 1.5 0 0 0 5 6.5v11A1.5 1.5 0 0 0 6.5 19H9"
                      strokeLinecap="round"
                    />

                    <path
                      d="M14 8l4 4-4 4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    <path
                      d="M18 12H9"
                      strokeLinecap="round"
                    />
                  </svg>

                  <span>
                    {isLoggingOut
                      ? "Logging out…"
                      : "Log out"}
                  </span>
                </button>

              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}