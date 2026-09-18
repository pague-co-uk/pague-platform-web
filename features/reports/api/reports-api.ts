import type {
  FloatLedgerReportRow,
  MessageReportRow,
  RoutePerformanceReportRow,
} from "../types/report-types";

// ============================================================================
// API configuration
// ============================================================================

const API_BASE = "/api";

// ============================================================================
// Error
// ============================================================================

export class ReportsApiError extends Error {
  readonly status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);

    this.name = "ReportsApiError";
    this.status = status;
  }
}

// ============================================================================
// BFF response types
// ============================================================================

interface BffReportMeta {
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
  readonly totalPages: number;
}

interface BffReportResponse<T> {
  readonly items: readonly T[];
  readonly meta: BffReportMeta;
}

// ============================================================================
// Shared request helpers
// ============================================================================

function buildQuery(
  params: Record<
    string,
    string | number | undefined
  >,
): string {
  const searchParams =
    new URLSearchParams();

  for (
    const [key, value] of Object.entries(
      params,
    )
  ) {
    if (
      value !== undefined &&
      value !== ""
    ) {
      searchParams.set(
        key,
        String(value),
      );
    }
  }

  return searchParams.toString();
}

async function parseErrorResponse(
  response: Response,
): Promise<never> {
  const body =
    (await response
      .json()
      .catch(() => null)) as unknown;

  throw new ReportsApiError(
    getReportErrorMessage(
      body,
      "Unable to process report request.",
    ),
    response.status,
  );
}

// ============================================================================
// Messages
// ============================================================================

export interface FindMessageReportParams {
  readonly page?: number;
  readonly pageSize?: number;
  readonly search?: string;
  readonly destination?: string;
  readonly senderIdId?: string;
  readonly status?: string;
  readonly encoding?: string;
  readonly submittedFrom?: string;
  readonly submittedTo?: string;
  readonly clientId?: string;
}

export interface FindClientMessageReportParams {
  readonly page?: number;
  readonly pageSize?: number;
  readonly search?: string;
  readonly destination?: string;
  readonly senderIdId?: string;
  readonly status?: string;
  readonly encoding?: string;
  readonly submittedFrom?: string;
  readonly submittedTo?: string;
}

export interface FindMessageReportResult {
  readonly items: readonly MessageReportRow[];

  readonly meta: {
    readonly page: number;
    readonly pageSize: number;
    readonly total: number;
    readonly totalPages: number;
  };
}

// ============================================================================
// Platform message report
// ============================================================================

export async function findPlatformMessageReport(
  params: FindMessageReportParams = {},
): Promise<FindMessageReportResult> {
  const query =
    buildQuery({
      page:
        params.page ?? 1,

      pageSize:
        params.pageSize ?? 25,

      clientId:
        params.clientId,

      search:
        params.search,

      destination:
        params.destination,

      senderIdId:
        params.senderIdId,

      status:
        params.status,

      encoding:
        params.encoding,

      submittedFrom:
        params.submittedFrom,

      submittedTo:
        params.submittedTo,
    });

  const response =
    await fetch(
      `${API_BASE}/reports/messages?${query}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
    );

  const body =
    (await response
      .json()
      .catch(() => null)) as unknown;

  if (!response.ok) {
    throw new ReportsApiError(
      getReportErrorMessage(
        body,
        "Unable to load message report.",
      ),
      response.status,
    );
  }

  return parseReportResponse<MessageReportRow>(
    body,
    response.status,
    "message report",
  );
}

// ============================================================================
// Client message report
// ============================================================================

export async function findClientMessageReport(
  clientId: string,
  params: FindClientMessageReportParams = {},
): Promise<FindMessageReportResult> {
  const query =
    buildQuery({
      page:
        params.page ?? 1,

      pageSize:
        params.pageSize ?? 25,

      search:
        params.search,

      destination:
        params.destination,

      senderIdId:
        params.senderIdId,

      status:
        params.status,

      encoding:
        params.encoding,

      submittedFrom:
        params.submittedFrom,

      submittedTo:
        params.submittedTo,
    });

  const response =
    await fetch(
      `${API_BASE}/clients/${encodeURIComponent(
        clientId,
      )}/reports/messages?${query}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
    );

  const body =
    (await response
      .json()
      .catch(() => null)) as unknown;

  if (!response.ok) {
    throw new ReportsApiError(
      getReportErrorMessage(
        body,
        "Unable to load message report.",
      ),
      response.status,
    );
  }

  return parseReportResponse<MessageReportRow>(
    body,
    response.status,
    "message report",
  );
}

