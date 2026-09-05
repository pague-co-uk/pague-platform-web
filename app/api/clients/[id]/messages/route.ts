import { NextRequest, NextResponse } from "next/server";

import { getControlPlaneUrl } from "@/lib/control-plane";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext,
) {
  const { id } =
    await context.params;

  const url =
    new URL(
      `${getControlPlaneUrl()}/api/clients/${encodeURIComponent(
        id,
      )}/messages`,
    );

  request.nextUrl.searchParams.forEach(
    (value, key) => {
      url.searchParams.set(
        key,
        value,
      );
    },
  );

  const response =
    await fetch(url, {
      method: "GET",
      headers: {
        Cookie:
          request.headers.get(
            "cookie",
          ) ?? "",
      },
      cache: "no-store",
    });

  const body =
    await response.text();

  return new NextResponse(
    body,
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

export async function POST(
  request: NextRequest,
  context: RouteContext,
) {
  const { id } =
    await context.params;

  const body =
    await request.text();

  const response =
    await fetch(
      `${getControlPlaneUrl()}/api/clients/${encodeURIComponent(
        id,
      )}/messages`,
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
            ) ??
            "application/json",
        },
        body,
        cache: "no-store",
      },
    );

  const responseBody =
    await response.text();

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