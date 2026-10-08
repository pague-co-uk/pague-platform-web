import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  createPaymentProvider,
  findPaymentProviders,
} from "@/features/payment-providers/api/payment-providers-server";

import type {
  CreatePaymentProviderPayload,
  PaymentProviderListParams,
} from "@/features/payment-providers/types/payment-provider.types";

export async function GET(
  request: NextRequest,
) {
  const searchParams =
    request.nextUrl.searchParams;

  const page =
    searchParams.get("page");

  const pageSize =
    searchParams.get("pageSize");

  const search =
    searchParams.get("search");

  const status =
    searchParams.get("status");

  const sort =
    searchParams.get("sort");

  const query: PaymentProviderListParams =
    {};

  if (page) {
    query.page = Number(page);
  }

  if (pageSize) {
    query.pageSize =
      Number(pageSize);
  }

  if (search) {
    query.search = search;
  }

  if (status) {
    query.status =
      status as PaymentProviderListParams["status"];
  }

  if (sort) {
    query.sort = sort;
  }

  try {
    const result =
      await findPaymentProviders(
        query,
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
            statusCode === 400
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

export async function POST(
  request: NextRequest,
) {
  let payload:
    | CreatePaymentProviderPayload
    | undefined;

  try {
    payload =
      (await request.json()) as CreatePaymentProviderPayload;
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
      await createPaymentProvider(
        payload,
      );

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      {
        status: 201,
      },
    );
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
            statusCode === 409
              ? "RESOURCE_CONFLICT"
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