// ============================================================================
// Export platform message report
// ============================================================================

export async function exportPlatformMessageReport(
  params: FindMessageReportParams = {},
): Promise<Blob> {
  const query =
    buildQuery({
      clientId:
        params.clientId,

      search:
        params.search,

      destination:
        params.destination,

      senderIdId:
        params.senderIdId,

      status:
        params.status,

      encoding:
        params.encoding,

      submittedFrom:
        params.submittedFrom,

      submittedTo:
        params.submittedTo,
    });

  const response =
    await fetch(
      `${API_BASE}/reports/messages/export${query
        ? `?${query}`
        : ""
      }`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
    );

  if (!response.ok) {
    await parseErrorResponse(
      response,
    );
  }

  return response.blob();
}

// ============================================================================
// Export client message report
// ============================================================================

export async function exportClientMessageReport(
  clientId: string,
  params: FindClientMessageReportParams = {},
): Promise<Blob> {
  const query =
    buildQuery({
      search:
        params.search,

      destination:
        params.destination,

      senderIdId:
        params.senderIdId,

      status:
        params.status,

      encoding:
        params.encoding,

      submittedFrom:
        params.submittedFrom,

      submittedTo:
        params.submittedTo,
    });

  const response =
    await fetch(
      `${API_BASE}/clients/${encodeURIComponent(
        clientId,
      )}/reports/messages/export${query
        ? `?${query}`
        : ""
      }`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
    );

  if (!response.ok) {
    await parseErrorResponse(
      response,
    );
  }

  return response.blob();
}

// ============================================================================
// Route performance
// ============================================================================

export interface FindRoutePerformanceReportParams {
  readonly page?: number;
  readonly pageSize?: number;
  readonly from?: string;
  readonly to?: string;
  readonly routeId?: string;
  readonly connectorId?: string;
  readonly status?: string;
  readonly clientId?: string;
}

export interface FindClientRoutePerformanceReportParams {
  readonly page?: number;
  readonly pageSize?: number;
  readonly from?: string;
  readonly to?: string;
  readonly routeId?: string;
  readonly connectorId?: string;
  readonly status?: string;
}

export interface FindRoutePerformanceReportResult {
  readonly items: readonly RoutePerformanceReportRow[];

  readonly meta: {
    readonly page: number;
    readonly pageSize: number;
    readonly total: number;
    readonly totalPages: number;
  };
}

// ============================================================================
// Platform route performance report
// ============================================================================

export async function findPlatformRoutePerformanceReport(
  params: FindRoutePerformanceReportParams = {},
): Promise<FindRoutePerformanceReportResult> {
  const query =
    buildQuery({
      page:
        params.page ?? 1,

      pageSize:
        params.pageSize ?? 25,

      clientId:
        params.clientId,

      from:
        params.from,

      to:
        params.to,

      routeId:
        params.routeId,

      connectorId:
        params.connectorId,

      status:
        params.status,
    });

  const response =
    await fetch(
      `${API_BASE}/reports/routes?${query}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
    );

  const body =
    (await response
      .json()
      .catch(() => null)) as unknown;

  if (!response.ok) {
    throw new ReportsApiError(
      getReportErrorMessage(
        body,
        "Unable to load route performance report.",
      ),
      response.status,
    );
  }

  return parseReportResponse<RoutePerformanceReportRow>(
    body,
    response.status,
    "route performance report",
  );
}

// ============================================================================
// Client route performance report
// ============================================================================

export async function findClientRoutePerformanceReport(
  clientId: string,
  params: FindClientRoutePerformanceReportParams = {},
): Promise<FindRoutePerformanceReportResult> {
  const query =
    buildQuery({
      page:
        params.page ?? 1,

      pageSize:
        params.pageSize ?? 25,

      from:
        params.from,

      to:
        params.to,

      routeId:
        params.routeId,

      connectorId:
        params.connectorId,

      status:
        params.status,
    });

  const response =
    await fetch(
      `${API_BASE}/clients/${encodeURIComponent(
        clientId,
      )}/reports/routes?${query}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
    );

  const body =
    (await response
      .json()
      .catch(() => null)) as unknown;

  if (!response.ok) {
    throw new ReportsApiError(
      getReportErrorMessage(
        body,
        "Unable to load route performance report.",
      ),
      response.status,
    );
  }

  return parseReportResponse<RoutePerformanceReportRow>(
    body,
    response.status,
    "route performance report",
  );
}

