import { NextRequest, NextResponse } from "next/server";

import {
  getControlPlaneUrl,
  getCookieHeader,
} from "@/lib/control-plane";

interface RouteContext {
  params: Promise<{
    id: string;
    senderId: string;
  }>;
}

export async function POST(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const cookieHeader = getCookieHeader(request);

  if (!cookieHeader) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized.",
      },
      { status: 401 },
    );
  }

  const { id, senderId } = await context.params;

  try {
    const response = await fetch(
      `${getControlPlaneUrl()}/api/clients/${encodeURIComponent(id)}/sender-ids/${encodeURIComponent(
        senderId,
      )}/disable`,
      {
        method: "POST",
        headers: {
          Cookie: cookieHeader,
          "User-Agent":
            request.headers.get("user-agent") ?? "",
        },
        cache: "no-store",
      },
    );

    const body = await response.text();

    return new NextResponse(body, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") ??
          "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to connect to the Control Plane API.",
      },
      { status: 502 },
    );
  }
}
