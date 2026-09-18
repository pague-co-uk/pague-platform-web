import {
  cookies,
} from "next/headers";

import type {
  FindClientFloatLedgerReportParams,
  FindClientMessageReportParams,
  FindClientRoutePerformanceReportParams,
  FindFloatLedgerReportParams,
  FindFloatLedgerReportResult,
  FindMessageReportParams,
  FindMessageReportResult,
  FindRoutePerformanceReportParams,
  FindRoutePerformanceReportResult,
} from "./reports-api";


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
// Authentication
// ============================================================================

async function getSessionCookie(): Promise<{
  readonly name: string;
  readonly value: string;
}> {
  const cookieStore =
    await cookies();

  const session =
    cookieStore.get("session");

  if (!session) {
    throw new ReportsApiError(
      "Authentication required.",
      401,
    );
  }

  return {
    name: session.name,
    value: session.value,
  };
}

// ============================================================================
// Platform message report
// ============================================================================

export async function findPlatformMessageReport(
  options: FindMessageReportParams = {},
): Promise<FindMessageReportResult> {
  const session =
    await getSessionCookie();

  const params =
    new URLSearchParams();

  params.set(
    "page",
    String(options.page ?? 1),
  );

  params.set(
    "pageSize",
    String(options.pageSize ?? 25),
  );

  if (options.search) {
    params.set(
      "search",
      options.search,
    );
  }

  if (options.destination) {
    params.set(
      "destination",
      options.destination,
    );
  }

  if (options.senderIdId) {
    params.set(
      "senderIdId",
      options.senderIdId,
    );
  }

  if (options.status) {
    params.set(
      "status",
      options.status,
    );
  }

  if (options.encoding) {
    params.set(
      "encoding",
      options.encoding,
    );
  }

  if (options.submittedFrom) {
    params.set(
      "submittedFrom",
      options.submittedFrom,
    );
  }

  if (options.submittedTo) {
    params.set(
      "submittedTo",
      options.submittedTo,
    );
  }

  if (options.clientId) {
    params.set(
      "clientId",
      options.clientId,
    );
  }

  const body =
    await fetchReport(
      `/api/reports/messages?${params.toString()}`,
      session,
      "message report",
    );

  return parseCollectionResponse<
    FindMessageReportResult["items"][number]
  >(
    body,
    "message report",
  );
}

// ============================================================================
// Client message report
// ============================================================================

export async function findClientMessageReport(
  clientId: string,
  options: FindClientMessageReportParams = {},
): Promise<FindMessageReportResult> {
  const session =
    await getSessionCookie();

  const params =
    new URLSearchParams();

  params.set(
    "page",
    String(options.page ?? 1),
  );

  params.set(
    "pageSize",
    String(options.pageSize ?? 25),
  );

  if (options.search) {
    params.set(
      "search",
      options.search,
    );
  }

  if (options.destination) {
    params.set(
      "destination",
      options.destination,
    );
  }

  if (options.senderIdId) {
    params.set(
      "senderIdId",
      options.senderIdId,
    );
  }

  if (options.status) {
    params.set(
      "status",
      options.status,
    );
  }

  if (options.encoding) {
    params.set(
      "encoding",
      options.encoding,
    );
  }

  if (options.submittedFrom) {
    params.set(
      "submittedFrom",
      options.submittedFrom,
    );
  }

  if (options.submittedTo) {
    params.set(
      "submittedTo",
      options.submittedTo,
    );
  }

  const body =
    await fetchReport(
      `/api/clients/${encodeURIComponent(clientId)}/reports/messages?${params.toString()}`,
      session,
      "message report",
    );

  return parseCollectionResponse<
    FindMessageReportResult["items"][number]
  >(
    body,
    "message report",
  );
}

// ============================================================================
// Platform route performance report
// ============================================================================

