import {
  createService,
  findServices,
  ServicesApiError,
} from "@/features/services/api/services-server";

import type {
  ServiceCategory,
  ServiceStatus,
} from "@/features/services/api/services-api";

import {
  NextRequest,
  NextResponse,
} from "next/server";

// ============================================================================
// Query parsing
// ============================================================================

function parseServiceCategory(
  value: string | null,
): ServiceCategory | undefined {
  if (
    value === "MESSAGING" ||
    value === "PAYMENTS"
  ) {
    return value;
  }

  return undefined;
}

function parseServiceStatus(
  value: string | null,
): ServiceStatus | undefined {
  if (
    value === "ACTIVE" ||
    value === "DISABLED"
  ) {
    return value;
  }

  return undefined;
}

// ============================================================================
// GET /api/services
// ============================================================================

export async function GET(
  request: NextRequest,
): Promise<NextResponse> {
  try {
    const searchParams =
      request.nextUrl.searchParams;

    const page =
      searchParams.get("page");

    const pageSize =
      searchParams.get("pageSize");

    const search =
      searchParams.get("search");

    const category =
      searchParams.get("category");

    const status =
      searchParams.get("status");

    const sort =
      searchParams.get("sort");

    const result =
      await findServices({
        page: page
          ? Number(page)
          : undefined,

        pageSize: pageSize
          ? Number(pageSize)
          : undefined,

        search:
          search || undefined,

        category:
          parseServiceCategory(category),

        status:
          parseServiceStatus(status),

        sort:
          sort || undefined,
      });

    return NextResponse.json({
      success: true,

      data: result.items,

      pagination: {
        page: result.meta.page,

        pageSize:
          result.meta.pageSize,

        totalItems:
          result.meta.total,

        totalPages:
          result.meta.totalPages,
      },
    });
  } catch (error) {
    console.error(
      "Failed to fetch services:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch services.",
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
// POST /api/services
// ============================================================================

export async function POST(
  request: NextRequest,
): Promise<NextResponse> {
  try {
    const body =
      await request.json();

    const service =
      await createService(body);

    return NextResponse.json({
      success: true,

      data: service,
    });
  } catch (error) {
    console.error(
      "Failed to create service:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Failed to create service.",
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