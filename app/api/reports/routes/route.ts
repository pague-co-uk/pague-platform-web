import { findPlatformRoutePerformanceReport } from "@/features/reports/api/reports-server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const params = {
      page: searchParams.get("page")
        ? Number(searchParams.get("page"))
        : undefined,
      pageSize: searchParams.get("pageSize")
        ? Number(searchParams.get("pageSize"))
        : undefined,
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
      routeId: searchParams.get("routeId") ?? undefined,
      connectorId: searchParams.get("connectorId") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      clientId: searchParams.get("clientId") ?? undefined,
    };

    const result =
      await findPlatformRoutePerformanceReport(params);

    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(
      "Failed to fetch route performance report:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "REPORT_FETCH_FAILED",
          message:
            "Unable to fetch route performance report.",
        },
      },
      { status: 500 },
    );
  }
}