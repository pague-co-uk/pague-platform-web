import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getControlPlaneUrl,
} from "@/lib/control-plane";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

async function proxyRequest(
  request: NextRequest,
  context: RouteContext,
  method: "GET" | "PUT" | "DELETE",
) {
  const { id } =
    await context.params;

  const url =
    `${getControlPlaneUrl()}/api/connectors/${encodeURIComponent(id)}`;

  const headers = new Headers();

  const cookie =
    request.headers.get("cookie");

  if (cookie) {
    headers.set(
      "cookie",
      cookie,
    );
  }

  if (
    method === "PUT"
  ) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

  const response =
    await fetch(url, {
      method,
      headers,
      body:
        method === "PUT"
          ? await request.text()
          : undefined,
      cache: "no-store",
    });

  const responseHeaders =
    new Headers();

  const contentType =
    response.headers.get(
      "content-type",
    );

  if (contentType) {
    responseHeaders.set(
      "content-type",
      contentType,
    );
  }

  return new NextResponse(
    response.body,
    {
      status: response.status,
      statusText:
        response.statusText,
      headers:
        responseHeaders,
    },
  );
}

export async function GET(
  request: NextRequest,
  context: RouteContext,
) {
  return proxyRequest(
    request,
    context,
    "GET",
  );
}

export async function PUT(
  request: NextRequest,
  context: RouteContext,
) {
  return proxyRequest(
    request,
    context,
    "PUT",
  );
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext,
) {
  return proxyRequest(
    request,
    context,
    "DELETE",
  );
}