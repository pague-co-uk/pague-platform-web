"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  PageContainer,
} from "@/components/layout/page-container";

import {
  PageHeader,
} from "@/components/layout/page-header";

import {
  ErrorState,
} from "@/components/ui/error-state";

import {
  LoadingState,
} from "@/components/ui/loading-state";

import {
  DashboardContent,
} from "@/features/dashboard/components/dashboard-content";

import {
  DashboardApiError,
  getDashboard,
} from "@/features/dashboard/api/dashboard-api";

import type {
  DashboardData,
  DashboardPeriodValue,
} from "@/features/dashboard/types/dashboard";

// ============================================================================
// Dashboard page
// ============================================================================

export default function DashboardPage() {
  // ==========================================================================
  // State
  // ==========================================================================

  const [
    dashboard,
    setDashboard,
  ] = useState<
    DashboardData | null
  >(null);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const [
    period,
    setPeriod,
  ] = useState<DashboardPeriodValue>(
    "30d",
  );

  // ==========================================================================
  // Load dashboard
  // ==========================================================================

  const loadDashboard =
    useCallback(
      async () => {
        setIsLoading(true);
        setError(null);

        try {
          const result =
            await getDashboard({
              period,
            });

          setDashboard(
            result,
          );
        } catch (error) {
          console.error(
            "[Dashboard] Failed to load dashboard.",
            error,
          );

          setError(
            error instanceof
              DashboardApiError
              ? error.message
              : "Unable to load dashboard. Please try again.",
          );
        } finally {
          setIsLoading(false);
        }
      },
      [period],
    );

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Overview of your messaging and payment platform."
      />

      {/* ====================================================================
          Period selector
      ==================================================================== */}

      <div className="mt-4 flex items-center justify-between gap-4">
        <p className="text-xs text-slate-500">
          Showing activity for the selected period.
        </p>

        <div className="flex shrink-0 rounded-lg border border-slate-200 bg-white p-1">
          <PeriodButton
            active={
              period === "7d"
            }
            onClick={() =>
              setPeriod("7d")
            }
          >
            7 days
          </PeriodButton>

          <PeriodButton
            active={
              period === "30d"
            }
            onClick={() =>
              setPeriod("30d")
            }
          >
            30 days
          </PeriodButton>

          <PeriodButton
            active={
              period === "90d"
            }
            onClick={() =>
              setPeriod("90d")
            }
          >
            90 days
          </PeriodButton>
        </div>
      </div>

      {/* ====================================================================
          Content
      ==================================================================== */}

      <div className="mt-6">
        {isLoading ? (
          <LoadingState rows={8} />
        ) : error ? (
          <div className="rounded-xl border border-slate-200 bg-white">
            <ErrorState
              title="Unable to load dashboard"
              description={
                error
              }
            >
              <button
                type="button"
                onClick={() =>
                  void loadDashboard()
                }
                className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Try again
              </button>
            </ErrorState>
          </div>
        ) : dashboard ? (
          <DashboardContent
            dashboard={
              dashboard
            }
          />
        ) : null}
      </div>
    </PageContainer>
  );
}

// ============================================================================
// Period button
// ============================================================================

function PeriodButton({
  active,
  onClick,
  children,
}: {
  active: boolean;

  onClick: () => void;

  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition",
        active
          ? "bg-slate-900 text-white"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
      ].join(" ")}
    >
      {children}
    </button>
  );
}