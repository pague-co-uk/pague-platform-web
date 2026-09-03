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

  const response = await fetch(
    `${getControlPlaneUrl()}/api/clients/${encodeURIComponent(
      id,
    )}/webhooks/${encodeURIComponent(webhookId)}`,
    {
      method: "GET",
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
      cache: "no-store",
    },
  );

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

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  const { id, webhookId } =
    await context.params;

  const body = await request.text();

  const response = await fetch(
    `${getControlPlaneUrl()}/api/clients/${encodeURIComponent(
      id,
    )}/webhooks/${encodeURIComponent(webhookId)}`,
    {
      method: "PATCH",
      headers: {
        "content-type":
          request.headers.get("content-type") ??
          "application/json",
        cookie: request.headers.get("cookie") ?? "",
      },
      body,
      cache: "no-store",
    },
  );

  const responseBody =
    await response.text();

  return new NextResponse(
    responseBody,
    {
      status: response.status,
      headers: {
        "content-type":
          response.headers.get(
            "content-type",
          ) ?? "application/json",
      },
    },
  );
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext,
) {
  const { id, webhookId } =
    await context.params;

  const response = await fetch(
    `${getControlPlaneUrl()}/api/clients/${encodeURIComponent(
      id,
    )}/webhooks/${encodeURIComponent(webhookId)}`,
    {
      method: "DELETE",
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
      cache: "no-store",
    },
  );

  if (response.status === 204) {
    return new NextResponse(null, {
      status: 204,
    });
  }

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