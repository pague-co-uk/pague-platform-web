import { exportClientFloatLedgerReport } from "@/features/reports/api/reports-server";
import { NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{
    clientId: string;
  }>;
}

export async function GET(
  request: Request,
  context: RouteContext,
) {
  try {
    const { clientId } =
      await context.params;

    const { searchParams } =
      new URL(request.url);

    const params = {
      from:
        searchParams.get("from") ?? undefined,
      to:
        searchParams.get("to") ?? undefined,
      transactionType:
        searchParams.get("transactionType") ?? undefined,
      referenceType:
        searchParams.get("referenceType") ?? undefined,
    };

    const workbook =
      await exportClientFloatLedgerReport(
        clientId,
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
            'attachment; filename="float-ledger-report.xlsx"',
          "Content-Length":
            workbook.length.toString(),
          "Cache-Control":
            "no-store",
        },
      },
    );
  } catch (error) {
    console.error(
      "Failed to export client float ledger report:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "REPORT_EXPORT_FAILED",
          message:
            "Unable to export client float ledger report.",
        },
      },
      { status: 500 },
    );
  }
}