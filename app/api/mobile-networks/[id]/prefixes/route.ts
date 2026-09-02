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

async function proxy(
  request: NextRequest,
  context: RouteContext,
) {
  const { id } =
    await context.params;

  const url =
    `${getControlPlaneUrl()}/api/mobile-networks/${encodeURIComponent(id)}/prefixes${request.nextUrl.search}`;

  const response =
    await fetch(url, {
      method: request.method,
      headers: {
        cookie:
          request.headers.get("cookie") ?? "",
        ...(request.headers.get(
          "content-type",
        )
          ? {
            "content-type":
              request.headers.get(
                "content-type",
              )!,
          }
          : {}),
      },
      body:
        request.method === "GET" ||
          request.method === "HEAD"
          ? undefined
          : await request.text(),
      cache: "no-store",
    });

  const body =
    await response.arrayBuffer();

  return new NextResponse(
    body,
    {
      status:
        response.status,
      headers: {
        "content-type":
          response.headers.get(
            "content-type",
          ) ?? "application/json",
      },
    },
  );
}

export async function GET(
  request: NextRequest,
  context: RouteContext,
) {
  return proxy(
    request,
    context,
  );
}

export async function POST(
  request: NextRequest,
  context: RouteContext,
) {
  return proxy(
    request,
    context,
  );
}