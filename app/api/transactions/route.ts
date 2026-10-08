import { NextRequest, NextResponse } from "next/server";

import {
  getControlPlaneUrl,
  getCookieHeader,
} from "@/lib/control-plane";

export async function GET(
  request: NextRequest,
): Promise<NextResponse> {
  const searchParams =
    request.nextUrl.searchParams.toString();

  const url =
    `${getControlPlaneUrl()}/api/transactions` +
    (searchParams ? `?${searchParams}` : "");

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Cookie: getCookieHeader(request),
    },
    cache: "no-store",
  });

  const body = await response.text();

  return new NextResponse(body, {
    status: response.status,
    headers: {
      "Content-Type":
        response.headers.get("Content-Type") ??
        "application/json",
    },
  });
}