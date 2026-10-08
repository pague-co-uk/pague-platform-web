"use client";

import {
  useEffect,
  useState,
} from "react";

// ============================================================================
// Types
// ============================================================================

export interface JsonEditorProps {
  id: string;
  name?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;

  placeholder?: string;
  rows?: number;

  disabled?: boolean;

  optional?: boolean;

  validateJson?: boolean;
  onValidateJsonChange?: (
    enabled: boolean,
  ) => void;

  prettyFormat?: boolean;
  onPrettyFormatChange?: (
    enabled: boolean,
  ) => void;

  description?: string;
}

// ============================================================================
// Helpers
// ============================================================================

interface JsonParseResult {
  valid: boolean;
  value?: Record<
    string,
    unknown
  >;
  error?: string;
}

function parseJsonObject(
  value: string,
): JsonParseResult {
  if (!value.trim()) {
    return {
      valid: false,
      error: "JSON cannot be empty.",
    };
  }

  try {
    const parsed =
      JSON.parse(value);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return {
        valid: false,
        error:
          "Value must be a JSON object.",
      };
    }

    return {
      valid: true,
      value:
        parsed as Record<
          string,
          unknown
        >,
    };
  } catch (error) {
    return {
      valid: false,
      error:
        error instanceof Error
          ? error.message
          : "Invalid JSON.",
    };
  }
}

// ============================================================================
// Component
// ============================================================================

export function JsonEditor({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  rows = 8,
  disabled = false,
  optional = true,
  validateJson: controlledValidateJson,
  onValidateJsonChange,
  prettyFormat: controlledPrettyFormat,
  onPrettyFormatChange,
  description,
}: JsonEditorProps) {
  const [
    internalValidateJson,
    setInternalValidateJson,
  ] = useState(false);

  const [
    internalPrettyFormat,
    setInternalPrettyFormat,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const [
    valid,
    setValid,
  ] = useState(false);

  const validateJson =
    controlledValidateJson ??
    internalValidateJson;

  const prettyFormat =
    controlledPrettyFormat ??
    internalPrettyFormat;

  // ==========================================================================
  // Validation
  // ==========================================================================

  function validate(
    input: string,
  ): JsonParseResult {
    if (!input.trim()) {
      if (optional) {
        setError(null);
        setValid(false);

        return {
          valid: true,
        };
      }

      const result = {
        valid: false,
        error:
          "JSON cannot be empty.",
      };

      setError(result.error);
      setValid(false);

      return result;
    }

    const result =
      parseJsonObject(input);

    if (!result.valid) {
      setError(
        result.error ??
        "Invalid JSON.",
      );
      setValid(false);
    } else {
      setError(null);
      setValid(true);
    }

    return result;
  }

  // ==========================================================================
  // Value changes
  // ==========================================================================

  function handleChange(
    input: string,
  ) {
    onChange(input);

    if (validateJson) {
      validate(input);
    } else {
      setError(null);
      setValid(false);
    }
  }

  // ==========================================================================
  // Validate toggle
  // ==========================================================================

  function handleValidateToggle(
    enabled: boolean,
  ) {
    if (
      controlledValidateJson ===
      undefined
    ) {
      setInternalValidateJson(
        enabled,
      );
    }

    onValidateJsonChange?.(
      enabled,
    );

    if (!enabled) {
      setError(null);
      setValid(false);
      return;
    }

    if (value.trim()) {
      validate(value);
    } else {
      setError(null);
      setValid(false);
    }
  }

  // ==========================================================================
  // Pretty format
  // ==========================================================================

  function handlePrettyFormat() {
    if (!value.trim()) {
      return;
    }

    const result =
      parseJsonObject(value);

    if (!result.valid) {
      setError(
        result.error ??
        "Invalid JSON.",
      );
      setValid(false);
      return;
    }

    const formatted =
      JSON.stringify(
        result.value,
        null,
        2,
      );

    onChange(formatted);

    setError(null);
    setValid(true);
  }

  function handlePrettyToggle(
    enabled: boolean,
  ) {
    if (
      controlledPrettyFormat ===
      undefined
    ) {
      setInternalPrettyFormat(
        enabled,
      );
    }

    onPrettyFormatChange?.(
      enabled,
    );

    if (enabled) {
      handlePrettyFormat();
    }
  }

  // ==========================================================================
  // Keep validation state synchronized
  // ==========================================================================

  useEffect(() => {
    if (!validateJson) {
      setError(null);
      setValid(false);
      return;
    }

    if (!value.trim()) {
      setError(null);
      setValid(false);
      return;
    }

    validate(value);
  }, [
    value,
    validateJson,
  ]);

  // ==========================================================================
  // Render
  // ==========================================================================

  const borderClass =
    error
      ? "border-red-300 focus:border-red-500 focus:ring-red-100"
      : valid
        ? "border-green-300 focus:border-green-500 focus:ring-green-100"
        : "border-slate-300 focus:border-blue-500 focus:ring-blue-100";

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-slate-700"
      >
        {label}
      </label>

      <textarea
        id={id}
        name={name}
        value={value}
        onChange={(event) =>
          handleChange(
            event.target.value,
          )
        }
        disabled={disabled}
        rows={rows}
        spellCheck={false}
        placeholder={placeholder}
        className={`w-full rounded-lg border bg-white px-3 py-2 font-mono text-sm text-slate-900 outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 ${borderClass}`}
      />

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">

        {/* Validate JSON */}

        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={validateJson}
            onChange={(event) =>
              handleValidateToggle(
                event.target.checked,
              )
            }
            disabled={disabled}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />

          <span>
            Validate JSON
          </span>
        </label>

        {/* Pretty format */}

        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={prettyFormat}
            onChange={(event) =>
              handlePrettyToggle(
                event.target.checked,
              )
            }
            disabled={disabled}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />

          <span>
            Pretty format
          </span>
        </label>
      </div>

      {/* Validation message */}

      {error ? (
        <p
          role="alert"
          className="mt-2 text-xs text-red-600"
        >
          {error}
        </p>
      ) : valid ? (
        <p className="mt-2 text-xs text-green-600">
          Valid JSON configuration.
        </p>
      ) : (
        <p className="mt-1.5 text-xs text-slate-500">
          {description ??
            (optional
              ? "Optional JSON object."
              : "JSON object.")}
        </p>
      )}
    </div>
  );
}