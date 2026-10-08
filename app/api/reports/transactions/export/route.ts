import { exportPlatformTransactionReport } from "@/features/reports/api/reports-server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } =
      new URL(request.url);

    const params = {
      search:
        searchParams.get("search") ??
        undefined,

      clientId:
        searchParams.get("clientId") ??
        undefined,

      clientServiceId:
        searchParams.get("clientServiceId") ??
        undefined,

      providerId:
        searchParams.get("providerId") ??
        undefined,

      providerServiceId:
        searchParams.get("providerServiceId") ??
        undefined,

      currencyId:
        searchParams.get("currencyId") ??
        undefined,

      transactionTypeId:
        searchParams.get("transactionTypeId") ??
        undefined,

      status:
        searchParams.get("status") ??
        undefined,

      from:
        searchParams.get("from") ??
        undefined,

      to:
        searchParams.get("to") ??
        undefined,
    };

    const workbook =
      await exportPlatformTransactionReport(
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
            'attachment; filename="transaction-report.xlsx"',

          "Content-Length":
            workbook.length.toString(),

          "Cache-Control":
            "no-store",
        },
      },
    );
  } catch (error) {
    console.error(
      "Failed to export transaction report:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "REPORT_EXPORT_FAILED",
          message:
            "Unable to export transaction report.",
        },
      },
      { status: 500 },
    );
  }
}