"use client";

import Link from "next/link";

import {
  ChangeEvent,
  DragEvent,
  useRef,
  useState,
} from "react";

import {
  PageContainer,
} from "@/components/layout/page-container";

import {
  PageHeader,
} from "@/components/layout/page-header";

import type {
  Client,
} from "@/features/clients/api/clients-api";

import {
  createMessagesFromSpreadsheet,
  Message,
  MessagesApiError,
  SpreadsheetValidationError,
} from "@/features/messages/api/messages-api";

// ============================================================================
// Types
// ============================================================================

interface MessagesBulkClientProps {
  readonly client: Client;
  readonly canCreateMessages: boolean;
}

// ============================================================================
// Component
// ============================================================================

export default function MessagesBulkClient({
  client,
  canCreateMessages,
}: MessagesBulkClientProps) {
  const inputRef =
    useRef<HTMLInputElement>(null);

  const [file, setFile] =
    useState<File | null>(null);

  const [isDragging, setIsDragging] =
    useState(false);

  const [isUploading, setIsUploading] =
    useState(false);

  const [createdMessages, setCreatedMessages] =
    useState<Message[] | null>(null);

  const [errors, setErrors] =
    useState<SpreadsheetValidationError[]>(
      [],
    );

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const clientName =
    client.displayName ||
    client.companyName;

  // ==========================================================================
  // File handling
  // ==========================================================================

  const validateFile = (
    selectedFile: File,
  ): boolean => {
    const extension =
      selectedFile.name
        .split(".")
        .pop()
        ?.toLowerCase();

    if (extension !== "xlsx") {
      setFile(null);

      setErrorMessage(
        "Please select an Excel spreadsheet (.xlsx) file.",
      );

      setErrors([]);

      return false;
    }

    if (selectedFile.size === 0) {
      setFile(null);

      setErrorMessage(
        "The selected file is empty.",
      );

      setErrors([]);

      return false;
    }

    setFile(selectedFile);

    setErrorMessage(null);
    setErrors([]);
    setCreatedMessages(null);

    return true;
  };

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    validateFile(selectedFile);
  };

  const handleDrop = (
    event: DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();

    setIsDragging(false);

    const droppedFile =
      event.dataTransfer.files?.[0];

    if (!droppedFile) {
      return;
    }

    validateFile(droppedFile);
  };

  const handleDragOver = (
    event: DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();

    setIsDragging(true);
  };

  const handleDragLeave = (
    event: DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();

    setIsDragging(false);
  };

  const handleSelectFile = () => {
    if (!canCreateMessages || isUploading) {
      return;
    }

    inputRef.current?.click();
  };

  // ==========================================================================
  // Upload
  // ==========================================================================

  const handleUpload = async () => {
    if (
      !file ||
      isUploading ||
      !canCreateMessages
    ) {
      return;
    }

    setIsUploading(true);

    setErrorMessage(null);
    setErrors([]);
    setCreatedMessages(null);

    try {
      const messages =
        await createMessagesFromSpreadsheet(
          client.id,
          file,
        );

      setCreatedMessages(
        messages,
      );

      setFile(null);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (error: unknown) {
      if (error instanceof MessagesApiError) {
        setErrorMessage(
          error.message ||
          "Unable to upload the spreadsheet.",
        );

        setErrors(
          [...error.errors],
        );
      } else if (error instanceof Error) {
        setErrorMessage(
          error.message ||
          "Unable to upload the spreadsheet. Please try again.",
        );

        setErrors([]);
      } else {
        setErrorMessage(
          "Unable to upload the spreadsheet. Please try again.",
        );

        setErrors([]);
      }
    } finally {
      setIsUploading(false);
    }
  };

  // ==========================================================================
  // Remove file
  // ==========================================================================

  const handleRemoveFile = () => {
    if (isUploading) {
      return;
    }

    setFile(null);

    setErrorMessage(null);
    setErrors([]);
    setCreatedMessages(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <PageContainer>
      {/* ======================================================================
          Header
      ======================================================================= */}

      <PageHeader
        title="Bulk upload messages"
        description={`Upload an Excel spreadsheet to create multiple messages for ${clientName}.`}
      >
        <Link
          href={`/messages`}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        >
          ← Back to Messages
        </Link>
      </PageHeader>

      {/* ======================================================================
          Content
      ======================================================================= */}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* ====================================================================
            Upload
        ===================================================================== */}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
            <h2 className="text-sm font-semibold text-slate-900">
              Upload spreadsheet
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select an Excel spreadsheet containing the messages
              you want to create.
            </p>
          </div>

          <div className="p-5 sm:p-6">
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleFileChange}
              disabled={
                isUploading ||
                !canCreateMessages
              }
              className="hidden"
            />

            {/* ================================================================
                Dropzone
            ================================================================= */}

            {!file ? (
              <div
                role="button"
                tabIndex={
                  canCreateMessages
                    ? 0
                    : -1
                }
                aria-disabled={
                  !canCreateMessages
                }
                onClick={
                  handleSelectFile
                }
                onKeyDown={(
                  event,
                ) => {
                  if (
                    !canCreateMessages ||
                    isUploading
                  ) {
                    return;
                  }

                  if (
                    event.key === "Enter" ||
                    event.key === " "
                  ) {
                    event.preventDefault();

                    handleSelectFile();
                  }
                }}
                onDragOver={
                  canCreateMessages
                    ? handleDragOver
                    : undefined
                }
                onDragEnter={
                  canCreateMessages
                    ? handleDragOver
                    : undefined
                }
                onDragLeave={
                  canCreateMessages
                    ? handleDragLeave
                    : undefined
                }
                onDrop={
                  canCreateMessages
                    ? handleDrop
                    : undefined
                }
                className={[
                  "flex min-h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition",
                  !canCreateMessages
                    ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-60"
                    : isDragging
                      ? "cursor-pointer border-blue-500 bg-blue-50"
                      : "cursor-pointer border-slate-300 bg-slate-50/50 hover:border-blue-400 hover:bg-blue-50/40",
                ].join(" ")}
              >
                <div
                  className={[
                    "mb-4 flex h-12 w-12 items-center justify-center rounded-full transition",
                    isDragging &&
                      canCreateMessages
                      ? "bg-blue-100 text-blue-600"
                      : "bg-slate-100 text-slate-500",
                  ].join(" ")}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-6 w-6"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 16V4m0 0L8 8m4-4 4 4"
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 12v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"
                    />
                  </svg>
                </div>

                <p className="text-sm font-semibold text-slate-900">
                  Drop your spreadsheet here
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  or{" "}
                  <span className="font-medium text-blue-600">
                    browse files
                  </span>
                </p>

                <p className="mt-3 text-xs text-slate-400">
                  Excel workbook (.xlsx)
                </p>
              </div>
            ) : (
              /* ==============================================================
                  Selected file
              =============================================================== */

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 ring-1 ring-slate-200">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      className="h-5 w-5"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14 2v6h6"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 13h8M8 17h6"
                      />
                    </svg>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {file.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {formatFileSize(
                        file.size,
                      )}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      handleRemoveFile
                    }
                    disabled={
                      isUploading
                    }
                    className="shrink-0 text-sm font-medium text-slate-500 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            {/* ================================================================
                General error
            ================================================================= */}

            {errorMessage && (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-3.5 w-3.5"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8v4m0 4h.01"
                      />

                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                      />
                    </svg>
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-red-800">
                      Upload failed
                    </p>

                    <p className="mt-0.5 text-sm text-red-700">
                      {errorMessage}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ================================================================
                Validation errors
            ================================================================= */}

            {errors.length > 0 && (
              <div
                role="alert"
                className="mt-5 overflow-hidden rounded-xl border border-red-200 bg-white"
              >
                <div className="border-b border-red-200 bg-red-50 px-4 py-3.5">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 8v4m0 4h.01"
                        />

                        <circle
                          cx="12"
                          cy="12"
                          r="9"
                        />
                      </svg>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-red-800">
                        {errors.length}{" "}
                        {errors.length === 1
                          ? "validation error"
                          : "validation errors"}{" "}
                        found
                      </h3>

                      <p className="mt-0.5 text-xs text-red-700">
                        Fix the affected rows in the
                        spreadsheet and upload it again.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-left text-sm">
                    <thead className="border-b border-red-100 bg-red-50/50">
                      <tr>
                        <th className="w-20 whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-red-700">
                          Row
                        </th>

                        <th className="w-36 whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-red-700">
                          Field
                        </th>

                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-red-700">
                          Error
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-red-100">
                      {errors.map(
                        (
                          validationError,
                          index,
                        ) => (
                          <tr
                            key={`${validationError.row}-${validationError.field}-${index}`}
                            className="transition hover:bg-red-50/40"
                          >
                            <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-medium text-red-700">
                              {validationError.row}
                            </td>

                            <td className="whitespace-nowrap px-4 py-3">
                              <code className="rounded bg-red-50 px-1.5 py-1 font-mono text-xs font-medium text-red-700">
                                {
                                  validationError.field
                                }
                              </code>
                            </td>

                            <td className="px-4 py-3 text-sm text-red-700">
                              {
                                validationError.message
                              }
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ================================================================
                Success
            ================================================================= */}

            {createdMessages && (
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m5 12 4 4L19 6"
                      />
                    </svg>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-emerald-800">
                      Upload successful
                    </p>

                    <p className="mt-1 text-sm text-emerald-700">
                      {createdMessages.length}{" "}
                      {createdMessages.length === 1
                        ? "message was"
                        : "messages were"}{" "}
                      created successfully.
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/clients/${encodeURIComponent(
                      client.id,
                    )}/messages`}
                    className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    View messages
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setCreatedMessages(null);
                    }}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Upload another
                  </button>
                </div>
              </div>
            )}

            {/* ================================================================
                Actions
            ================================================================= */}

            <div className="mt-6 flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <Link
                href={`/clients/${encodeURIComponent(
                  client.id,
                )}/messages`}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                Cancel
              </Link>

              <button
                type="button"
                onClick={
                  handleUpload
                }
                disabled={
                  !file ||
                  isUploading ||
                  !canCreateMessages
                }
                className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Uploading...
                  </>
                ) : (
                  "Upload messages"
                )}
              </button>
            </div>
          </div>
        </section>

        {/* ====================================================================
            Spreadsheet format
        ===================================================================== */}

        <aside className="h-fit overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Spreadsheet format
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your spreadsheet must contain these columns.
            </p>
          </div>

          <div className="p-5">
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <div className="grid grid-cols-[1fr_70px] border-b border-slate-200 bg-slate-50 px-3 py-2.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Column
                </span>

                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Required
                </span>
              </div>

              {[
                "destination",
                "message",
                "senderId",
                "encoding",
              ].map(
                (column) => (
                  <div
                    key={column}
                    className="grid grid-cols-[1fr_70px] border-b border-slate-100 px-3 py-3 last:border-b-0"
                  >
                    <code className="text-xs text-slate-700">
                      {column}
                    </code>

                    <span className="text-xs font-medium text-slate-600">
                      Yes
                    </span>
                  </div>
                ),
              )}
            </div>

            {/* ================================================================
                Encoding
            ================================================================= */}

            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3.5">
              <p className="text-xs font-semibold text-slate-700">
                Encoding
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Use one of:
              </p>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {[
                  "GSM7",
                  "UCS2",
                  "BINARY",
                ].map(
                  (encoding) => (
                    <code
                      key={encoding}
                      className="rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-[11px] text-slate-600"
                    >
                      {encoding}
                    </code>
                  ),
                )}
              </div>
            </div>

            {/* ================================================================
                Sender ID note
            ================================================================= */}

            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3.5">
              <p className="text-xs font-semibold text-slate-700">
                Sender ID
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Enter the approved Sender ID name, not its internal
                UUID. The Sender ID must belong to this client and
                have an approved status.
              </p>
            </div>

            {/* ================================================================
                Validation note
            ================================================================= */}

            <div className="mt-5 flex items-start gap-2.5">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                />

                <path
                  strokeLinecap="round"
                  d="M12 10v6"
                />

                <path
                  strokeLinecap="round"
                  d="M12 7h.01"
                />
              </svg>

              <p className="text-xs leading-5 text-slate-500">
                All rows are validated before messages are
                created. If any row is invalid, the entire
                upload is rejected and no messages from the
                spreadsheet are created.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </PageContainer>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function formatFileSize(
  bytes: number,
): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}