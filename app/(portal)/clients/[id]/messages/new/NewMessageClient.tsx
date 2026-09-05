"use client";

import Link from "next/link";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
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
  findSenderIds,
  SenderId,
  SenderIdsApiError,
} from "@/features/sender-ids/api/sender-ids-api";

import {
  createMessage,
  Message,
  MessageEncoding,
  MessagesApiError,
} from "@/features/messages/api/messages-api";

// ============================================================================
// Types
// ============================================================================

interface NewMessageClientProps {
  readonly client: Client;
}

// ============================================================================
// Constants
// ============================================================================

const ENCODINGS: MessageEncoding[] = [
  "GSM7",
  "UCS2",
  "BINARY",
];

const GSM7_EXTENDED_CHARACTERS =
  new Set([
    "€",
    "[",
    "]",
    "{",
    "}",
    "^",
    "~",
    "\\",
    "|",
  ]);

// ============================================================================
// Component
// ============================================================================

export default function NewMessageClient({
  client,
}: NewMessageClientProps) {
  const [
    senderIds,
    setSenderIds,
  ] = useState<SenderId[]>([]);

  const [
    selectedSenderId,
    setSelectedSenderId,
  ] = useState("");

  const [
    destination,
    setDestination,
  ] = useState("");

  const [
    body,
    setBody,
  ] = useState("");

  const [
    encoding,
    setEncoding,
  ] =
    useState<MessageEncoding>(
      "GSM7",
    );

  const [
    isLoadingSenderIds,
    setIsLoadingSenderIds,
  ] = useState(true);

  const [
    isSending,
    setIsSending,
  ] = useState(false);

  const [
    createdMessage,
    setCreatedMessage,
  ] = useState<Message | null>(
    null,
  );

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(
    null,
  );

  const [
    fieldErrors,
    setFieldErrors,
  ] = useState<
    Record<string, string>
  >({});

  // ==========================================================================
  // Load approved Sender IDs
  // ==========================================================================

  useEffect(() => {
    let cancelled = false;

    const loadSenderIds =
      async () => {
        setIsLoadingSenderIds(
          true,
        );

        try {
          const result =
            await findSenderIds({
              clientId:
                client.id,

              status:
                "APPROVED",

              page: 1,

              pageSize: 100,
            });

          if (cancelled) {
            return;
          }

          const approvedSenderIds =
            result.items.filter(
              (
                senderId,
              ) =>
                senderId.status ===
                "APPROVED",
            );

          setSenderIds(
            approvedSenderIds,
          );

          const defaultSender =
            approvedSenderIds.find(
              (
                senderId,
              ) =>
                senderId.isDefault,
            );

          if (defaultSender) {
            setSelectedSenderId(
              defaultSender.id,
            );
          } else if (
            approvedSenderIds.length ===
            1
          ) {
            setSelectedSenderId(
              approvedSenderIds[0]
                .id,
            );
          }
        } catch (error) {
          if (cancelled) {
            return;
          }

          if (
            error instanceof
            SenderIdsApiError
          ) {
            setErrorMessage(
              error.message,
            );
          } else {
            setErrorMessage(
              "Unable to load approved Sender IDs.",
            );
          }
        } finally {
          if (!cancelled) {
            setIsLoadingSenderIds(
              false,
            );
          }
        }
      };

    void loadSenderIds();

    return () => {
      cancelled = true;
    };
  }, [client.id]);

  // ==========================================================================
  // Message calculation
  // ==========================================================================

  const segmentInfo =
    useMemo(
      () =>
        calculateSegments(
          body,
          encoding,
        ),
      [
        body,
        encoding,
      ],
    );

  // ==========================================================================
  // Field changes
  // ==========================================================================

  const handleDestinationChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    setDestination(
      event.target.value,
    );

    setFieldErrors(
      (current) => {
        const next = {
          ...current,
        };

        delete next.destination;

        return next;
      },
    );

    setErrorMessage(null);
  };

  const handleBodyChange = (
    event: ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setBody(
      event.target.value,
    );

    setFieldErrors(
      (current) => {
        const next = {
          ...current,
        };

        delete next.body;

        return next;
      },
    );

    setErrorMessage(null);
  };

  const handleSenderChange = (
    event: ChangeEvent<HTMLSelectElement>,
  ) => {
    setSelectedSenderId(
      event.target.value,
    );

    setFieldErrors(
      (current) => {
        const next = {
          ...current,
        };

        delete next.senderIdId;

        return next;
      },
    );

    setErrorMessage(null);
  };

  const handleEncodingChange = (
    event: ChangeEvent<HTMLSelectElement>,
  ) => {
    setEncoding(
      event.target.value as MessageEncoding,
    );

    setErrorMessage(null);
  };

  // ==========================================================================
  // Submit
  // ==========================================================================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (isSending) {
      return;
    }

    setErrorMessage(null);
    setFieldErrors({});
    setCreatedMessage(null);

    const validationErrors: Record<
      string,
      string
    > = {};

    if (!selectedSenderId) {
      validationErrors.senderIdId =
        "Please select a Sender ID.";
    }

    if (!destination.trim()) {
      validationErrors.destination =
        "Destination is required.";
    }

    if (!body.trim()) {
      validationErrors.body =
        "Message body is required.";
    }

    if (
      destination.trim().length >
      20
    ) {
      validationErrors.destination =
        "Destination must not exceed 20 characters.";
    }

    if (
      Object.keys(
        validationErrors,
      ).length > 0
    ) {
      setFieldErrors(
        validationErrors,
      );

      setErrorMessage(
        "Please correct the highlighted fields.",
      );

      return;
    }

    setIsSending(true);

    try {
      const message =
        await createMessage(
          client.id,
          {
            senderIdId:
              selectedSenderId,

            destination:
              destination.trim(),

            body,

            encoding,
          },
        );

      setCreatedMessage(
        message,
      );

      setDestination("");
      setBody("");
      setFieldErrors({});
    } catch (error: unknown) {
      if (
        error instanceof
        MessagesApiError
      ) {
        setErrorMessage(
          error.message ||
          "Unable to send message.",
        );

        const nextFieldErrors: Record<
          string,
          string
        > = {};

        for (
          const validationError of error.errors
        ) {
          const field =
            validationError.field;

          if (
            !nextFieldErrors[field]
          ) {
            nextFieldErrors[field] =
              validationError.message;
          }
        }

        setFieldErrors(
          nextFieldErrors,
        );
      } else if (
        error instanceof Error
      ) {
        setErrorMessage(
          error.message ||
          "Unable to send message.",
        );
      } else {
        setErrorMessage(
          "Unable to send message. Please try again.",
        );
      }
    } finally {
      setIsSending(false);
    }
  };

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <PageContainer>
      <PageHeader
        title="New message"
        description={`Send a message from ${clientName(client)}.`}
      >
        <Link
          href={`/clients/${encodeURIComponent(
            client.id,
          )}/messages`}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        >
          ← Back to Messages
        </Link>
      </PageHeader>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* ====================================================================
            Compose
        ===================================================================== */}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
            <h2 className="text-sm font-semibold text-slate-900">
              Compose message
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Enter the recipient and message details below.
            </p>
          </div>

          <form
            onSubmit={
              handleSubmit
            }
            noValidate
            className="p-5 sm:p-6"
          >
            {/* ================================================================
                Sender ID
            ================================================================= */}

            <div>
              <label
                htmlFor="senderId"
                className="block text-sm font-medium text-slate-700"
              >
                Sender ID
              </label>

              <select
                id="senderId"
                value={
                  selectedSenderId
                }
                onChange={
                  handleSenderChange
                }
                disabled={
                  isLoadingSenderIds ||
                  isSending
                }
                className={[
                  "mt-1.5 block h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 outline-none transition",
                  "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
                  fieldErrors.senderIdId
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                    : "border-slate-200",
                  "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
                ].join(" ")}
              >
                <option value="">
                  {isLoadingSenderIds
                    ? "Loading Sender IDs..."
                    : senderIds.length ===
                      0
                      ? "No approved Sender IDs available"
                      : "Select a Sender ID"}
                </option>

                {senderIds.map(
                  (
                    senderId,
                  ) => (
                    <option
                      key={
                        senderId.id
                      }
                      value={
                        senderId.id
                      }
                    >
                      {senderId.sender}
                      {senderId.isDefault
                        ? " (Default)"
                        : ""}
                    </option>
                  ),
                )}
              </select>

              {fieldErrors.senderIdId && (
                <p className="mt-1.5 text-xs text-red-600">
                  {
                    fieldErrors.senderIdId
                  }
                </p>
              )}
            </div>

            {/* ================================================================
                Destination
            ================================================================= */}

            <div className="mt-5">
              <label
                htmlFor="destination"
                className="block text-sm font-medium text-slate-700"
              >
                Destination
              </label>

              <input
                id="destination"
                type="tel"
                value={
                  destination
                }
                onChange={
                  handleDestinationChange
                }
                disabled={
                  isSending
                }
                placeholder="265991234567"
                maxLength={20}
                autoComplete="tel"
                className={[
                  "mt-1.5 block h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400",
                  "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
                  fieldErrors.destination
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                    : "border-slate-200",
                  "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
                ].join(" ")}
              />

              {fieldErrors.destination && (
                <p className="mt-1.5 text-xs text-red-600">
                  {
                    fieldErrors.destination
                  }
                </p>
              )}

              {!fieldErrors.destination && (
                <p className="mt-1.5 text-xs text-slate-400">
                  Enter the recipient's phone number in international format.
                </p>
              )}
            </div>

            {/* ================================================================
                Encoding
            ================================================================= */}

            <div className="mt-5">
              <label
                htmlFor="encoding"
                className="block text-sm font-medium text-slate-700"
              >
                Encoding
              </label>

              <select
                id="encoding"
                value={
                  encoding
                }
                onChange={
                  handleEncodingChange
                }
                disabled={
                  isSending
                }
                className="mt-1.5 block h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
              >
                {ENCODINGS.map(
                  (
                    value,
                  ) => (
                    <option
                      key={value}
                      value={value}
                    >
                      {value}
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* ================================================================
                Message
            ================================================================= */}

            <div className="mt-5">
              <div className="flex items-center justify-between gap-4">
                <label
                  htmlFor="body"
                  className="block text-sm font-medium text-slate-700"
                >
                  Message
                </label>

                <span className="text-xs text-slate-400">
                  {segmentInfo.characters}{" "}
                  {segmentInfo.characters ===
                    1
                    ? "character"
                    : "characters"}
                </span>
              </div>

              <textarea
                id="body"
                value={body}
                onChange={
                  handleBodyChange
                }
                disabled={
                  isSending
                }
                rows={7}
                placeholder="Type your message..."
                className={[
                  "mt-1.5 block w-full resize-y rounded-lg border bg-white px-3 py-2.5 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400",
                  "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
                  fieldErrors.body
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                    : "border-slate-200",
                  "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
                ].join(" ")}
              />

              <div className="mt-1.5 flex items-center justify-between gap-4">
                {fieldErrors.body ? (
                  <p className="text-xs text-red-600">
                    {
                      fieldErrors.body
                    }
                  </p>
                ) : (
                  <p className="text-xs text-slate-400">
                    {segmentInfo.encodingLabel}
                  </p>
                )}

                <p className="text-xs font-medium text-slate-500">
                  {segmentInfo.segments}{" "}
                  {segmentInfo.segments ===
                    1
                    ? "segment"
                    : "segments"}
                </p>
              </div>
            </div>

            {/* ================================================================
                Error
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

                  <div>
                    <p className="text-sm font-semibold text-red-800">
                      Unable to send message
                    </p>

                    <p className="mt-0.5 text-sm text-red-700">
                      {errorMessage}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ================================================================
                Success
            ================================================================= */}

            {createdMessage && (
              <div
                role="status"
                className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4"
              >
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

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-emerald-800">
                      Message queued
                    </p>

                    <p className="mt-1 text-sm text-emerald-700">
                      Your message has been accepted for
                      processing.
                    </p>

                    <p className="mt-2 font-mono text-xs text-emerald-700">
                      {createdMessage.publicId}
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
                      setCreatedMessage(
                        null,
                      );
                    }}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Send another
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
                type="submit"
                disabled={
                  isSending ||
                  isLoadingSenderIds ||
                  senderIds.length ===
                  0
                }
                className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Sending...
                  </>
                ) : (
                  "Send message"
                )}
              </button>
            </div>
          </form>
        </section>

        {/* ====================================================================
            Message summary
        ===================================================================== */}

        <aside className="h-fit overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Message summary
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review the message before sending.
            </p>
          </div>

          <div className="p-5">
            <div className="space-y-4">
              <SummaryItem
                label="Sender ID"
                value={
                  selectedSenderId
                    ? senderIds.find(
                      (
                        senderId,
                      ) =>
                        senderId.id ===
                        selectedSenderId,
                    )?.sender ??
                    "Selected"
                    : "Not selected"
                }
              />

              <SummaryItem
                label="Destination"
                value={
                  destination ||
                  "Not entered"
                }
              />

              <SummaryItem
                label="Encoding"
                value={
                  encoding
                }
              />

              <SummaryItem
                label="Segments"
                value={`${segmentInfo.segments}`}
              />

              <SummaryItem
                label="Characters"
                value={`${segmentInfo.characters}`}
              />
            </div>

            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3.5">
              <p className="text-xs font-semibold text-slate-700">
                Delivery
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                After submission, the message is queued for
                processing. Delivery status can be tracked from
                the Messages page.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </PageContainer>
  );
}

