import { getControlPlaneUrl } from "@/lib/control-plane";
import {
  NextRequest,
  NextResponse,
} from "next/server";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

// ============================================================================
// GET /api/clients/:id/api-keys
// ============================================================================

export async function GET(
  request: NextRequest,
  context: RouteContext,
) {
  const {
    id: clientId,
  } = await context.params;

  const targetUrl =
    new URL(
      `${getControlPlaneUrl()}/api/clients/${encodeURIComponent(
        clientId,
      )}/api-keys`,
    );

  request.nextUrl.searchParams.forEach(
    (value, key) => {
      targetUrl.searchParams.set(
        key,
        value,
      );
    },
  );

  return forwardRequest(
    request,
    targetUrl,
    "GET",
  );
}

// ============================================================================
// POST /api/clients/:id/api-keys
// ============================================================================

export async function POST(
  request: NextRequest,
  context: RouteContext,
) {
  const {
    id: clientId,
  } = await context.params;

  const targetUrl =
    `${getControlPlaneUrl()}/api/clients/${encodeURIComponent(
      clientId,
    )}/api-keys`;

  const body =
    await request.text();

  return forwardRequest(
    request,
    targetUrl,
    "POST",
    body,
  );
}

// ============================================================================
// Forward request
// ============================================================================

async function forwardRequest(
  request: NextRequest,
  targetUrl: URL | string,
  method: "GET" | "POST",
  body?: string,
) {
  const headers =
    new Headers();

  const session =
    request.cookies.get(
      "session",
    )?.value;

  if (session) {
    headers.set(
      "Cookie",
      `session=${session}`,
    );
  }

  const contentType =
    request.headers.get(
      "content-type",
    );

  if (contentType) {
    headers.set(
      "Content-Type",
      contentType,
    );
  }

  const response =
    await fetch(
      targetUrl,
      {
        method,
        headers,
        body:
          method === "POST"
            ? body
            : undefined,
        cache: "no-store",
      },
    );

  const responseBody =
    await response.text();

  return new NextResponse(
    responseBody,
    {
      status:
        response.status,
      headers: {
        "content-type":
          response.headers.get(
            "content-type",
          ) ??
          "application/json",
      },
    },
  );
}