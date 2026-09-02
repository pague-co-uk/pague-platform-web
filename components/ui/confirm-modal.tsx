"use client";

import {
  ReactNode,
  useEffect,
} from "react";

// ============================================================================
// Types
// ============================================================================

export interface ConfirmModalProps {
  open: boolean;

  title: string;

  description?: ReactNode;

  confirmLabel?: string;

  confirmingLabel?: string;

  cancelLabel?: string;

  confirming?: boolean;

  destructive?: boolean;

  onConfirm: () => void;

  onCancel: () => void;
}

// ============================================================================
// Confirm modal
// ============================================================================

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  confirmingLabel = "Confirming…",
  cancelLabel = "Cancel",
  confirming = false,
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  // ==========================================================================
  // Escape key
  // ==========================================================================

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (
        event.key === "Escape" &&
        !confirming
      ) {
        onCancel();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    open,
    confirming,
    onCancel,
  ]);

  // ==========================================================================
  // Closed
  // ==========================================================================

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      {/* ====================================================================
          Backdrop
      ==================================================================== */}

      <button
        type="button"
        aria-label="Close dialog"
        disabled={confirming}
        onClick={onCancel}
        className="absolute inset-0 cursor-default bg-slate-950/40 backdrop-blur-[2px]"
      />

      {/* ====================================================================
          Dialog
      ==================================================================== */}

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        {/* ================================================================
            Content
        ================================================================ */}

        <div className="px-6 pb-5 pt-6">
          {/* ==============================================================
              Icon
          ============================================================== */}

          <div
            className={[
              "mb-4 flex h-11 w-11 items-center justify-center rounded-xl",
              destructive
                ? "bg-red-50 text-red-600"
                : "bg-blue-50 text-blue-600",
            ].join(" ")}
          >
            {destructive ? (
              <TrashIcon />
            ) : (
              <QuestionIcon />
            )}
          </div>

          {/* ==============================================================
              Title
          ============================================================== */}

          <h2
            id="confirm-modal-title"
            className="text-base font-semibold text-slate-900"
          >
            {title}
          </h2>

          {/* ==============================================================
              Description
          ============================================================== */}

          {description && (
            <div className="mt-2 text-sm leading-6 text-slate-500">
              {description}
            </div>
          )}
        </div>

        {/* ==================================================================
            Actions
        ================================================================== */}

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/50 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={confirming}
            onClick={onCancel}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            disabled={confirming}
            onClick={onConfirm}
            className={[
              "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium text-white transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60",
              destructive
                ? "bg-red-600 hover:bg-red-700 focus:ring-red-500/30"
                : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500/30",
            ].join(" ")}
          >
            {confirming && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            )}

            {confirming
              ? confirmingLabel
              : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Icons
// ============================================================================

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        d="M4 7h16"
        strokeLinecap="round"
      />

      <path
        d="M10 11v6M14 11v6"
        strokeLinecap="round"
      />

      <path
        d="M6 7l1 13h10l1-13"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M9 7V4h6v3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function QuestionIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="8.5"
      />

      <path
        d="M9.75 9.5a2.25 2.25 0 1 1 3.78 1.64c-.86.72-1.53 1.18-1.53 2.36"
        strokeLinecap="round"
      />

      <path
        d="M12 16.5h.01"
        strokeLinecap="round"
      />
    </svg>
  );
}