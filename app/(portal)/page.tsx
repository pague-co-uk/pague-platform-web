
"use client";

import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";

import {
  DashboardApiError,
  getDashboard,
} from "@/features/dashboard/api/dashboard-api";

import {
  getPaymentDashboard,
} from "@/features/dashboard/api/payment-dashboard-api";

import { DashboardContent } from "@/features/dashboard/components/dashboard-content";
import { PaymentDashboardContent } from "@/features/dashboard/components/payment-dashboard-content";

import type {
  DashboardData,
  DashboardPeriodValue,
} from "@/features/dashboard/types/dashboard";

import type {
  PaymentDashboardData,
} from "@/features/dashboard/types/payment-dashboard";

type DashboardTab = "messages" | "payments";

const DASHBOARD_PERIODS: {
  readonly value: DashboardPeriodValue;
  readonly label: string;
}[] = [
    { value: "1d", label: "1 day" },
    { value: "7d", label: "7 days" },
    { value: "30d", label: "30 days" },
    { value: "90d", label: "90 days" },
  ];

export default function DashboardPage() {
  const [activeTab, setActiveTab] =
    useState<DashboardTab>("messages");

  // Messaging dashboard state
  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [isLoadingMessages, setIsLoadingMessages] =
    useState(true);

  const [messagesError, setMessagesError] =
    useState<string | null>(null);

  // Payment dashboard state
  const [paymentDashboard, setPaymentDashboard] =
    useState<PaymentDashboardData | null>(null);

  const [isLoadingPayments, setIsLoadingPayments] =
    useState(false);

  const [paymentsError, setPaymentsError] =
    useState<string | null>(null);

  // Shared period
  const [period, setPeriod] =
    useState<DashboardPeriodValue>("30d");

  // Load messaging dashboard
  const loadDashboard = useCallback(async () => {
    setIsLoadingMessages(true);
    setMessagesError(null);

    try {
      const result = await getDashboard({ period });
      setDashboard(result);
    } catch (error) {
      console.error(
        "[Dashboard] Failed to load messaging dashboard.",
        error,
      );

      setMessagesError(
        error instanceof DashboardApiError
          ? error.message
          : "Unable to load messaging dashboard. Please try again.",
      );
    } finally {
      setIsLoadingMessages(false);
    }
  }, [period]);

  // Load payment dashboard
  const loadPaymentDashboard = useCallback(async () => {
    setIsLoadingPayments(true);
    setPaymentsError(null);

    try {
      const result = await getPaymentDashboard({ period });
      setPaymentDashboard(result);
    } catch (error) {
      console.error(
        "[Dashboard] Failed to load payment dashboard.",
        error,
      );

      setPaymentsError(
        error instanceof DashboardApiError
          ? error.message
          : "Unable to load payment dashboard. Please try again.",
      );
    } finally {
      setIsLoadingPayments(false);
    }
  }, [period]);

  // Load the active dashboard
  useEffect(() => {
    if (activeTab === "messages") {
      void loadDashboard();
      return;
    }

    void loadPaymentDashboard();
  }, [
    activeTab,
    loadDashboard,
    loadPaymentDashboard,
  ]);

  // Tab change
  function handleTabChange(tab: DashboardTab) {
    setActiveTab(tab);

    if (tab === "messages") {
      setMessagesError(null);
      return;
    }

    setPaymentsError(null);
  }

  // Period change
  function handlePeriodChange(value: DashboardPeriodValue) {
    setPeriod(value);

    if (activeTab === "messages") {
      setMessagesError(null);
    } else {
      setPaymentsError(null);
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Overview of your messaging and payment platform."
      />

      {/* Dashboard tabs */}
      <div className="mt-6 border-y border-slate-200 bg-white">
        <div className="flex">
          <DashboardTabButton
            active={activeTab === "messages"}
            onClick={() => handleTabChange("messages")}
            variant="messages"
          >
            Messages
          </DashboardTabButton>

          <DashboardTabButton
            active={activeTab === "payments"}
            onClick={() => handleTabChange("payments")}
            variant="payments"
          >
            Payments
          </DashboardTabButton>
        </div>
      </div>

      {/* Messages dashboard */}
      {activeTab === "messages" && (
        <>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              Showing messaging activity for the selected period.
            </p>

            <div className="flex flex-wrap rounded-lg border border-slate-200 bg-white p-1">
              {DASHBOARD_PERIODS.map(({ value, label }) => (
                <PeriodButton
                  key={value}
                  active={period === value}
                  onClick={() => handlePeriodChange(value)}
                >
                  {label}
                </PeriodButton>
              ))}
            </div>
          </div>

          <div className="mt-6">
            {isLoadingMessages ? (
              <LoadingState rows={8} />
            ) : messagesError ? (
              <div className="rounded-xl border border-slate-200 bg-white">
                <ErrorState
                  title="Unable to load messaging dashboard"
                  description={messagesError}
                >
                  <button
                    type="button"
                    onClick={() => void loadDashboard()}
                    className="cursor-pointer rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    Try again
                  </button>
                </ErrorState>
              </div>
            ) : dashboard ? (
              <DashboardContent dashboard={dashboard} />
            ) : null}
          </div>
        </>
      )}

      {/* Payments dashboard */}
      {activeTab === "payments" && (
        <>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              Showing payment activity for the selected period.
            </p>

            <div className="flex flex-wrap rounded-lg border border-slate-200 bg-white p-1">
              {DASHBOARD_PERIODS.map(({ value, label }) => (
                <PeriodButton
                  key={value}
                  active={period === value}
                  onClick={() => handlePeriodChange(value)}
                >
                  {label}
                </PeriodButton>
              ))}
            </div>
          </div>

          <div className="mt-6">
            {isLoadingPayments ? (
              <LoadingState rows={8} />
            ) : paymentsError ? (
              <div className="rounded-xl border border-slate-200 bg-white">
                <ErrorState
                  title="Unable to load payment dashboard"
                  description={paymentsError}
                >
                  <button
                    type="button"
                    onClick={() => void loadPaymentDashboard()}
                    className="cursor-pointer rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    Try again
                  </button>
                </ErrorState>
              </div>
            ) : paymentDashboard ? (
              <PaymentDashboardContent dashboard={paymentDashboard} />
            ) : null}
          </div>
        </>
      )}
    </PageContainer>
  );
}

// Dashboard tab button
function DashboardTabButton({
  active,
  onClick,
  children,
  variant,
}: {
  readonly active: boolean;
  readonly onClick: () => void;
  readonly children: ReactNode;
  readonly variant: "messages" | "payments";
}) {
  const activeTextClass =
    variant === "messages"
      ? "text-sky-600"
      : "text-emerald-600";

  const indicatorClass =
    variant === "messages"
      ? "bg-sky-500"
      : "bg-emerald-500";

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative cursor-pointer px-6 py-3 text-sm font-medium transition-colors",
        active
          ? activeTextClass
          : "text-slate-500 hover:text-slate-800",
      ].join(" ")}
    >
      {children}

      {active && (
        <span
          className={[
            "absolute inset-x-4 bottom-0 h-0.5 rounded-full",
            indicatorClass,
          ].join(" ")}
        />
      )}
    </button>
  );
}

// Period button
function PeriodButton({
  active,
  onClick,
  children,
}: {
  readonly active: boolean;
  readonly onClick: () => void;
  readonly children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
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
