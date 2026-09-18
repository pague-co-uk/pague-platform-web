import { exportPlatformMessageReport } from "@/features/reports/api/reports-server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

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
      clientId:
        searchParams.get("clientId") ?? undefined,
    };

    const workbook =
      await exportPlatformMessageReport(params);

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
      "Failed to export message report:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "REPORT_EXPORT_FAILED",
          message:
            "Unable to export message report.",
        },
      },
      { status: 500 },
    );
  }
}