import { NextRequest, NextResponse } from "next/server";

import { getControlPlaneUrl } from "@/lib/control-plane";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams.toString();

  const url = `${getControlPlaneUrl()}/api/routes${searchParams ? `?${searchParams}` : ""
    }`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      cookie: request.headers.get("cookie") ?? "",
    },
    cache: "no-store",
  });

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

export async function POST(request: NextRequest) {
  const body = await request.text();

  const response = await fetch(
    `${getControlPlaneUrl()}/api/routes`,
    {
      method: "POST",
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

  const responseBody = await response.text();

  return new NextResponse(responseBody, {
    status: response.status,
    headers: {
      "content-type":
        response.headers.get("content-type") ??
        "application/json",
    },
  });
}