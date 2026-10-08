import { NextRequest, NextResponse } from "next/server";

import {
  findClientServiceById,
  updateClientService,
} from "@/features/client-services/api/client-services-server";
import type { UpdateClientServicePayload } from "@/features/client-services/types/client-service.types";

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
      return "RESOURCE_CONFLICT";

    default:
      return "CLIENT_SERVICE_REQUEST_FAILED";
  }
}

export async function GET(
  _request: NextRequest,
  { params }: RouteContext,
) {
  const {
    id,
    serviceId,
  } = await params;

  try {
    const result =
      await findClientServiceById(
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

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext,
) {
  const {
    id,
    serviceId,
  } = await params;

  let payload: UpdateClientServicePayload;

  try {
    payload =
      (await request.json()) as UpdateClientServicePayload;
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
      await updateClientService(
        id,
        serviceId,
        payload,
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