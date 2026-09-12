export type SmppAccountStatus =
  | "ACTIVE"
  | "DISABLED"
  | "SUSPENDED";

export interface SmppAccount {

  id: string;

  publicId: string;

  clientId: string;

  systemId: string;

  status: SmppAccountStatus;

  maxConcurrentBinds: number;

  enquireLinkInterval: number;

  ipAllowlist: string[];

  createdAt: string;

  updatedAt: string;

}

export interface SmppAccountClient {
  id: string;
  publicId: string;
  companyName: string;
  displayName: string;
}

export interface PlatformSmppAccount
  extends Omit<SmppAccount, "clientId"> {
  client: SmppAccountClient;
}

export interface FindPlatformSmppAccountsParams {
  page?: number;
  pageSize?: number;
  clientId?: string;
  status?: SmppAccountStatus;
  search?: string;
}

export interface SmppAccountPagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface FindPlatformSmppAccountsResult {
  data: PlatformSmppAccount[];
  pagination: SmppAccountPagination;
}

export interface CreateSmppAccountInput {

  systemId: string;

  password: string;

  maxConcurrentBinds?: number;

  enquireLinkInterval?: number;

  ipAllowlist: string[];

}

export interface UpdateSmppAccountInput {

  maxConcurrentBinds?: number;

  enquireLinkInterval?: number;

  ipAllowlist?: string[];

}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

function parseResponse<T>(
  response: Response,
): Promise<T | undefined> {
  return response.text().then((body) => {
    if (!response.ok) {
      throw new Error(
        body ||
        `Request failed with status ${response.status}.`,
      );
    }

    if (!body) {
      return undefined;
    }

    return JSON.parse(body) as T;
  });
}

function getBaseUrl(): string {
  return "/api";
}

export async function findSmppAccounts(
  clientId: string,
): Promise<SmppAccount[]> {
  const response = await fetch(
    `${getBaseUrl()}/clients/${encodeURIComponent(
      clientId,
    )}/smpp-accounts`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    },
  );

  const body =
    await parseResponse<ApiResponse<SmppAccount[]>>(
      response,
    );

  if (!body?.success) {
    throw new Error(
      "Unable to retrieve SMPP accounts.",
    );
  }

  return body.data;
}

export async function findSmppAccount(
  clientId: string,
  accountId: string,
): Promise<SmppAccount> {
  const response = await fetch(
    `${getBaseUrl()}/clients/${encodeURIComponent(
      clientId,
    )}/smpp-accounts/${encodeURIComponent(
      accountId,
    )}`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    },
  );

  const body =
    await parseResponse<ApiResponse<SmppAccount>>(
      response,
    );

  if (!body?.success) {
    throw new Error(
      "Unable to retrieve the SMPP account.",
    );
  }

  return body.data;
}

export async function createSmppAccount(
  clientId: string,
  input: CreateSmppAccountInput,
): Promise<SmppAccount> {
  const response = await fetch(
    `${getBaseUrl()}/clients/${encodeURIComponent(
      clientId,
    )}/smpp-accounts`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  const body =
    await parseResponse<ApiResponse<SmppAccount>>(
      response,
    );

  if (!body?.success) {
    throw new Error(
      "Unable to create the SMPP account.",
    );
  }

  return body.data;
}

export async function updateSmppAccount(
  clientId: string,
  accountId: string,
  input: UpdateSmppAccountInput,
): Promise<SmppAccount> {
  const response = await fetch(
    `${getBaseUrl()}/clients/${encodeURIComponent(
      clientId,
    )}/smpp-accounts/${encodeURIComponent(
      accountId,
    )}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  const body =
    await parseResponse<ApiResponse<SmppAccount>>(
      response,
    );

  if (!body?.success) {
    throw new Error(
      "Unable to update the SMPP account.",
    );
  }

  return body.data;
}

export async function changeSmppPassword(
  clientId: string,
  accountId: string,
  password: string,
): Promise<SmppAccount> {
  const response = await fetch(
    `${getBaseUrl()}/clients/${encodeURIComponent(
      clientId,
    )}/smpp-accounts/${encodeURIComponent(
      accountId,
    )}/password`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password,
      }),
    },
  );

  const body =
    await parseResponse<ApiResponse<SmppAccount>>(
      response,
    );

  if (!body?.success) {
    throw new Error(
      "Unable to change the SMPP account password.",
    );
  }

  return body.data;
}

export async function activateSmppAccount(
  clientId: string,
  accountId: string,
): Promise<SmppAccount> {
  const response = await fetch(
    `${getBaseUrl()}/clients/${encodeURIComponent(
      clientId,
    )}/smpp-accounts/${encodeURIComponent(
      accountId,
    )}/activate`,
    {
      method: "POST",
      credentials: "include",
    },
  );

  const body =
    await parseResponse<ApiResponse<SmppAccount>>(
      response,
    );

  if (!body?.success) {
    throw new Error(
      "Unable to activate the SMPP account.",
    );
  }

  return body.data;
}

export async function disableSmppAccount(
  clientId: string,
  accountId: string,
): Promise<SmppAccount> {
  const response = await fetch(
    `${getBaseUrl()}/clients/${encodeURIComponent(
      clientId,
    )}/smpp-accounts/${encodeURIComponent(
      accountId,
    )}/disable`,
    {
      method: "POST",
      credentials: "include",
    },
  );

  const body =
    await parseResponse<ApiResponse<SmppAccount>>(
      response,
    );

  if (!body?.success) {
    throw new Error(
      "Unable to disable the SMPP account.",
    );
  }

  return body.data;
}

export async function findPlatformSmppAccounts(
  params: FindPlatformSmppAccountsParams = {},
): Promise<FindPlatformSmppAccountsResult> {
  const query = new URLSearchParams();

  if (params.page !== undefined) {
    query.set("page", String(params.page));
  }

  if (params.pageSize !== undefined) {
    query.set("pageSize", String(params.pageSize));
  }

  if (params.clientId !== undefined) {
    query.set("clientId", params.clientId);
  }

  if (params.status !== undefined) {
    query.set("status", params.status);
  }

  if (
    params.search !== undefined &&
    params.search.trim() !== ""
  ) {
    query.set("search", params.search.trim());
  }

  const queryString = query.toString();

  const response = await fetch(
    `${getBaseUrl()}/smpp-accounts${queryString ? `?${queryString}` : ""
    }`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    },
  );

  const body =
    await parseResponse<
      ApiResponse<
        PlatformSmppAccount[]
      > & {
        pagination: SmppAccountPagination;
      }
    >(response);

  if (!body?.success) {
    throw new Error(
      "Unable to retrieve SMPP accounts.",
    );
  }

  return {
    data: body.data,
    pagination: body.pagination,
  };
}