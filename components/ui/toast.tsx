"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// ============================================================================
// Types
// ============================================================================

export type ToastTone =
  | "success"
  | "error"
  | "warning"
  | "info";

export interface ToastOptions {
  readonly title: string;

  readonly description?: string;

  readonly tone?: ToastTone;

  readonly duration?: number;
}

interface ToastItem
  extends Required<
    Pick<
      ToastOptions,
      "title" | "tone" | "duration"
    >
  > {
  readonly id: string;

  readonly description?: string;
}

interface ToastContextValue {
  readonly show: (
    options: ToastOptions,
  ) => void;

  readonly success: (
    title: string,
    description?: string,
  ) => void;

  readonly error: (
    title: string,
    description?: string,
  ) => void;

  readonly warning: (
    title: string,
    description?: string,
  ) => void;

  readonly info: (
    title: string,
    description?: string,
  ) => void;

  readonly dismiss: (
    id: string,
  ) => void;
}

// ============================================================================
// Context
// ============================================================================

const ToastContext =
  createContext<
    ToastContextValue | undefined
  >(undefined);

// ============================================================================
// Provider
// ============================================================================

interface ToastProviderProps {
  readonly children: ReactNode;
}

export function ToastProvider({
  children,
}: ToastProviderProps) {
  const [
    toasts,
    setToasts,
  ] = useState<
    readonly ToastItem[]
  >([]);

  const dismiss =
    useCallback(
      (id: string) => {
        setToasts(
          (current) =>
            current.filter(
              (toast) =>
                toast.id !== id,
            ),
        );
      },
      [],
    );

  const show =
    useCallback(
      (options: ToastOptions) => {
        const id =
          crypto.randomUUID();

        const toast: ToastItem = {
          id,
          title: options.title,
          description:
            options.description,
          tone:
            options.tone ??
            "info",
          duration:
            options.duration ??
            4000,
        };

        setToasts(
          (current) => [
            ...current,
            toast,
          ],
        );

        window.setTimeout(
          () => {
            dismiss(id);
          },
          toast.duration,
        );
      },
      [dismiss],
    );

  const success =
    useCallback(
      (
        title: string,
        description?: string,
      ) => {
        show({
          title,
          description,
          tone: "success",
        });
      },
      [show],
    );

  const error =
    useCallback(
      (
        title: string,
        description?: string,
      ) => {
        show({
          title,
          description,
          tone: "error",
          duration: 6000,
        });
      },
      [show],
    );

  const warning =
    useCallback(
      (
        title: string,
        description?: string,
      ) => {
        show({
          title,
          description,
          tone: "warning",
        });
      },
      [show],
    );

  const info =
    useCallback(
      (
        title: string,
        description?: string,
      ) => {
        show({
          title,
          description,
          tone: "info",
        });
      },
      [show],
    );

  const value =
    useMemo<ToastContextValue>(
      () => ({
        show,
        success,
        error,
        warning,
        info,
        dismiss,
      }),
      [
        show,
        success,
        error,
        warning,
        info,
        dismiss,
      ],
    );

  return (
    <ToastContext.Provider
      value={value}
    >
      {children}

      <ToastViewport
        toasts={toasts}
        onDismiss={dismiss}
      />
    </ToastContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useToast(): ToastContextValue {
  const context =
    useContext(
      ToastContext,
    );

  if (!context) {
    throw new Error(
      "useToast must be used within a ToastProvider.",
    );
  }

  return context;
}

// ============================================================================
// Viewport
// ============================================================================

interface ToastViewportProps {
  readonly toasts: readonly ToastItem[];

  readonly onDismiss: (
    id: string,
  ) => void;
}

function ToastViewport({
  toasts,
  onDismiss,
}: ToastViewportProps) {
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className={[
        // Mobile: full-width with side margins.
        // Desktop: fixed width in the top-right.
        "pointer-events-none fixed left-4 right-4 top-4 z-[100]",
        "flex flex-col items-end gap-2",
        "sm:left-auto sm:w-full sm:max-w-sm",
      ].join(" ")}
    >
      {toasts.map(
        (toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onDismiss={
              onDismiss
            }
          />
        ),
      )}
    </div>
  );
}

// ============================================================================
// Toast
// ============================================================================

interface ToastProps {
  readonly toast: ToastItem;

  readonly onDismiss: (
    id: string,
  ) => void;
}

function Toast({
  toast,
  onDismiss,
}: ToastProps) {
  return (
    <div
      role={
        toast.tone ===
          "error"
          ? "alert"
          : "status"
      }
      className={[
        "pointer-events-auto w-full",
        "rounded-xl border bg-white",
        "px-4 py-3 shadow-lg shadow-slate-900/10",

        // Toast enters from the top because
        // the viewport is now at the top.
        "animate-in fade-in slide-in-from-top-2",
        "duration-200",

        borderClasses[
        toast.tone
        ],
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <ToastIcon
          tone={toast.tone}
        />

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">
            {toast.title}
          </p>

          {toast.description && (
            <p className="mt-0.5 text-xs leading-5 text-slate-500">
              {
                toast.description
              }
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() =>
            onDismiss(
              toast.id,
            )
          }
          aria-label="Dismiss notification"
          className="shrink-0 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Classes
// ============================================================================

const borderClasses: Record<
  ToastTone,
  string
> = {
  success:
    "border-emerald-200",

  error:
    "border-red-200",

  warning:
    "border-amber-200",

  info:
    "border-blue-200",
};

// ============================================================================
// Icons
// ============================================================================

function ToastIcon({
  tone,
}: {
  readonly tone: ToastTone;
}) {
  const classes: Record<
    ToastTone,
    string
  > = {
    success:
      "bg-emerald-50 text-emerald-600",

    error:
      "bg-red-50 text-red-600",

    warning:
      "bg-amber-50 text-amber-600",

    info:
      "bg-blue-50 text-blue-600",
  };

  return (
    <span
      className={[
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
        classes[tone],
      ].join(" ")}
    >
      {tone ===
        "success" && (
          <CheckIcon />
        )}

      {tone ===
        "error" && (
          <ErrorIcon />
        )}

      {tone ===
        "warning" && (
          <WarningIcon />
        )}

      {tone ===
        "info" && (
          <InfoIcon />
        )}
    </span>
  );
}

// ============================================================================
// Check icon
// ============================================================================

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="m5 12 4 4L19 6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ============================================================================
// Error icon
// ============================================================================

function ErrorIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="M12 8v4"
        strokeLinecap="round"
      />

      <path
        d="M12 16h.01"
        strokeLinecap="round"
      />

      <path
        d="M10.3 3.7 2.7 17a2 2 0 0 0 1.74 3h15.12a2 2 0 0 0 1.74-3L13.7 3.7a2 2 0 0 0-3.4 0Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ============================================================================
// Warning icon
// ============================================================================

function WarningIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="M12 9v4"
        strokeLinecap="round"
      />

      <path
        d="M12 17h.01"
        strokeLinecap="round"
      />

      <path
        d="m10.3 3.7-7.6 13.3a2 2 0 0 0 1.74 3h15.12a2 2 0 0 0 1.74-3L13.7 3.7a2 2 0 0 0-3.4 0Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ============================================================================
// Info icon
// ============================================================================

function InfoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
      />

      <path
        d="M12 11v5"
        strokeLinecap="round"
      />

      <path
        d="M12 8h.01"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ============================================================================
// Close icon
// ============================================================================

function CloseIcon() {
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
        d="m7 7 10 10M17 7 7 17"
        strokeLinecap="round"
      />
    </svg>
  );
}