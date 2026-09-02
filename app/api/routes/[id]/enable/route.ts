import { getControlPlaneUrl } from "@/lib/control-plane";
import { NextRequest, NextResponse } from "next/server";


interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
  request: NextRequest,
  context: RouteContext,
) {
  const { id } = await context.params;

  const response = await fetch(
    `${getControlPlaneUrl()}/api/routes/${encodeURIComponent(id)}/enable`,
    {
      method: "POST",
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
      cache: "no-store",
    },
  );

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