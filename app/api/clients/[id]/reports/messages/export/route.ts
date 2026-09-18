import { exportClientMessageReport } from "@/features/reports/api/reports-server";
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
      search:
        searchParams.get("search") ?? undefined,
      destination:
        searchParams.get("destination") ?? undefined,
      senderIdId:
        searchParams.get("senderIdId") ?? undefined,
      status:
        searchParams.get("status") ?? undefined,
      encoding:
        searchParams.get("encoding") ?? undefined,
      submittedFrom:
        searchParams.get("submittedFrom") ?? undefined,
      submittedTo:
        searchParams.get("submittedTo") ?? undefined,
    };

    const workbook =
      await exportClientMessageReport(
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
            'attachment; filename="message-report.xlsx"',
          "Content-Length":
            workbook.length.toString(),
          "Cache-Control":
            "no-store",
        },
      },
    );
  } catch (error) {
    console.error(
      "Failed to export client message report:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "REPORT_EXPORT_FAILED",
          message:
            "Unable to export client message report.",
        },
      },
      { status: 500 },
    );
  }
}