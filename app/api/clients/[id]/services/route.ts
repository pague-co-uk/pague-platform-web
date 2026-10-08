import { NextRequest, NextResponse } from "next/server";

import {
  createClientService,
  findClientServices,
} from "@/features/client-services/api/client-services-server";
import type {
  ClientServiceListParams,
  CreateClientServicePayload,
} from "@/features/client-services/types/client-service.types";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteContext,
) {
  const { id } = await params;

  const searchParams =
    request.nextUrl.searchParams;

  const page = searchParams.get("page");
  const pageSize =
    searchParams.get("pageSize");
  const search =
    searchParams.get("search");
  const status =
    searchParams.get("status");
  const sort =
    searchParams.get("sort");

  const query: ClientServiceListParams = {};

  if (page) {
    query.page = Number(page);
  }

  if (pageSize) {
    query.pageSize = Number(pageSize);
  }

  if (search) {
    query.search = search;
  }

  if (status) {
    query.status =
      status as ClientServiceListParams["status"];
  }

  if (sort) {
    query.sort = sort;
  }

  try {
    const result =
      await findClientServices(
        id,
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
            statusCode === 404
              ? "CLIENT_SERVICE_NOT_FOUND"
              : "CLIENT_SERVICE_REQUEST_FAILED",
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
  { params }: RouteContext,
) {
  const { id } = await params;

  let payload: CreateClientServicePayload;

  try {
    payload =
      (await request.json()) as CreateClientServicePayload;
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
      await createClientService(
        id,
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
            statusCode === 404
              ? "RESOURCE_NOT_FOUND"
              : statusCode === 409
                ? "RESOURCE_CONFLICT"
                : statusCode === 400
                  ? "INVALID_REQUEST"
                  : "CLIENT_SERVICE_REQUEST_FAILED",
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