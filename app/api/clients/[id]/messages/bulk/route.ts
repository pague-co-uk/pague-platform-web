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
  const {
    id,
  } = await context.params;

  console.log(
    "[Bulk Proxy] Incoming request",
    {
      id,
      contentType:
        request.headers.get(
          "content-type",
        ),
      hasCookie:
        Boolean(
          request.headers.get(
            "cookie",
          ),
        ),
    },
  );

  const response =
    await fetch(
      `${getControlPlaneUrl()}/api/clients/${encodeURIComponent(
        id,
      )}/messages/bulk`,
      {
        method: "POST",
        headers: {
          Cookie:
            request.headers.get(
              "cookie",
            ) ?? "",

          "Content-Type":
            request.headers.get(
              "content-type",
            ) ?? "",
        },

        body:
          await request.arrayBuffer(),

        cache: "no-store",
      },
    );

  const responseBody =
    await response.text();

  console.log(
    "[Bulk Proxy] Control Plane response",
    {
      id,
      status:
        response.status,
      statusText:
        response.statusText,
      contentType:
        response.headers.get(
          "content-type",
        ),
      body:
        responseBody,
    },
  );

  return new NextResponse(
    responseBody,
    {
      status:
        response.status,

      headers: {
        "Content-Type":
          response.headers.get(
            "content-type",
          ) ??
          "application/json",
      },
    },
  );
}