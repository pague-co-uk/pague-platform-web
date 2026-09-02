import { NextRequest, NextResponse } from "next/server";

import { getControlPlaneUrl } from "@/lib/control-plane";

async function proxyRequest(
  request: NextRequest,
  method: "GET" | "POST",
) {
  const url =
    `${getControlPlaneUrl()}/api/connectors${request.nextUrl.search}`;

  const headers = new Headers();

  const cookie =
    request.headers.get("cookie");

  if (cookie) {
    headers.set("cookie", cookie);
  }

  if (method === "POST") {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

  const response =
    await fetch(url, {
      method,
      headers,
      body:
        method === "POST"
          ? await request.text()
          : undefined,
      cache: "no-store",
    });

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

export async function GET(
  request: NextRequest,
) {
  return proxyRequest(
    request,
    "GET",
  );
}

export async function POST(
  request: NextRequest,
) {
  return proxyRequest(
    request,
    "POST",
  );
}