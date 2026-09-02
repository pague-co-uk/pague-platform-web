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

export async function POST(
  request: NextRequest,
  context: RouteContext,
) {
  const { id } =
    await context.params;

  const headers = new Headers();

  const cookie =
    request.headers.get("cookie");

  if (cookie) {
    headers.set(
      "cookie",
      cookie,
    );
  }

  const response =
    await fetch(
      `${getControlPlaneUrl()}/api/connectors/${encodeURIComponent(id)}/enable`,
      {
        method: "POST",
        headers,
        cache: "no-store",
      },
    );

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