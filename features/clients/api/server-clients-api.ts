import {
  cookies,
} from "next/headers";
import { Client } from "./clients-api";

// ============================================================================
// Types
// ============================================================================

export interface ClientSummary {
  readonly id: string;

  readonly publicId: string;

  readonly companyName: string;

  readonly displayName: string;

  readonly email: string;

  readonly status:
  | "ACTIVE"
  | "SUSPENDED"
  | "DISABLED";

  readonly createdAt: string;
}

export interface FindClientsResult {
  readonly items: readonly ClientSummary[];

  readonly meta: {
    readonly page: number;

    readonly pageSize: number;

    readonly total: number;

    readonly totalPages: number;
  };
}

// ============================================================================
// Error
// ============================================================================

export class ClientsApiError extends Error {
  readonly status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);

    this.name =
      "ClientsApiError";

    this.status =
      status;
  }
}

// ============================================================================
// Configuration
// ============================================================================

function getControlPlaneUrl(): string {
  const value =
    process.env.CONTROL_PLANE_API_URL;

  if (!value) {
    throw new Error(
      "CONTROL_PLANE_API_URL is not configured.",
    );
  }

  return value.replace(
    /\/+$/,
    "",
  );
}

// ============================================================================
// Find clients
//
// Server-side only.
// ============================================================================

export async function findClients(
  options: {
    page?: number;

    pageSize?: number;

    search?: string;
  } = {},
): Promise<FindClientsResult> {
  const cookieStore =
    await cookies();

  const session =
    cookieStore.get(
      "session",
    );

  if (!session) {
    throw new ClientsApiError(
      "Authentication required.",
      401,
    );
  }

  const params =
    new URLSearchParams();

  // --------------------------------------------------------------------------
  // Pagination
  // --------------------------------------------------------------------------

  params.set(
    "page",
    String(
      options.page ?? 1,
    ),
  );

  params.set(
    "pageSize",
    String(
      options.pageSize ?? 100,
    ),
  );

  // --------------------------------------------------------------------------
  // Search
  // --------------------------------------------------------------------------

  if (options.search) {
    params.set(
      "search",
      options.search,
    );
  }

  // --------------------------------------------------------------------------
  // Request
  // --------------------------------------------------------------------------

  let response: Response;

  try {
    response =
      await fetch(
        `${getControlPlaneUrl()}/api/clients?${params.toString()}`,
        {
          method: "GET",

          headers: {
            Cookie:
              `${session.name}=${session.value}`,
          },

          cache:
            "no-store",
        },
      );
  } catch (error) {
    console.error(
      "[Clients] Failed to connect to Control Plane.",
      error,
    );

    throw new ClientsApiError(
      "Unable to connect to the client service.",
      502,
    );
  }

  // --------------------------------------------------------------------------
  // Response
  // --------------------------------------------------------------------------

  const text =
    await response.text();

  let body: unknown = null;

  if (text) {
    try {
      body =
        JSON.parse(text);
    } catch {
      body =
        text;
    }
  }

  // --------------------------------------------------------------------------
  // API error
  // --------------------------------------------------------------------------

  if (!response.ok) {
    throw new ClientsApiError(
      getClientErrorMessage(
        body,
        "Unable to load clients.",
      ),
      response.status,
    );
  }

  // --------------------------------------------------------------------------
  // Validate response
  // --------------------------------------------------------------------------

  if (
    typeof body !==
    "object" ||
    body === null ||
    !("success" in body) ||
    body.success !== true ||
    !("data" in body) ||
    !Array.isArray(
      body.data,
    ) ||
    !("pagination" in body) ||
    typeof body.pagination !==
    "object" ||
    body.pagination === null
  ) {
    throw new ClientsApiError(
      "Invalid clients response.",
      response.status,
    );
  }

  const pagination =
    body.pagination;

  if (
    !("page" in pagination) ||
    !("pageSize" in pagination) ||
    !("totalItems" in pagination) ||
    !("totalPages" in pagination)
  ) {
    throw new ClientsApiError(
      "Invalid clients pagination response.",
      response.status,
    );
  }

  // --------------------------------------------------------------------------
  // Normalize response
  // --------------------------------------------------------------------------

  return {
    items:
      body.data as ClientSummary[],

    meta: {
      page:
        Number(
          pagination.page,
        ),

      pageSize:
        Number(
          pagination.pageSize,
        ),

      total:
        Number(
          pagination.totalItems,
        ),

      totalPages:
        Number(
          pagination.totalPages,
        ),
    },
  };
}

// ============================================================================
// Find client
//
// Server-side only.
// ============================================================================

export async function findClientById(
  id: string,
): Promise<Client> {
  const cookieStore =
    await cookies();

  const session =
    cookieStore.get(
      "session",
    );

  if (!session) {
    throw new ClientsApiError(
      "Authentication required.",
      401,
    );
  }

  // --------------------------------------------------------------------------
  // Request
  // --------------------------------------------------------------------------

  let response: Response;

  try {
    response =
      await fetch(
        `${getControlPlaneUrl()}/api/clients/${encodeURIComponent(id)}`,
        {
          method: "GET",

          headers: {
            Cookie:
              `${session.name}=${session.value}`,
          },

          cache:
            "no-store",
        },
      );
  } catch (error) {
    console.error(
      "[Clients] Failed to connect to Control Plane.",
      error,
    );

    throw new ClientsApiError(
      "Unable to connect to the client service.",
      502,
    );
  }

  // --------------------------------------------------------------------------
  // Response
  // --------------------------------------------------------------------------

  const text =
    await response.text();

  let body: unknown = null;

  if (text) {
    try {
      body =
        JSON.parse(text);
    } catch {
      body =
        text;
    }
  }

  // --------------------------------------------------------------------------
  // API error
  // --------------------------------------------------------------------------

  if (!response.ok) {
    throw new ClientsApiError(
      getClientErrorMessage(
        body,
        "Unable to load client.",
      ),
      response.status,
    );
  }

  // --------------------------------------------------------------------------
  // Validate response
  // --------------------------------------------------------------------------

  if (
    typeof body !==
    "object" ||
    body === null ||
    !("success" in body) ||
    body.success !== true ||
    !("data" in body) ||
    typeof body.data !==
    "object" ||
    body.data === null
  ) {
    throw new ClientsApiError(
      "Invalid client response.",
      response.status,
    );
  }

  return body.data as Client;
}

// ============================================================================
// Error extraction
// ============================================================================

function getClientErrorMessage(
  data: unknown,
  fallback: string,
): string {
  if (
    typeof data !==
    "object" ||
    data === null
  ) {
    return fallback;
  }

  // --------------------------------------------------------------------------
  // Standard API error envelope
  // --------------------------------------------------------------------------

  if (
    "error" in data &&
    typeof data.error ===
    "object" &&
    data.error !== null &&
    "message" in data.error &&
    typeof data.error.message ===
    "string" &&
    data.error.message.trim()
  ) {
    return data.error.message;
  }

  // --------------------------------------------------------------------------
  // Direct message
  // --------------------------------------------------------------------------

  if (
    "message" in data &&
    typeof data.message ===
    "string" &&
    data.message.trim()
  ) {
    return data.message;
  }

  return fallback;
}