// ============================================================================
// Export platform route performance report
// ============================================================================

export async function exportPlatformRoutePerformanceReport(
  params: FindRoutePerformanceReportParams = {},
): Promise<Blob> {
  const query =
    buildQuery({
      clientId:
        params.clientId,

      from:
        params.from,

      to:
        params.to,

      routeId:
        params.routeId,

      connectorId:
        params.connectorId,

      status:
        params.status,
    });

  const response =
    await fetch(
      `${API_BASE}/reports/routes/export${query
        ? `?${query}`
        : ""
      }`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
    );

  if (!response.ok) {
    await parseErrorResponse(
      response,
    );
  }

  return response.blob();
}

// ============================================================================
// Export client route performance report
// ============================================================================

export async function exportClientRoutePerformanceReport(
  clientId: string,
  params: FindClientRoutePerformanceReportParams = {},
): Promise<Blob> {
  const query =
    buildQuery({
      from:
        params.from,

      to:
        params.to,

      routeId:
        params.routeId,

      connectorId:
        params.connectorId,

      status:
        params.status,
    });

  const response =
    await fetch(
      `${API_BASE}/clients/${encodeURIComponent(
        clientId,
      )}/reports/routes/export${query
        ? `?${query}`
        : ""
      }`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
    );

  if (!response.ok) {
    await parseErrorResponse(
      response,
    );
  }

  return response.blob();
}

// ============================================================================
// Float ledger
// ============================================================================

export interface FindFloatLedgerReportParams {
  readonly page?: number;
  readonly pageSize?: number;
  readonly from?: string;
  readonly to?: string;
  readonly transactionType?: string;
  readonly referenceType?: string;
  readonly clientId?: string;
}

export interface FindClientFloatLedgerReportParams {
  readonly page?: number;
  readonly pageSize?: number;
  readonly from?: string;
  readonly to?: string;
  readonly transactionType?: string;
  readonly referenceType?: string;
}

export interface FindFloatLedgerReportResult {
  readonly items: readonly FloatLedgerReportRow[];

  readonly meta: {
    readonly page: number;
    readonly pageSize: number;
    readonly total: number;
    readonly totalPages: number;
  };
}

// ============================================================================
// Platform float ledger report
// ============================================================================

export async function findPlatformFloatLedgerReport(
  params: FindFloatLedgerReportParams = {},
): Promise<FindFloatLedgerReportResult> {
  const query =
    buildQuery({
      page:
        params.page ?? 1,

      pageSize:
        params.pageSize ?? 25,

      clientId:
        params.clientId,

      from:
        params.from,

      to:
        params.to,

      transactionType:
        params.transactionType,

      referenceType:
        params.referenceType,
    });

  const response =
    await fetch(
      `${API_BASE}/reports/float?${query}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
    );

  const body =
    (await response
      .json()
      .catch(() => null)) as unknown;

  if (!response.ok) {
    throw new ReportsApiError(
      getReportErrorMessage(
        body,
        "Unable to load float ledger report.",
      ),
      response.status,
    );
  }

  return parseReportResponse<FloatLedgerReportRow>(
    body,
    response.status,
    "float ledger report",
  );
}

// ============================================================================
// Client float ledger report
// ============================================================================

export async function findClientFloatLedgerReport(
  clientId: string,
  params: FindClientFloatLedgerReportParams = {},
): Promise<FindFloatLedgerReportResult> {
  const query =
    buildQuery({
      page:
        params.page ?? 1,

      pageSize:
        params.pageSize ?? 25,

      from:
        params.from,

      to:
        params.to,

      transactionType:
        params.transactionType,

      referenceType:
        params.referenceType,
    });

  const response =
    await fetch(
      `${API_BASE}/clients/${encodeURIComponent(
        clientId,
      )}/reports/float?${query}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
    );

  const body =
    (await response
      .json()
      .catch(() => null)) as unknown;

  if (!response.ok) {
    throw new ReportsApiError(
      getReportErrorMessage(
        body,
        "Unable to load float ledger report.",
      ),
      response.status,
    );
  }

  return parseReportResponse<FloatLedgerReportRow>(
    body,
    response.status,
    "float ledger report",
  );
}

