import { NextResponse } from "next/server";

import { enableClientService } from "@/features/client-services/api/client-services-server";

interface RouteContext {
  params: Promise<{
    id: string;
    serviceId: string;
  }>;
}

function getErrorStatus(
  error: unknown,
): number {
  if (
    error instanceof Error &&
    "status" in error &&
    typeof error.status === "number"
  ) {
    return error.status;
  }

  return 500;
}

function getErrorMessage(
  error: unknown,
): string {
  return error instanceof Error
    ? error.message
    : "An unexpected error occurred.";
}

function getErrorCode(
  status: number,
): string {
  switch (status) {
    case 400:
      return "INVALID_REQUEST";

    case 404:
      return "CLIENT_SERVICE_NOT_FOUND";

    case 409:
      return "CLIENT_SERVICE_CANNOT_BE_ENABLED";

    default:
      return "CLIENT_SERVICE_REQUEST_FAILED";
  }
}

export async function PATCH(
  _request: Request,
  { params }: RouteContext,
) {
  const {
    id,
    serviceId,
  } = await params;

  try {
    const result =
      await enableClientService(
        id,
        serviceId,
      );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const status =
      getErrorStatus(error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: getErrorCode(status),
          message:
            getErrorMessage(error),
          details: [],
        },
      },
      {
        status,
      },
    );
  }
}