export async function findPlatformRoutePerformanceReport(
  options: FindRoutePerformanceReportParams = {},
): Promise<FindRoutePerformanceReportResult> {
  const session =
    await getSessionCookie();

  const params =
    new URLSearchParams();

  params.set(
    "page",
    String(options.page ?? 1),
  );

  params.set(
    "pageSize",
    String(options.pageSize ?? 25),
  );

  if (options.from) {
    params.set(
      "from",
      options.from,
    );
  }

  if (options.to) {
    params.set(
      "to",
      options.to,
    );
  }

  if (options.routeId) {
    params.set(
      "routeId",
      options.routeId,
    );
  }

  if (options.connectorId) {
    params.set(
      "connectorId",
      options.connectorId,
    );
  }

  if (options.status) {
    params.set(
      "status",
      options.status,
    );
  }

  if (options.clientId) {
    params.set(
      "clientId",
      options.clientId,
    );
  }

  const body =
    await fetchReport(
      `/api/reports/routes?${params.toString()}`,
      session,
      "route performance report",
    );

  return parseCollectionResponse<
    FindRoutePerformanceReportResult["items"][number]
  >(
    body,
    "route performance report",
  );
}

// ============================================================================
// Client route performance report
// ============================================================================

export async function findClientRoutePerformanceReport(
  clientId: string,
  options: FindClientRoutePerformanceReportParams = {},
): Promise<FindRoutePerformanceReportResult> {
  const session =
    await getSessionCookie();

  const params =
    new URLSearchParams();

  params.set(
    "page",
    String(options.page ?? 1),
  );

  params.set(
    "pageSize",
    String(options.pageSize ?? 25),
  );

  if (options.from) {
    params.set(
      "from",
      options.from,
    );
  }

  if (options.to) {
    params.set(
      "to",
      options.to,
    );
  }

  if (options.routeId) {
    params.set(
      "routeId",
      options.routeId,
    );
  }

  if (options.connectorId) {
    params.set(
      "connectorId",
      options.connectorId,
    );
  }

  if (options.status) {
    params.set(
      "status",
      options.status,
    );
  }

  const body =
    await fetchReport(
      `/api/clients/${encodeURIComponent(clientId)}/reports/routes?${params.toString()}`,
      session,
      "route performance report",
    );

  return parseCollectionResponse<
    FindRoutePerformanceReportResult["items"][number]
  >(
    body,
    "route performance report",
  );
}

// ============================================================================
// Platform float ledger report
// ============================================================================

export async function findPlatformFloatLedgerReport(
  options: FindFloatLedgerReportParams = {},
): Promise<FindFloatLedgerReportResult> {
  const session =
    await getSessionCookie();

  const params =
    new URLSearchParams();

  params.set(
    "page",
    String(options.page ?? 1),
  );

  params.set(
    "pageSize",
    String(options.pageSize ?? 25),
  );

  if (options.from) {
    params.set(
      "from",
      options.from,
    );
  }

  if (options.to) {
    params.set(
      "to",
      options.to,
    );
  }

  if (options.transactionType) {
    params.set(
      "transactionType",
      options.transactionType,
    );
  }

  if (options.referenceType) {
    params.set(
      "referenceType",
      options.referenceType,
    );
  }

  if (options.clientId) {
    params.set(
      "clientId",
      options.clientId,
    );
  }

  const body =
    await fetchReport(
      `/api/reports/float?${params.toString()}`,
      session,
      "float ledger report",
    );

  return parseCollectionResponse<
    FindFloatLedgerReportResult["items"][number]
  >(
    body,
    "float ledger report",
  );
}

// ============================================================================
// Client float ledger report
// ============================================================================

export async function findClientFloatLedgerReport(
  clientId: string,
  options: FindClientFloatLedgerReportParams = {},
): Promise<FindFloatLedgerReportResult> {
  const session =
    await getSessionCookie();

  const params =
    new URLSearchParams();

  params.set(
    "page",
    String(options.page ?? 1),
  );

  params.set(
    "pageSize",
    String(options.pageSize ?? 25),
  );

  if (options.from) {
    params.set(
      "from",
      options.from,
    );
  }

  if (options.to) {
    params.set(
      "to",
      options.to,
    );
  }

  if (options.transactionType) {
    params.set(
      "transactionType",
      options.transactionType,
    );
  }

  if (options.referenceType) {
    params.set(
      "referenceType",
      options.referenceType,
    );
  }

  const body =
    await fetchReport(
      `/api/clients/${encodeURIComponent(clientId)}/reports/float?${params.toString()}`,
      session,
      "float ledger report",
    );

  return parseCollectionResponse<
    FindFloatLedgerReportResult["items"][number]
  >(
    body,
    "float ledger report",
  );
}

// ============================================================================
// Export platform message report
// ============================================================================