// ============================================================================
// Export platform float ledger report
// ============================================================================

export async function exportPlatformFloatLedgerReport(
  params: FindFloatLedgerReportParams = {},
): Promise<Blob> {
  const query =
    buildQuery({
      clientId:
        params.clientId,

      from:
        params.from,

      to:
        params.to,

      transactionType:
        params.transactionType,

      referenceType:
        params.referenceType,
    });

  const response =
    await fetch(
      `${API_BASE}/reports/float/export${query
        ? `?${query}`
        : ""
      }`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
    );

  if (!response.ok) {
    await parseErrorResponse(
      response,
    );
  }

  return response.blob();
}

// ============================================================================
// Export client float ledger report
// ============================================================================

export async function exportClientFloatLedgerReport(
  clientId: string,
  params: FindClientFloatLedgerReportParams = {},
): Promise<Blob> {
  const query =
    buildQuery({
      from:
        params.from,

      to:
        params.to,

      transactionType:
        params.transactionType,

      referenceType:
        params.referenceType,
    });

  const response =
    await fetch(
      `${API_BASE}/clients/${encodeURIComponent(
        clientId,
      )}/reports/float/export${query
        ? `?${query}`
        : ""
      }`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
    );

  if (!response.ok) {
    await parseErrorResponse(
      response,
    );
  }

  return response.blob();
}

// ============================================================================
// Response parsing
// ============================================================================

function parseReportResponse<T>(
  body: unknown,
  status: number,
  resource: string,
): BffReportResponse<T> {
  if (
    typeof body !== "object" ||
    body === null ||
    !("items" in body) ||
    !Array.isArray(body.items) ||
    !("meta" in body) ||
    typeof body.meta !== "object" ||
    body.meta === null
  ) {
    throw new ReportsApiError(
      `Invalid ${resource} response.`,
      status,
    );
  }

  const meta =
    body.meta;

  if (
    !("page" in meta) ||
    !("pageSize" in meta) ||
    !("total" in meta) ||
    !("totalPages" in meta)
  ) {
    throw new ReportsApiError(
      `Invalid ${resource} pagination response.`,
      status,
    );
  }

  const page =
    Number(meta.page);

  const pageSize =
    Number(meta.pageSize);

  const total =
    Number(meta.total);

  const totalPages =
    Number(meta.totalPages);

  if (
    !Number.isFinite(page) ||
    !Number.isFinite(pageSize) ||
    !Number.isFinite(total) ||
    !Number.isFinite(totalPages)
  ) {
    throw new ReportsApiError(
      `Invalid ${resource} pagination values.`,
      status,
    );
  }

  return {
    items:
      body.items as readonly T[],

    meta: {
      page,
      pageSize,
      total,
      totalPages,
    },
  };
}

// ============================================================================
// Error extraction
// ============================================================================

function getReportErrorMessage(
  data: unknown,
  fallback: string,
): string {
  if (
    typeof data !== "object" ||
    data === null
  ) {
    return fallback;
  }

  if (
    "error" in data &&
    typeof data.error === "object" &&
    data.error !== null &&
    "message" in data.error &&
    typeof data.error.message === "string" &&
    data.error.message.trim()
  ) {
    return data.error.message;
  }

  if (
    "message" in data &&
    typeof data.message === "string" &&
    data.message.trim()
  ) {
    return data.message;
  }

  return fallback;
}