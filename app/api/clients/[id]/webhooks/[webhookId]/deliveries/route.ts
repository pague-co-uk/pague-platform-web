import { NextRequest, NextResponse } from "next/server";

import { getControlPlaneUrl } from "@/lib/control-plane";

interface RouteContext {
  params: Promise<{
    id: string;
    webhookId: string;
  }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext,
) {
  const { id, webhookId } =
    await context.params;

  const searchParams =
    request.nextUrl.searchParams.toString();

  const url =
    `${getControlPlaneUrl()}/api/clients/${encodeURIComponent(
      id,
    )}/webhooks/${encodeURIComponent(
      webhookId,
    )}/deliveries${searchParams ? `?${searchParams}` : ""
    }`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      cookie: request.headers.get("cookie") ?? "",
    },
    cache: "no-store",
  });

  const body = await response.text();

  return new NextResponse(body, {
    status: response.status,
    headers: {
      "content-type":
        response.headers.get("content-type") ??
        "application/json",
    },
  });
}