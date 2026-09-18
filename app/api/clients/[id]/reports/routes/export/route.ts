import { exportClientRoutePerformanceReport } from "@/features/reports/api/reports-server";
import { NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: Request,
  context: RouteContext,
) {
  try {
    const { id } =
      await context.params;

    const { searchParams } =
      new URL(request.url);

    const params = {
      from:
        searchParams.get("from") ?? undefined,
      to:
        searchParams.get("to") ?? undefined,
      routeId:
        searchParams.get("routeId") ?? undefined,
      connectorId:
        searchParams.get("connectorId") ?? undefined,
      status:
        searchParams.get("status") ?? undefined,
    };

    const workbook =
      await exportClientRoutePerformanceReport(
        id,
        params,
      );

    return new NextResponse(
      new Uint8Array(workbook),
      {
        status: 200,
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition":
            'attachment; filename="route-performance-report.xlsx"',
          "Content-Length":
            workbook.length.toString(),
          "Cache-Control":
            "no-store",
        },
      },
    );
  } catch (error) {
    console.error(
      "Failed to export client route performance report:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "REPORT_EXPORT_FAILED",
          message:
            "Unable to export client route performance report.",
        },
      },
      { status: 500 },
    );
  }
}