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

export async function POST(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const {
    id: clientId,
  } = await context.params;

  const targetUrl =
    `${getControlPlaneUrl()}/api/clients/${encodeURIComponent(
      clientId,
    )}/float/refund`;

  const session =
    request.cookies.get("session")?.value;

  const headers = new Headers();

  if (session) {
    headers.set(
      "Cookie",
      `session=${session}`,
    );
  }

  headers.set(
    "Content-Type",
    "application/json",
  );

  const body =
    await request.text();

  const response = await fetch(
    targetUrl,
    {
      method: "POST",
      headers,
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
          ) ??
          "application/json",
      },
    },
  );
}