export async function exportPlatformMessageReport(
  options: FindMessageReportParams = {},
): Promise<Buffer> {
  const session =
    await getSessionCookie();

  const params =
    new URLSearchParams();

  if (options.search) {
    params.set(
      "search",
      options.search,
    );
  }

  if (options.destination) {
    params.set(
      "destination",
      options.destination,
    );
  }

  if (options.senderIdId) {
    params.set(
      "senderIdId",
      options.senderIdId,
    );
  }

  if (options.status) {
    params.set(
      "status",
      options.status,
    );
  }

  if (options.encoding) {
    params.set(
      "encoding",
      options.encoding,
    );
  }

  if (options.submittedFrom) {
    params.set(
      "submittedFrom",
      options.submittedFrom,
    );
  }

  if (options.submittedTo) {
    params.set(
      "submittedTo",
      options.submittedTo,
    );
  }

  if (options.clientId) {
    params.set(
      "clientId",
      options.clientId,
    );
  }

  return downloadReport(
    `/api/reports/messages/export?${params.toString()}`,
    session,
    "message report",
  );
}

// ============================================================================
// Export client message report
// ============================================================================

export async function exportClientMessageReport(
  clientId: string,
  options: FindClientMessageReportParams = {},
): Promise<Buffer> {
  const session =
    await getSessionCookie();

  const params =
    new URLSearchParams();

  if (options.search) {
    params.set(
      "search",
      options.search,
    );
  }

  if (options.destination) {
    params.set(
      "destination",
      options.destination,
    );
  }

  if (options.senderIdId) {
    params.set(
      "senderIdId",
      options.senderIdId,
    );
  }

  if (options.status) {
    params.set(
      "status",
      options.status,
    );
  }

  if (options.encoding) {
    params.set(
      "encoding",
      options.encoding,
    );
  }

  if (options.submittedFrom) {
    params.set(
      "submittedFrom",
      options.submittedFrom,
    );
  }

  if (options.submittedTo) {
    params.set(
      "submittedTo",
      options.submittedTo,
    );
  }

  return downloadReport(
    `/api/clients/${encodeURIComponent(clientId)}/reports/messages/export?${params.toString()}`,
    session,
    "message report",
  );
}

// ============================================================================
// Export platform route performance report
// ============================================================================

export async function exportPlatformRoutePerformanceReport(
  options: FindRoutePerformanceReportParams = {},
): Promise<Buffer> {
  const session =
    await getSessionCookie();

  const params =
    new URLSearchParams();

  if (options.from) {
    params.set(
      "from",
      options.from,
    );
  }

  if (options.to) {
    params.set(
      "to",
      options.to,
    );
  }

  if (options.routeId) {
    params.set(
      "routeId",
      options.routeId,
    );
  }

  if (options.connectorId) {
    params.set(
      "connectorId",
      options.connectorId,
    );
  }

  if (options.status) {
    params.set(
      "status",
      options.status,
    );
  }

  if (options.clientId) {
    params.set(
      "clientId",
      options.clientId,
    );
  }

  return downloadReport(
    `/api/reports/routes/export?${params.toString()}`,
    session,
    "route performance report",
  );
}

// ============================================================================
// Export client route performance report
// ============================================================================

export async function exportClientRoutePerformanceReport(
  clientId: string,
  options: FindClientRoutePerformanceReportParams = {},
): Promise<Buffer> {
  const session =
    await getSessionCookie();

  const params =
    new URLSearchParams();

  if (options.from) {
    params.set(
      "from",
      options.from,
    );
  }

  if (options.to) {
    params.set(
      "to",
      options.to,
    );
  }

  if (options.routeId) {
    params.set(
      "routeId",
      options.routeId,
    );
  }

  if (options.connectorId) {
    params.set(
      "connectorId",
      options.connectorId,
    );
  }

  if (options.status) {
    params.set(
      "status",
      options.status,
    );
  }

  return downloadReport(
    `/api/clients/${encodeURIComponent(clientId)}/reports/routes/export?${params.toString()}`,
    session,
    "route performance report",
  );
}

// ============================================================================
// Export platform float ledger report
// ============================================================================

