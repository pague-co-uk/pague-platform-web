"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import Link from "next/link";

import type {
  ClientSummary,
} from "@/features/clients/api/clients-api";

// ============================================================================
// Types
// ============================================================================

export interface ClientAction {
  readonly label: string;

  readonly href: (
    clientId: string,
  ) => string;

  readonly variant?:
  | "primary"
  | "secondary";
}

interface ClientActionSelectorProps {
  readonly clients: readonly ClientSummary[];

  readonly actions: readonly ClientAction[];

  readonly placeholder?: string;
}

// ============================================================================
// Component
// ============================================================================

export function ClientActionSelector({
  clients,
  actions,
  placeholder = "Select client",
}: ClientActionSelectorProps) {
  const comboboxId = useId();

  const listboxId =
    `${comboboxId}-listbox`;

  const optionIdPrefix =
    `${comboboxId}-option`;

  const containerRef =
    useRef<HTMLDivElement>(null);

  const inputRef =
    useRef<HTMLInputElement>(null);

  const [
    selectedClientId,
    setSelectedClientId,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    isOpen,
    setIsOpen,
  ] = useState(false);

  const [
    activeIndex,
    setActiveIndex,
  ] = useState(-1);

  // ========================================================================
  // Derived state
  // ========================================================================

  const selectedClient =
    useMemo(
      () =>
        clients.find(
          (client) =>
            client.id ===
            selectedClientId,
        ),
      [
        clients,
        selectedClientId,
      ],
    );

  const filteredClients =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return clients;
      }

      return clients.filter(
        (client) => {
          const displayName =
            client.displayName
              ?.toLowerCase() ?? "";

          const companyName =
            client.companyName
              ?.toLowerCase() ?? "";

          const publicId =
            client.publicId
              ?.toLowerCase() ?? "";

          return (
            displayName.includes(
              value,
            ) ||
            companyName.includes(
              value,
            ) ||
            publicId.includes(
              value,
            )
          );
        },
      );
    }, [
      clients,
      search,
    ]);

  const activeClient =
    activeIndex >= 0 &&
      activeIndex <
      filteredClients.length
      ? filteredClients[
      activeIndex
      ]
      : null;

  const activeOptionId =
    activeClient
      ? `${optionIdPrefix}-${activeClient.id}`
      : undefined;

  // ========================================================================
  // Close when clicking outside
  // ========================================================================

  useEffect(() => {
    function handlePointerDown(
      event: PointerEvent,
    ) {
      const target =
        event.target;

      if (
        target instanceof Node &&
        containerRef.current?.contains(
          target,
        )
      ) {
        return;
      }

      setIsOpen(false);
      setActiveIndex(-1);
    }

    document.addEventListener(
      "pointerdown",
      handlePointerDown,
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown,
      );
    };
  }, []);

  // ========================================================================
  // Keep active index valid when filtering changes
  // ========================================================================

  useEffect(() => {
    if (
      filteredClients.length === 0
    ) {
      setActiveIndex(-1);
      return;
    }

    setActiveIndex((current) =>
      current >=
        filteredClients.length
        ? filteredClients.length -
        1
        : current,
    );
  }, [
    filteredClients.length,
  ]);

  // ========================================================================
  // Selection
  // ========================================================================

  function selectClient(
    client: ClientSummary,
  ) {
    const name =
      client.displayName ||
      client.companyName;

    setSelectedClientId(
      client.id,
    );

    setSearch(name);

    setIsOpen(false);
    setActiveIndex(-1);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }

  // ========================================================================
  // Input changes
  // ========================================================================

  function handleSearchChange(
    value: string,
  ) {
    setSearch(value);

    setIsOpen(true);
    setActiveIndex(
      value.trim() === ""
        ? -1
        : 0,
    );

    // If the user edits the selected
    // client's name, the selection is
    // no longer considered valid.
    if (
      selectedClient &&
      value !==
      (selectedClient.displayName ||
        selectedClient.companyName)
    ) {
      setSelectedClientId("");
    }
  }

  // ========================================================================
  // Keyboard navigation
  // ========================================================================

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();

        if (!isOpen) {
          setIsOpen(true);

          if (
            filteredClients.length > 0
          ) {
            setActiveIndex(0);
          }

          return;
        }

        if (
          filteredClients.length === 0
        ) {
          return;
        }

        setActiveIndex((current) =>
          current < 0
            ? 0
            : Math.min(
              current + 1,
              filteredClients.length -
              1,
            ),
        );

        break;
      }

      case "ArrowUp": {
        event.preventDefault();

        if (!isOpen) {
          setIsOpen(true);

          if (
            filteredClients.length > 0
          ) {
            setActiveIndex(
              filteredClients.length -
              1,
            );
          }

          return;
        }

        if (
          filteredClients.length === 0
        ) {
          return;
        }

        setActiveIndex((current) =>
          current <= 0
            ? filteredClients.length -
            1
            : current - 1,
        );

        break;
      }

      case "Home": {
        if (
          isOpen &&
          filteredClients.length > 0
        ) {
          event.preventDefault();
          setActiveIndex(0);
        }

        break;
      }

      case "End": {
        if (
          isOpen &&
          filteredClients.length > 0
        ) {
          event.preventDefault();

          setActiveIndex(
            filteredClients.length -
            1,
          );
        }

        break;
      }

      case "Enter": {
        if (
          isOpen &&
          activeClient
        ) {
          event.preventDefault();
          selectClient(activeClient);
        }

        break;
      }

      case "Escape": {
        if (isOpen) {
          event.preventDefault();

          setIsOpen(false);
          setActiveIndex(-1);
        }

        break;
      }

      default:
        break;
    }
  }

  // ========================================================================
  // Clear
  // ========================================================================

  function handleClear() {
    setSelectedClientId("");
    setSearch("");
    setIsOpen(true);
    setActiveIndex(-1);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* ====================================================================
          Client combobox
      ===================================================================== */}

      <div
        ref={containerRef}
        className="relative"
      >
        <input
          ref={inputRef}
          id={comboboxId}
          type="text"
          role="combobox"
          value={search}
          onChange={(event) =>
            handleSearchChange(
              event.target.value,
            )
          }
          onFocus={() => {
            setIsOpen(true);

            if (
              search.trim() !== "" &&
              filteredClients.length > 0
            ) {
              setActiveIndex(
                (current) =>
                  current >= 0
                    ? current
                    : 0,
              );
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          aria-label="Search and select client"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={
            isOpen
              ? activeOptionId
              : undefined
          }
          className="inline-flex h-10 w-[240px] items-center rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />

        {/* ================================================================
            Clear button
        ================================================================= */}

        {search.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear client selection"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-1.5 py-1 text-sm leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            ×
          </button>
        )}

        {/* ================================================================
            Client results
        ================================================================= */}

        {isOpen && (
          <div
            id={listboxId}
            role="listbox"
            aria-label="Clients"
            className="absolute left-0 top-full z-50 mt-1 w-[320px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
          >
            {filteredClients.length ===
              0 ? (
              <div
                role="status"
                className="px-3 py-3 text-sm text-slate-500"
              >
                No clients found.
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto py-1">
                {filteredClients.map(
                  (
                    client,
                    index,
                  ) => {
                    const name =
                      client.displayName ||
                      client.companyName;

                    const isSelected =
                      selectedClientId ===
                      client.id;

                    const isActive =
                      activeIndex ===
                      index;

                    return (
                      <button
                        key={client.id}
                        id={`${optionIdPrefix}-${client.id}`}
                        type="button"
                        role="option"
                        aria-selected={
                          isSelected
                        }
                        onMouseDown={(
                          event,
                        ) => {
                          // Prevent the input from
                          // losing focus before selection.
                          event.preventDefault();
                        }}
                        onClick={() =>
                          selectClient(
                            client,
                          )
                        }
                        onMouseEnter={() =>
                          setActiveIndex(
                            index,
                          )
                        }
                        className={`block w-full px-3 py-2 text-left transition focus:outline-none ${isActive
                            ? "bg-slate-100"
                            : isSelected
                              ? "bg-blue-50"
                              : "hover:bg-slate-50"
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-slate-800">
                              {name}
                            </div>

                            <div className="mt-0.5 truncate font-mono text-[11px] text-slate-400">
                              {
                                client.publicId
                              }
                            </div>
                          </div>

                          {isSelected && (
                            <span
                              aria-hidden="true"
                              className="text-sm font-semibold text-blue-600"
                            >
                              ✓
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  },
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ====================================================================
          Actions
      ===================================================================== */}

      {actions.map(
        (action) => {
          const enabled =
            Boolean(
              selectedClientId,
            );

          const variant =
            action.variant ??
            "primary";

          const classes =
            variant ===
              "secondary"
              ? enabled
                ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                : "cursor-not-allowed border border-slate-200 bg-white text-slate-400 opacity-60"
              : enabled
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "cursor-not-allowed bg-blue-600 text-white opacity-60";

          return (
            <Link
              key={action.label}
              href={
                enabled
                  ? action.href(
                    selectedClientId,
                  )
                  : "#"
              }
              onClick={(event) => {
                if (!enabled) {
                  event.preventDefault();
                }
              }}
              aria-disabled={!enabled}
              tabIndex={
                enabled
                  ? undefined
                  : -1
              }
              className={`inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${classes}`}
            >
              {action.label}
            </Link>
          );
        },
      )}
    </div>
  );
}