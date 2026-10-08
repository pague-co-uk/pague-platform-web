import "server-only";

import { cookies } from "next/headers";

const CONTROL_PLANE_API_URL =
  process.env.CONTROL_PLANE_API_URL;

if (!CONTROL_PLANE_API_URL) {
  throw new Error(
    "CONTROL_PLANE_API_URL is not configured.",
  );
}

export interface Country {
  code: string;
  name: string;
  callingCodes: string[];
}

export class CountriesServerApiError extends Error {
  public readonly status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);
    this.name = "CountriesServerApiError";
    this.status = status;
  }
}

function isCountry(
  value: unknown,
): value is Country {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const country =
    value as Record<string, unknown>;

  return (
    typeof country.code === "string" &&
    typeof country.name === "string" &&
    Array.isArray(country.callingCodes) &&
    country.callingCodes.every(
      (callingCode) =>
        typeof callingCode === "string",
    )
  );
}

function extractCountries(
  value: unknown,
): Country[] {
  if (Array.isArray(value)) {
    if (!value.every(isCountry)) {
      throw new CountriesServerApiError(
        "Invalid countries response.",
        502,
      );
    }

    return value;
  }

  if (
    typeof value === "object" &&
    value !== null
  ) {
    const response =
      value as Record<string, unknown>;

    if (
      Array.isArray(response.data) &&
      response.data.every(isCountry)
    ) {
      return response.data;
    }
  }

  throw new CountriesServerApiError(
    "Invalid countries response.",
    502,
  );
}

export async function findCountries(): Promise<
  Country[]
> {
  const cookieStore =
    await cookies();

  const session =
    cookieStore.get("session");

  const response =
    await fetch(
      `${CONTROL_PLANE_API_URL}/api/countries`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",

          ...(session
            ? {
              Cookie: `${session.name}=${session.value}`,
            }
            : {}),
        },
        cache: "no-store",
      },
    );

  let body: unknown;

  try {
    body =
      await response.json();
  } catch {
    throw new CountriesServerApiError(
      "The countries API returned an invalid response.",
      response.status,
    );
  }

  if (!response.ok) {
    let message =
      "Unable to load countries.";

    if (
      typeof body === "object" &&
      body !== null
    ) {
      const errorBody =
        body as Record<
          string,
          unknown
        >;

      if (
        typeof errorBody.message ===
        "string"
      ) {
        message =
          errorBody.message;
      } else if (
        typeof errorBody.error ===
        "string"
      ) {
        message =
          errorBody.error;
      }
    }

    throw new CountriesServerApiError(
      message,
      response.status,
    );
  }

  return extractCountries(body);
}