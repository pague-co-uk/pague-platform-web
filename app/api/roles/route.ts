import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  createRole,
  findRoles,
} from "@/features/access-control/api/server-roles-api";

export async function GET(
  request: NextRequest,
): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;

    const page = searchParams.get("page");
    const pageSize = searchParams.get("pageSize");
    const search = searchParams.get("search");

    const result = await findRoles({
      page: page ? Number(page) : undefined,
      pageSize: pageSize
        ? Number(pageSize)
        : undefined,
      search: search || undefined,
    });

    return NextResponse.json({
      success: true,
      data: result.items,
      pagination: {
        page: result.meta.page,
        pageSize: result.meta.pageSize,
        totalItems: result.meta.total,
        totalPages: result.meta.totalPages,
      },
    });
  } catch (error) {
    console.error(
      "Failed to fetch roles:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch roles.",
      },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse> {
  try {
    const body = await request.json();

    const role = await createRole(body);

    return NextResponse.json({
      success: true,
      data: role,
    });
  } catch (error) {
    console.error(
      "Failed to create role:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create role.",
      },
      { status: 500 },
    );
  }
}