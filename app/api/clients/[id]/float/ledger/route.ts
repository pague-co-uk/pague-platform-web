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

export async function GET(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const {
    id: clientId,
  } = await context.params;

  const targetUrl =
    `${getControlPlaneUrl()}/api/clients/${encodeURIComponent(
      clientId,
    )}/float/ledger${request.nextUrl.search
    }`;

  const session =
    request.cookies.get("session")?.value;

  const headers = new Headers();

  if (session) {
    headers.set(
      "Cookie",
      `session=${session}`,
    );
  }

  const response = await fetch(
    targetUrl,
    {
      method: "GET",
      headers,
      cache: "no-store",
    },
  );

  const body =
    await response.text();

  return new NextResponse(
    body,
    {
      status: response.status,
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