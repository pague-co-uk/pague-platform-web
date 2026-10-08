import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  findProviderServiceById,
  updateProviderService,
} from "@/features/provider-services/api/provider-services-server";

import type {
  UpdateProviderServicePayload,
} from "@/features/provider-services/types/provider-service.types";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  _request: NextRequest,
  { params }: RouteContext,
) {
  const { id } =
    await params;

  try {
    const result =
      await findProviderServiceById(
        id,
      );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const status =
      error instanceof Error &&
        "status" in error &&
        typeof error.status === "number"
        ? error.status
        : 500;

    const message =
      error instanceof Error
        ? error.message
        : "Unable to load provider service.";

    return NextResponse.json(
      {
        success: false,
        message,
        error: {
          message,
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
  const { id } =
    await params;

  let payload:
    | UpdateProviderServicePayload
    | undefined;

  try {
    payload =
      (await request.json()) as UpdateProviderServicePayload;
  } catch {
    return NextResponse.json(
      {
        success: false,
        message:
          "Invalid request body.",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const result =
      await updateProviderService(
        id,
        payload,
      );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const status =
      error instanceof Error &&
        "status" in error &&
        typeof error.status === "number"
        ? error.status
        : 500;

    const message =
      error instanceof Error
        ? error.message
        : "Unable to update provider service.";

    return NextResponse.json(
      {
        success: false,
        message,
        error: {
          message,
        },
      },
      {
        status,
      },
    );
  }
}