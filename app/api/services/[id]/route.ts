import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  findServiceById,
  ServicesApiError,
  updateService,
} from "@/features/services/api/services-server";

interface ServiceRouteContext {
  params: Promise<{
    id: string;
  }>;
}

// ============================================================================
// GET /api/services/:id
// ============================================================================

export async function GET(
  _request: NextRequest,
  context: ServiceRouteContext,
): Promise<NextResponse> {
  try {
    const { id } =
      await context.params;

    const service =
      await findServiceById(id);

    return NextResponse.json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error(
      "Failed to fetch service:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch service.",
      },
      {
        status:
          error instanceof ServicesApiError
            ? error.status
            : 500,
      },
    );
  }
}

// ============================================================================
// PATCH /api/services/:id
// ============================================================================

export async function PATCH(
  request: NextRequest,
  context: ServiceRouteContext,
): Promise<NextResponse> {
  try {
    const { id } =
      await context.params;

    const body =
      await request.json();

    const service =
      await updateService(
        id,
        body,
      );

    return NextResponse.json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error(
      "Failed to update service:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Failed to update service.",
      },
      {
        status:
          error instanceof ServicesApiError
            ? error.status
            : 500,
      },
    );
  }
}