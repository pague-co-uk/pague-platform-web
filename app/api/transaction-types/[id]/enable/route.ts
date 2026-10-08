import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  enableTransactionType,
} from "@/features/transaction-types/api/transaction-types-server";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(
  _request: NextRequest,
  context: RouteContext,
) {
  const { id } = await context.params;

  try {
    const transactionType =
      await enableTransactionType(id);

    return NextResponse.json({
      success: true,
      data: transactionType,
    });
  } catch (error) {
    console.error(
      "Failed to enable transaction type.",
      error,
    );

    const status =
      error &&
        typeof error === "object" &&
        "status" in error &&
        typeof error.status === "number"
        ? error.status
        : 500;

    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Failed to enable transaction type.",
        },
      },
      { status },
    );
  }
}