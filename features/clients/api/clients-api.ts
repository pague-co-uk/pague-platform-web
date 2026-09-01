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

// ============================================================================
// Full client
// ============================================================================

export interface Client {
  readonly id: string;

  readonly publicId: string;

  readonly companyName: string;

  readonly displayName: string;

  readonly email: string;

  readonly phone: string | null;

  readonly status:
  | "ACTIVE"
  | "SUSPENDED"
  | "DISABLED";

  readonly rateLimitPerSecond: number;

  readonly timezone: string;

  readonly createdAt: string;

  readonly updatedAt: string;
}

// ============================================================================
// Create client
// ============================================================================

export interface CreateClientInput {
  readonly companyName: string;

  readonly clientCode: string;

  readonly displayName?: string;

  readonly email: string;

  readonly phone?: string;

  readonly rateLimitPerSecond?: number;

  readonly timezone?: string;
}

// ============================================================================
// Update client
// ============================================================================

export interface UpdateClientInput {
  readonly companyName?: string;

  readonly displayName?: string;

  readonly email?: string;

  readonly phone?: string;

  readonly rateLimitPerSecond?: number;

  readonly timezone?: string;
}

// ============================================================================
// Find clients result
// ============================================================================

export interface FindClientsResult {
  readonly items: ClientSummary[];

  readonly meta: {
    readonly page: number;

    readonly pageSize: number;

    readonly total: number;

    readonly totalPages: number;
  };
}

// ============================================================================
// API configuration
// ============================================================================

const API_BASE = "/api";

/**
 * Returns the base URL used to access the Next.js API.
 *
 * Browser:
 *   /api
 *
 * Server:
 *   http://localhost:3001/api
 *
 * The Control Plane URL is intentionally NOT used here.
 * The Next.js API routes are the frontend's proxy layer and are
 * responsible for forwarding requests to the Control Plane.
 */
function getApiBaseUrl(): string {
  if (
    typeof window !==
    "undefined"
  ) {
    return API_BASE;
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL is not configured.",
    );
  }

  return `${appUrl.replace(
    /\/+$/,
    "",
  )}${API_BASE}`;
}

// ============================================================================
// Error
// ============================================================================

export class ClientsApiError
  extends Error {
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
// Find clients
// ============================================================================

export async function findClients(
  options: {
    page?: number;

    pageSize?: number;

    search?: string;
  } = {},
): Promise<FindClientsResult> {
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

  const response =
    await fetch(
      `${getApiBaseUrl()}/clients?${params.toString()}`,
      {
        method: "GET",

        credentials:
          "include",

        cache:
          "no-store",
      },
    );

  // --------------------------------------------------------------------------
  // Response
  // --------------------------------------------------------------------------

  const body =
    (await response
      .json()
      .catch(
        () => null,
      )) as unknown;

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
  // Validate response envelope
  // --------------------------------------------------------------------------

  if (
    typeof body !==
    "object" ||
    body === null
  ) {
    throw new ClientsApiError(
      "Invalid clients response.",
      response.status,
    );
  }

  if (
    !("success" in body) ||
    body.success !== true
  ) {
    throw new ClientsApiError(
      "Invalid clients response.",
      response.status,
    );
  }

  if (
    !("data" in body) ||
    !Array.isArray(
      body.data,
    )
  ) {
    throw new ClientsApiError(
      "Invalid clients collection response.",
      response.status,
    );
  }

  // --------------------------------------------------------------------------
  // Validate pagination
  // --------------------------------------------------------------------------

  if (
    !("pagination" in body) ||
    typeof body.pagination !==
    "object" ||
    body.pagination === null
  ) {
    throw new ClientsApiError(
      "Invalid clients pagination response.",
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
// Find client by ID
// ============================================================================

export async function findClientById(
  id: string,
): Promise<Client> {
  const response =
    await fetch(
      `${getApiBaseUrl()}/clients/${encodeURIComponent(
        id,
      )}`,
      {
        method: "GET",

        credentials:
          "include",

        cache:
          "no-store",
      },
    );

  const body =
    (await response
      .json()
      .catch(
        () => null,
      )) as unknown;

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
// Create client
// ============================================================================

export async function createClient(
  input: CreateClientInput,
): Promise<Client> {
  const response =
    await fetch(
      `${getApiBaseUrl()}/clients`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        credentials:
          "include",

        cache:
          "no-store",

        body: JSON.stringify(
          input,
        ),
      },
    );

  const body =
    (await response
      .json()
      .catch(
        () => null,
      )) as unknown;

  // --------------------------------------------------------------------------
  // API error
  // --------------------------------------------------------------------------

  if (!response.ok) {
    throw new ClientsApiError(
      getClientErrorMessage(
        body,
        "Unable to create client.",
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
// Update client
// ============================================================================

export async function updateClient(
  id: string,
  input: UpdateClientInput,
): Promise<Client> {
  const response =
    await fetch(
      `${getApiBaseUrl()}/clients/${encodeURIComponent(
        id,
      )}`,
      {
        method: "PATCH",

        headers: {
          "Content-Type":
            "application/json",
        },

        credentials:
          "include",

        cache:
          "no-store",

        body: JSON.stringify(
          input,
        ),
      },
    );

  const body =
    (await response
      .json()
      .catch(
        () => null,
      )) as unknown;

  // --------------------------------------------------------------------------
  // API error
  // --------------------------------------------------------------------------

  if (!response.ok) {
    throw new ClientsApiError(
      getClientErrorMessage(
        body,
        "Unable to update client.",
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
// Activate client
// ============================================================================

export async function activateClient(
  id: string,
): Promise<Client> {
  return mutateClient(
    id,
    "activate",
  );
}

// ============================================================================
// Suspend client
// ============================================================================

export async function suspendClient(
  id: string,
): Promise<Client> {
  return mutateClient(
    id,
    "suspend",
  );
}

// ============================================================================
// Disable client
// ============================================================================

export async function disableClient(
  id: string,
): Promise<Client> {
  return mutateClient(
    id,
    "disable",
  );
}

// ============================================================================
// Client mutation helper
// ============================================================================

async function mutateClient(
  id: string,
  action:
    | "activate"
    | "suspend"
    | "disable",
): Promise<Client> {
  const response =
    await fetch(
      `${getApiBaseUrl()}/clients/${encodeURIComponent(
        id,
      )}/${action}`,
      {
        method: "POST",

        credentials:
          "include",

        cache:
          "no-store",
      },
    );

  const body =
    (await response
      .json()
      .catch(
        () => null,
      )) as unknown;

  // --------------------------------------------------------------------------
  // API error
  // --------------------------------------------------------------------------

  if (!response.ok) {
    throw new ClientsApiError(
      getClientErrorMessage(
        body,
        `Unable to ${action} client.`,
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