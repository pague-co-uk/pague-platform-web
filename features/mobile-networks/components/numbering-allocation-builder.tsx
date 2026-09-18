"use client";

import {
  useState,
} from "react";

import {
  buildRoutingRegex,
  validatePrefix,
  validateRange,
} from "@/features/mobile-networks/lib/numbering-allocations";

import type {
  NumberingAllocation,
} from "@/features/mobile-networks/lib/numbering-allocations";

// ============================================================================
// Types
// ============================================================================

interface NumberingAllocationBuilderProps {
  readonly callingCodes:
  readonly string[];

  readonly value:
  readonly NumberingAllocation[];

  readonly onChange: (
    allocations:
      NumberingAllocation[],
  ) => void;

  readonly disabled?: boolean;
}

// ============================================================================
// Numbering allocation builder
// ============================================================================

export function NumberingAllocationBuilder({
  callingCodes,
  value,
  onChange,
  disabled = false,
}: NumberingAllocationBuilderProps) {

  // ==========================================================================
  // State
  // ==========================================================================

  const [
    allocationType,
    setAllocationType,
  ] = useState<
    "PREFIX" | "RANGE"
  >("PREFIX");

  const [
    prefix,
    setPrefix,
  ] = useState("");

  const [
    rangeFrom,
    setRangeFrom,
  ] = useState("");

  const [
    rangeTo,
    setRangeTo,
  ] = useState("");

  const [
    formError,
    setFormError,
  ] = useState<
    string | null
  >(null);

  // ==========================================================================
  // Add prefix
  // ==========================================================================

  function addPrefix() {
    const normalized =
      prefix.trim();

    const validationError =
      validatePrefix(
        normalized,
      );

    if (validationError) {
      setFormError(
        validationError,
      );

      return;
    }

    const alreadyExists =
      value.some(
        (allocation) =>
          allocation.type ===
          "PREFIX" &&
          allocation.value ===
          normalized,
      );

    if (alreadyExists) {
      setFormError(
        "This numbering prefix has already been added.",
      );

      return;
    }

    onChange([
      ...value,
      {
        id:
          crypto.randomUUID(),

        type:
          "PREFIX",

        value:
          normalized,
      },
    ]);

    setPrefix("");
    setFormError(null);
  }

  // ==========================================================================
  // Add range
  // ==========================================================================

  function addRange() {
    const from =
      rangeFrom.trim();

    const to =
      rangeTo.trim();

    const validationError =
      validateRange(
        from,
        to,
      );

    if (validationError) {
      setFormError(
        validationError,
      );

      return;
    }

    const alreadyExists =
      value.some(
        (allocation) =>
          allocation.type ===
          "RANGE" &&
          allocation.from ===
          from &&
          allocation.to ===
          to,
      );

    if (alreadyExists) {
      setFormError(
        "This numbering range has already been added.",
      );

      return;
    }

    onChange([
      ...value,
      {
        id:
          crypto.randomUUID(),

        type:
          "RANGE",

        from,
        to,
      },
    ]);

    setRangeFrom("");
    setRangeTo("");
    setFormError(null);
  }

  // ==========================================================================
  // Remove allocation
  // ==========================================================================

  function removeAllocation(
    id: string,
  ) {
    onChange(
      value.filter(
        (allocation) =>
          allocation.id !== id,
      ),
    );

    setFormError(null);
  }

  // ==========================================================================
  // Add allocation
  // ==========================================================================

  function handleAdd() {
    if (
      allocationType ===
      "PREFIX"
    ) {
      addPrefix();

      return;
    }

    addRange();
  }

  // ==========================================================================
  // Generated routing regex
  // ==========================================================================

  let generatedRegex =
    "";

  if (
    value.length > 0 &&
    callingCodes.length > 0
  ) {
    try {
      generatedRegex =
        buildRoutingRegex(
          value,
          callingCodes,
        );
    } catch {
      generatedRegex =
        "";
    }
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <div className="space-y-4">

      {/* ====================================================================
          Heading
      ===================================================================== */}

      <div>

        <h3 className="text-sm font-medium text-slate-900">
          Numbering allocations
        </h3>

        <p className="mt-1 text-xs text-slate-500">
          Define the numbering prefixes allocated
          to this network. Add individual prefixes
          or ranges of prefixes.
        </p>

      </div>

      {/* ====================================================================
          Existing allocations
      ===================================================================== */}

      {value.length > 0 && (
        <div className="space-y-2">

          {value.map(
            (allocation) => (
              <div
                key={
                  allocation.id
                }
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
              >

                <div>

                  <div className="text-xs text-slate-500">
                    {allocation.type ===
                      "PREFIX"
                      ? "Prefix"
                      : "Range"}
                  </div>

                  <div className="font-mono text-sm text-slate-900">
                    {allocation.type ===
                      "PREFIX"
                      ? allocation.value
                      : `${allocation.from} – ${allocation.to}`}
                  </div>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    removeAllocation(
                      allocation.id,
                    )
                  }
                  disabled={
                    disabled
                  }
                  className="text-xs font-medium text-slate-500 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Remove
                </button>

              </div>
            ),
          )}

        </div>
      )}

      {/* ====================================================================
          Add allocation
      ===================================================================== */}

      <div className="rounded-lg border border-slate-200 p-4">

        {/* ------------------------------------------------------------------
            Allocation type
        ------------------------------------------------------------------- */}

        <div className="mb-4 flex gap-2">

          <button
            type="button"
            onClick={() => {
              setAllocationType(
                "PREFIX",
              );

              setFormError(
                null,
              );
            }}
            disabled={
              disabled
            }
            className={
              allocationType ===
                "PREFIX"
                ? "rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                : "rounded-md border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            }
          >
            Prefix
          </button>

          <button
            type="button"
            onClick={() => {
              setAllocationType(
                "RANGE",
              );

              setFormError(
                null,
              );
            }}
            disabled={
              disabled
            }
            className={
              allocationType ===
                "RANGE"
                ? "rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                : "rounded-md border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            }
          >
            Range
          </button>

        </div>

        {/* ------------------------------------------------------------------
            Prefix
        ------------------------------------------------------------------- */}

        {allocationType ===
          "PREFIX" ? (

          <div className="space-y-2">

            <label
              htmlFor="numberingPrefix"
              className="text-xs font-medium text-slate-600"
            >
              Prefix
            </label>

            <div className="flex gap-2">

              <input
                id="numberingPrefix"
                name="numberingPrefix"
                type="text"
                value={
                  prefix
                }
                onChange={(
                  event,
                ) =>
                  setPrefix(
                    event.target.value,
                  )
                }
                onKeyDown={(
                  event,
                ) => {
                  if (
                    event.key ===
                    "Enter"
                  ) {
                    event.preventDefault();

                    handleAdd();
                  }
                }}
                inputMode="numeric"
                maxLength={20}
                disabled={
                  disabled
                }
                placeholder="e.g. 88"
                autoComplete="off"
                className="h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 font-mono text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
              />

              <button
                type="button"
                onClick={
                  handleAdd
                }
                disabled={
                  disabled
                }
                className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add
              </button>

            </div>

            <p className="text-xs text-slate-400">
              Example: 88 represents numbers beginning
              with this prefix.
            </p>

          </div>

        ) : (

          /* ----------------------------------------------------------------
             Range
          ----------------------------------------------------------------- */

          <div className="space-y-2">

            <div className="grid grid-cols-[1fr_auto_1fr_auto] items-end gap-2">

              <div>

                <label
                  htmlFor="rangeFrom"
                  className="mb-1 block text-xs font-medium text-slate-600"
                >
                  From
                </label>

                <input
                  id="rangeFrom"
                  name="rangeFrom"
                  type="text"
                  value={
                    rangeFrom
                  }
                  onChange={(
                    event,
                  ) =>
                    setRangeFrom(
                      event.target.value,
                    )
                  }
                  onKeyDown={(
                    event,
                  ) => {
                    if (
                      event.key ===
                      "Enter"
                    ) {
                      event.preventDefault();

                      handleAdd();
                    }
                  }}
                  inputMode="numeric"
                  maxLength={20}
                  disabled={
                    disabled
                  }
                  placeholder="801"
                  autoComplete="off"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 font-mono text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                />

              </div>

              <div className="pb-2 text-xs text-slate-400">
                to
              </div>

              <div>

                <label
                  htmlFor="rangeTo"
                  className="mb-1 block text-xs font-medium text-slate-600"
                >
                  To
                </label>

                <input
                  id="rangeTo"
                  name="rangeTo"
                  type="text"
                  value={
                    rangeTo
                  }
                  onChange={(
                    event,
                  ) =>
                    setRangeTo(
                      event.target.value,
                    )
                  }
                  onKeyDown={(
                    event,
                  ) => {
                    if (
                      event.key ===
                      "Enter"
                    ) {
                      event.preventDefault();

                      handleAdd();
                    }
                  }}
                  inputMode="numeric"
                  maxLength={20}
                  disabled={
                    disabled
                  }
                  placeholder="850"
                  autoComplete="off"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 font-mono text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                />

              </div>

              <button
                type="button"
                onClick={
                  handleAdd
                }
                disabled={
                  disabled
                }
                className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add
              </button>

            </div>

            <p className="text-xs text-slate-400">
              The start and end must contain the same
              number of digits. Example: 801–850.
            </p>

          </div>

        )}

        {/* ------------------------------------------------------------------
            Validation error
        ------------------------------------------------------------------- */}

        {formError && (
          <p
            role="alert"
            className="mt-3 text-xs text-red-600"
          >
            {formError}
          </p>
        )}

      </div>

      {/* ====================================================================
          Preview
      ===================================================================== */}

      {value.length > 0 && (
        <div className="rounded-lg bg-slate-50 px-4 py-3">

          <div className="text-xs font-medium text-slate-600">
            Numbering allocation
          </div>

          <div className="mt-2 flex flex-wrap gap-2">

            {value.map(
              (allocation) => (
                <span
                  key={
                    allocation.id
                  }
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-xs text-slate-700"
                >
                  +
                  {
                    callingCodes.join(
                      "/",
                    )
                  }{" "}

                  {allocation.type ===
                    "PREFIX"
                    ? `${allocation.value}...`
                    : `${allocation.from}–${allocation.to}`}
                </span>
              ),
            )}

          </div>

          {/* ----------------------------------------------------------------
              Generated routing pattern
          ----------------------------------------------------------------- */}

          {generatedRegex && (
            <details className="mt-3">

              <summary className="cursor-pointer text-xs text-slate-400">
                Show generated routing pattern
              </summary>

              <code className="mt-2 block break-all rounded-md bg-white p-2 font-mono text-xs text-slate-600">
                {
                  generatedRegex
                }
              </code>

            </details>
          )}

        </div>
      )}

    </div>
  );
}