export async function exportPlatformFloatLedgerReport(
  options: FindFloatLedgerReportParams = {},
): Promise<Buffer> {
  const session =
    await getSessionCookie();

  const params =
    new URLSearchParams();

  if (options.from) {
    params.set(
      "from",
      options.from,
    );
  }

  if (options.to) {
    params.set(
      "to",
      options.to,
    );
  }

  if (options.transactionType) {
    params.set(
      "transactionType",
      options.transactionType,
    );
  }

  if (options.referenceType) {
    params.set(
      "referenceType",
      options.referenceType,
    );
  }

  if (options.clientId) {
    params.set(
      "clientId",
      options.clientId,
    );
  }

  return downloadReport(
    `/api/reports/float/export?${params.toString()}`,
    session,
    "float ledger report",
  );
}

// ============================================================================
// Export client float ledger report
// ============================================================================

export async function exportClientFloatLedgerReport(
  clientId: string,
  options: FindClientFloatLedgerReportParams = {},
): Promise<Buffer> {
  const session =
    await getSessionCookie();

  const params =
    new URLSearchParams();

  if (options.from) {
    params.set(
      "from",
      options.from,
    );
  }

  if (options.to) {
    params.set(
      "to",
      options.to,
    );
  }

  if (options.transactionType) {
    params.set(
      "transactionType",
      options.transactionType,
    );
  }

  if (options.referenceType) {
    params.set(
      "referenceType",
      options.referenceType,
    );
  }

  return downloadReport(
    `/api/clients/${encodeURIComponent(clientId)}/reports/float/export?${params.toString()}`,
    session,
    "float ledger report",
  );
}

// ============================================================================
// Request helpers
// ============================================================================

async function fetchReport(
  path: string,
  session: {
    readonly name: string;
    readonly value: string;
  },
  resource: string,
): Promise<unknown> {
  let response: Response;

  try {
    response =
      await fetch(
        `${getControlPlaneUrl()}${path}`,
        {
          method: "GET",
          headers: {
            Cookie:
              `${session.name}=${session.value}`,
          },
          cache: "no-store",
        },
      );
  } catch (error) {
    console.error(
      `[Reports] Failed to connect to Control Plane while loading ${resource}.`,
      error,
    );

    throw new ReportsApiError(
      `Unable to connect to the ${resource} service.`,
      502,
    );
  }

  const text =
    await response.text();

  let body: unknown = null;

  if (text) {
    try {
      body =
        JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    throw new ReportsApiError(
      getReportErrorMessage(
        body,
        `Unable to load ${resource}.`,
      ),
      response.status,
    );
  }

  return body;
}

async function downloadReport(
  path: string,
  session: {
    readonly name: string;
    readonly value: string;
  },
  resource: string,
): Promise<Buffer> {
  let response: Response;

  try {
    response =
      await fetch(
        `${getControlPlaneUrl()}${path}`,
        {
          method: "GET",
          headers: {
            Cookie:
              `${session.name}=${session.value}`,
          },
          cache: "no-store",
        },
      );
  } catch (error) {
    console.error(
      `[Reports] Failed to connect to Control Plane while exporting ${resource}.`,
      error,
    );

    throw new ReportsApiError(
      `Unable to connect to the ${resource} service.`,
      502,
    );
  }

  if (!response.ok) {
    const text =
      await response.text();

    let body: unknown = null;

    if (text) {
      try {
        body =
          JSON.parse(text);
      } catch {
        body = text;
      }
    }

    throw new ReportsApiError(
      getReportErrorMessage(
        body,
        `Unable to export ${resource}.`,
      ),
      response.status,
    );
  }

  const arrayBuffer =
    await response.arrayBuffer();

  return Buffer.from(
    arrayBuffer,
  );
}

// ============================================================================
// Response parsing
// ============================================================================

function parseCollectionResponse<T>(
  body: unknown,
  resource: string,
): {
  readonly items: readonly T[];
  readonly meta: {
    readonly page: number;
    readonly pageSize: number;
    readonly total: number;
    readonly totalPages: number;
  };
} {
  if (
    typeof body !== "object" ||
    body === null ||
    !("success" in body) ||
    body.success !== true ||
    !("data" in body) ||
    !Array.isArray(body.data) ||
    !("pagination" in body) ||
    typeof body.pagination !== "object" ||
    body.pagination === null
  ) {
    throw new ReportsApiError(
      `Invalid ${resource} response.`,
      502,
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
    throw new ReportsApiError(
      `Invalid ${resource} pagination response.`,
      502,
    );
  }

  return {
    items:
      body.data as readonly T[],

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