// ============================================================================
// Components
// ============================================================================

function SummaryItem({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium text-slate-700">
        {value}
      </p>
    </div>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function clientName(
  client: Client,
): string {
  return (
    client.displayName ||
    client.companyName
  );
}

interface SegmentInfo {
  characters: number;
  segments: number;
  encodingLabel: string;
}

function calculateSegments(
  value: string,
  encoding: MessageEncoding,
): SegmentInfo {
  const characters =
    value.length;

  if (characters === 0) {
    return {
      characters: 0,
      segments: 0,
      encodingLabel:
        encoding === "GSM7"
          ? "GSM-7 encoding"
          : encoding === "UCS2"
            ? "UCS-2 encoding"
            : "Binary encoding",
    };
  }

  if (encoding === "GSM7") {
    const gsm7Length =
      getGsm7CharacterLength(
        value,
      );

    return {
      characters,
      segments:
        gsm7Length <= 160
          ? 1
          : Math.ceil(
            gsm7Length / 153,
          ),
      encodingLabel:
        "GSM-7 encoding",
    };
  }

  if (encoding === "UCS2") {
    return {
      characters,
      segments:
        characters <= 70
          ? 1
          : Math.ceil(
            characters / 67,
          ),
      encodingLabel:
        "UCS-2 encoding",
    };
  }

  return {
    characters,
    segments:
      characters <= 140
        ? 1
        : Math.ceil(
          characters / 134,
        ),
    encodingLabel:
      "Binary encoding",
  };
}

function getGsm7CharacterLength(
  value: string,
): number {
  let length = 0;

  for (
    const character of value
  ) {
    length +=
      GSM7_EXTENDED_CHARACTERS.has(
        character,
      )
        ? 2
        : 1;
  }

  return length;
}