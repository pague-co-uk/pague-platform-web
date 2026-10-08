import {
  NextResponse,
} from "next/server";

import {
  enablePaymentProvider,
} from "@/features/payment-providers/api/payment-providers-server";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(
  _request: Request,
  { params }: RouteContext,
) {
  const { id } = await params;

  try {
    const result =
      await enablePaymentProvider(id);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const statusCode =
      error instanceof Error &&
        "status" in error &&
        typeof error.status === "number"
        ? error.status
        : 500;

    const message =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred.";

    return NextResponse.json(
      {
        success: false,
        error: {
          code:
            statusCode === 404
              ? "PAYMENT_PROVIDER_NOT_FOUND"
              : statusCode === 400
                ? "INVALID_REQUEST"
                : "PAYMENT_PROVIDER_REQUEST_FAILED",
          message,
          details: [],
        },
      },
      {
        status: statusCode,
      },
    );
  }
}