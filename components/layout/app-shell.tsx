"use client";

import type {
  ReactNode,
} from "react";

import {
  usePathname,
} from "next/navigation";

import {
  useState,
} from "react";

import {
  AppHeader,
} from "./app-header";

import {
  AppSidebar,
} from "./app-sidebar";

import type {
  NavigationSection,
} from "@/lib/navigation/get-navigation";

// ============================================================================
// Types
// ============================================================================

interface AppShellUser {
  name: string;

  email: string;

  initials: string;
}

interface AppShellProps {
  children: ReactNode;

  user: AppShellUser;

  navigation:
  readonly NavigationSection[];
}

// ============================================================================
// App shell
// ============================================================================

export function AppShell({
  children,
  user,
  navigation,
}: AppShellProps) {
  const pathname =
    usePathname();

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false);

  const title =
    getPageTitle(
      pathname,
    );

  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-900">

      {/* ==================================================================
          Sidebar
      ================================================================== */}

      <AppSidebar
        navigation={
          navigation
        }
        open={
          sidebarOpen
        }
        onClose={() =>
          setSidebarOpen(false)
        }
      />

      {/* ==================================================================
          Main application
      ================================================================== */}

      <div className="min-h-[100dvh] lg:pl-[252px]">

        {/* ================================================================
            Header
        ================================================================ */}

        <AppHeader
          user={
            user
          }
          title={
            title
          }
          onMenuClick={() =>
            setSidebarOpen(true)
          }
        />

        {/* ================================================================
            Page content
        ================================================================ */}

        <main className="min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

// ============================================================================
// Page title
// ============================================================================

function getPageTitle(
  pathname: string,
): string {
  if (
    pathname === "/"
  ) {
    return "Dashboard";
  }

  const segments =
    pathname
      .split("/")
      .filter(Boolean);

  if (
    segments.length === 0
  ) {
    return "Dashboard";
  }

  const last =
    segments[
    segments.length - 1
    ];

  return last
    .split("-")
    .map(
      (part) =>
        part
          .charAt(0)
          .toUpperCase() +
        part.slice(1),
    )
    .join(" ");
}