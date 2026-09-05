import { getControlPlaneUrl } from "@/lib/control-plane";
import {
  NextRequest,
  NextResponse,
} from "next/server";

interface RouteContext {
  params: Promise<{
    id: string;
    keyId: string;
  }>;
}

async function forward(
  request: NextRequest,
  context: RouteContext,
) {
  const {
    id: clientId,
    keyId,
  } = await context.params;

  const targetUrl =
    `${getControlPlaneUrl()}/api/clients/${encodeURIComponent(
      clientId,
    )}/api-keys/${encodeURIComponent(
      keyId,
    )}`;

  const session =
    request.cookies.get(
      "session",
    )?.value;

  const headers =
    new Headers();

  if (session) {
    headers.set(
      "Cookie",
      `session=${session}`,
    );
  }

  const response =
    await fetch(
      targetUrl,
      {
        method:
          request.method,
        headers,
        cache: "no-store",
      },
    );

  if (
    response.status ===
    204
  ) {
    return new NextResponse(
      null,
      {
        status: 204,
      },
    );
  }

  const body =
    await response.text();

  return new NextResponse(
    body,
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

export async function GET(
  request: NextRequest,
  context: RouteContext,
) {
  return forward(
    request,
    context,
  );
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext,
) {
  return forward(
    request,
    context,
  );
}