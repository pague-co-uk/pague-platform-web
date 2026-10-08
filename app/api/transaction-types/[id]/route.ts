import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  findTransactionTypeById,
  updateTransactionType,
} from "@/features/transaction-types/api/transaction-types-server";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  const { id } = await context.params;

  try {
    const transactionType =
      await findTransactionTypeById(id);

    return NextResponse.json({
      success: true,
      data: transactionType,
    });
  } catch (error) {
    console.error(
      "Failed to fetch transaction type.",
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
              : "Failed to fetch transaction type.",
        },
      },
      { status },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  const { id } = await context.params;

  try {
    const payload = await request.json();

    const transactionType =
      await updateTransactionType(
        id,
        payload,
      );

    return NextResponse.json({
      success: true,
      data: transactionType,
    });
  } catch (error) {
    console.error(
      "Failed to update transaction type.",
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
              : "Failed to update transaction type.",
        },
      },
      { status },
    );
  }
}