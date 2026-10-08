import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  createProviderService,
  findProviderServices,
} from "@/features/provider-services/api/provider-services-server";

import type {
  CreateProviderServicePayload,
  ProviderServiceListParams,
} from "@/features/provider-services/types/provider-service.types";

export async function GET(
  request: NextRequest,
) {
  const searchParams =
    request.nextUrl.searchParams;

  const query: ProviderServiceListParams =
    {};

  const page =
    searchParams.get("page");

  const pageSize =
    searchParams.get("pageSize");

  const search =
    searchParams.get("search");

  const active =
    searchParams.get("active");

  const providerCode =
    searchParams.get(
      "providerCode",
    );

  const serviceCode =
    searchParams.get(
      "serviceCode",
    );

  const sort =
    searchParams.get("sort");

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

  if (active === "true") {
    query.active = true;
  }

  if (active === "false") {
    query.active = false;
  }

  if (providerCode) {
    query.providerCode =
      providerCode;
  }

  if (serviceCode) {
    query.serviceCode =
      serviceCode;
  }

  if (sort) {
    query.sort = sort;
  }

  try {
    const result =
      await findProviderServices(
        query,
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
        : "Unable to load provider services.";

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

export async function POST(
  request: NextRequest,
) {
  let payload:
    | CreateProviderServicePayload
    | undefined;

  try {
    payload =
      (await request.json()) as CreateProviderServicePayload;
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
      await createProviderService(
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
    const status =
      error instanceof Error &&
        "status" in error &&
        typeof error.status === "number"
        ? error.status
        : 500;

    const message =
      error instanceof Error
        ? error.message
        : "Unable to create provider service.";

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