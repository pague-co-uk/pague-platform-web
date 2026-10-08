import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  findPaymentProviderById,
  updatePaymentProvider,
} from "@/features/payment-providers/api/payment-providers-server";

import type {
  UpdatePaymentProviderPayload,
} from "@/features/payment-providers/types/payment-provider.types";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  _request: NextRequest,
  { params }: RouteContext,
) {
  const { id } = await params;

  try {
    const result =
      await findPaymentProviderById(id);

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

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext,
) {
  const { id } = await params;

  let payload:
    | UpdatePaymentProviderPayload
    | undefined;

  try {
    payload =
      (await request.json()) as UpdatePaymentProviderPayload;
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_REQUEST_BODY",
          message:
            "The request body must contain valid JSON.",
          details: [],
        },
      },
      {
        status: 400,
      },
    );
  }

  try {
    const result =
      await updatePaymentProvider(
        id,
        payload,
      );

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