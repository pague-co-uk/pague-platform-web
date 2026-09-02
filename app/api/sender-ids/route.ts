import { NextRequest, NextResponse } from "next/server";

import {
  getControlPlaneUrl,
  getCookieHeader,
} from "@/lib/control-plane";

export async function GET(
  request: NextRequest,
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

  const search = request.nextUrl.search;

  try {
    const response = await fetch(
      `${getControlPlaneUrl()}/api/sender-ids${search}`,
      {
        method: "GET",
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

export async function POST(
  request: NextRequest,
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

  try {
    const body = await request.text();

    const response = await fetch(
      `${getControlPlaneUrl()}/api/sender-ids`,
      {
        method: "POST",
        headers: {
          Cookie: cookieHeader,
          "Content-Type":
            request.headers.get("content-type") ??
            "application/json",
          "User-Agent":
            request.headers.get("user-agent") ?? "",
        },
        body,
        cache: "no-store",
      },
    );

    const responseBody = await response.text();

    return new NextResponse(responseBody, {
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