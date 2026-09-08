import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const start = performance.now();

  const response = {
    status: "healthy",
    service: process.env.APP_NAME ?? "pague-platform-web",
    version: process.env.APP_VERSION ?? "1.0.0",
    environment:
      process.env.NODE_ENV ?? "development",
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    latency: Math.round(
      performance.now() - start,
    ),
  };

  return NextResponse.json(
    response,
    {
      status: 200,
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate",
      },
    },
  );
}