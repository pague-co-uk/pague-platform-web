"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import Link from "next/link";

import RoleSelector, {
  RoleOption,
} from "@/components/users/role-selector";

import {
  useToast,
} from "@/components/ui/toast";

import {
  updateUserRoles,
  UsersApiError,
} from "@/features/users/api/users-api";

// ============================================================================
// Types
// ============================================================================

export interface ClientOption {
  readonly id: string;
  readonly name: string;
}

interface CreateUserClientProps {
  readonly canSelectClient: boolean;

  readonly clients: readonly ClientOption[];

  readonly canAssignRoles: boolean;

  readonly roles: readonly RoleOption[];
}

// ============================================================================
// Create user client
// ============================================================================

export default function CreateUserClient({
  canSelectClient,
  clients,
  canAssignRoles,
  roles,
}: CreateUserClientProps) {
  const router =
    useRouter();

  const {
    success,
    error: showError,
  } = useToast();

  // ==========================================================================
  // State
  // ==========================================================================

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    selectedRoleIds,
    setSelectedRoleIds,
  ] = useState<
    readonly string[]
  >([]);

  // ==========================================================================
  // Submit
  // ==========================================================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const form =
      event.currentTarget;

    const formData =
      new FormData(form);

    const firstName =
      String(
        formData.get(
          "firstName",
        ) ?? "",
      ).trim();

    const lastName =
      String(
        formData.get(
          "lastName",
        ) ?? "",
      ).trim();

    const username =
      String(
        formData.get(
          "username",
        ) ?? "",
      ).trim();

    const email =
      String(
        formData.get(
          "email",
        ) ?? "",
      ).trim();

    const phone =
      String(
        formData.get(
          "phone",
        ) ?? "",
      ).trim();

    const password =
      String(
        formData.get(
          "password",
        ) ?? "",
      );

    const confirmPassword =
      String(
        formData.get(
          "confirmPassword",
        ) ?? "",
      );

    const clientId =
      String(
        formData.get(
          "clientId",
        ) ?? "",
      ).trim();

    // ==========================================================================
    // Validation
    // ==========================================================================

    if (!firstName) {
      setError(
        "First name is required.",
      );

      return;
    }

    if (!lastName) {
      setError(
        "Last name is required.",
      );

      return;
    }

    if (!username) {
      setError(
        "Username is required.",
      );

      return;
    }

    if (!email) {
      setError(
        "Email address is required.",
      );

      return;
    }

    if (
      canSelectClient &&
      !clientId
    ) {
      setError(
        "Select a client.",
      );

      return;
    }

    if (!password) {
      setError(
        "Password is required.",
      );

      return;
    }

    if (password.length < 12) {
      setError(
        "Password must be at least 12 characters.",
      );

      return;
    }

    if (password.length > 128) {
      setError(
        "Password must not exceed 128 characters.",
      );

      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      setError(
        "Password confirmation does not match.",
      );

      return;
    }

    setError(null);
    setIsSubmitting(true);

    // ==========================================================================
    // Create user
    // ==========================================================================

    try {
      const payload: Record<
        string,
        string
      > = {
        firstName,
        lastName,
        username,
        email,
        password,
      };

      if (phone) {
        payload.phone =
          phone;
      }

      /*
       * A platform super-admin explicitly supplies the client.
       *
       * A client-scoped user does NOT send clientId.
       * The Control Plane derives it from the authenticated user.
       */
      if (
        canSelectClient &&
        clientId
      ) {
        payload.clientId =
          clientId;
      }

      const response =
        await fetch(
          "/api/users",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials:
              "include",

            body:
              JSON.stringify(
                payload,
              ),

            cache: "no-store",
          },
        );

      const body =
        (await response
          .json()
          .catch(
            () => null,
          )) as unknown;

      // ========================================================================
      // Authentication failure
      // ========================================================================

      if (
        response.status ===
        401
      ) {
        router.replace(
          "/login",
        );

        return;
      }

      // ========================================================================
      // User creation failure
      // ========================================================================

      if (!response.ok) {
        setError(
          getErrorMessage(
            body,
            "Unable to create the user. Please try again.",
          ),
        );

        return;
      }

      // ========================================================================
      // Extract created user ID
      // ========================================================================

      const userId =
        getCreatedUserId(
          body,
        );

      if (!userId) {
        showError(
          "User created",
          "The user was created, but the API did not return the new user's ID.",
        );

        router.push(
          "/users",
        );

        router.refresh();

        return;
      }

      // ==========================================================================
      // Assign roles
      // ==========================================================================

      if (
        canAssignRoles &&
        selectedRoleIds.length >
        0
      ) {
        try {
          await updateUserRoles(
            userId,
            selectedRoleIds,
          );
        } catch (error) {
          console.error(
            "[Users] Failed to assign roles to newly created user.",
            error,
          );

          showError(
            "User created, but roles were not assigned",
            error instanceof
              UsersApiError
              ? error.message
              : "The user was created successfully, but their roles could not be assigned.",
          );

          router.push(
            `/users/${userId}`,
          );

          router.refresh();

          return;
        }
      }

      // ==========================================================================
      // Success
      // ==========================================================================

      success(
        "User created",
        `${firstName} ${lastName} was created successfully.`,
      );

      router.push(
        `/users/${userId}`,
      );

      router.refresh();
    } catch (error) {
      console.error(
        "[Users] Failed to create user.",
        error,
      );

      setError(
        "Unable to connect to the user service. Please try again.",
      );
    } finally {
      setIsSubmitting(
        false,
      );
    }
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <div className="mt-6 flex w-full justify-center">
      <div className="w-full max-w-3xl">

        {/* ====================================================================
            Error
        ==================================================================== */}

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        {/* ====================================================================
            Form
        ==================================================================== */}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <form
            onSubmit={
              handleSubmit
            }
          >

            {/* ==================================================================
                Account
            ================================================================== */}

            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
              <h2 className="text-sm font-semibold text-slate-900">
                Account details
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Enter the details for the new portal user.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormField
                  id="firstName"
                  name="firstName"
                  label="First name"
                  placeholder="John"
                  required
                />

                <FormField
                  id="lastName"
                  name="lastName"
                  label="Last name"
                  placeholder="Doe"
                  required
                />

                <FormField
                  id="username"
                  name="username"
                  label="Username"
                  placeholder="john.doe"
                  required
                />

                <FormField
                  id="email"
                  name="email"
                  label="Email address"
                  type="email"
                  placeholder="john.doe@example.com"
                  required
                />

                <FormField
                  id="phone"
                  name="phone"
                  label="Phone"
                  type="tel"
                  placeholder="+265991234567"
                />
              </div>
            </div>

            {/* ==================================================================
                Client
            ================================================================== */}

            {canSelectClient && (
              <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                <h2 className="text-sm font-semibold text-slate-900">
                  Client
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Select the client this user will belong to.
                </p>

                <div className="mt-5">
                  <label
                    htmlFor="clientId"
                    className="mb-1.5 block text-xs font-medium text-slate-600"
                  >
                    Client

                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <select
                    id="clientId"
                    name="clientId"
                    defaultValue=""
                    required
                    disabled={
                      isSubmitting
                    }
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                  >
                    <option
                      value=""
                      disabled
                    >
                      Select a client
                    </option>

                    {clients.map(
                      (
                        client,
                      ) => (
                        <option
                          key={
                            client.id
                          }
                          value={
                            client.id
                          }
                        >
                          {
                            client.name
                          }
                        </option>
                      ),
                    )}
                  </select>

                  {clients.length ===
                    0 && (
                      <p className="mt-2 text-xs text-amber-600">
                        No clients are available.
                      </p>
                    )}
                </div>
              </div>
            )}

            {/* ==================================================================
                Roles
            ================================================================== */}

            {canAssignRoles && (
              <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                <h2 className="text-sm font-semibold text-slate-900">
                  Roles
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Assign the roles this user will have.
                </p>

                <div className="mt-5">
                  <RoleSelector
                    roles={
                      roles
                    }
                    value={
                      selectedRoleIds
                    }
                    onChange={
                      setSelectedRoleIds
                    }
                    disabled={
                      isSubmitting
                    }
                  />
                </div>
              </div>
            )}

            {/* ==================================================================
                Password
            ================================================================== */}

            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
              <h2 className="text-sm font-semibold text-slate-900">
                Password
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Set the initial password for this user.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <PasswordField
                  id="password"
                  name="password"
                  label="Password"
                  placeholder="Enter a password"
                  visible={
                    showPassword
                  }
                  onToggle={() =>
                    setShowPassword(
                      (
                        value,
                      ) =>
                        !value,
                    )
                  }
                />

                <PasswordField
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirm password"
                  placeholder="Confirm the password"
                  visible={
                    showConfirmPassword
                  }
                  onToggle={() =>
                    setShowConfirmPassword(
                      (
                        value,
                      ) =>
                        !value,
                    )
                  }
                />
              </div>

              <p className="mt-3 text-xs text-slate-400">
                Password must be between 12 and 128 characters.
              </p>
            </div>

            {/* ==================================================================
                Actions
            ================================================================== */}

            <div className="flex flex-col-reverse gap-3 px-5 py-5 sm:flex-row sm:justify-end sm:px-6">
              <Link
                href="/users"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  (
                    canSelectClient &&
                    clients.length ===
                    0
                  )
                }
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                )}

                {isSubmitting
                  ? "Creating user…"
                  : "Create user"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Form field
// ============================================================================

interface FormFieldProps {
  id: string;
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}

function FormField({
  id,
  name,
  label,
  type = "text",
  placeholder,
  required = false,
}: FormFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-medium text-slate-600"
      >
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-300 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
      />
    </div>
  );
}

// ============================================================================
// Password field
// ============================================================================

interface PasswordFieldProps {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  visible: boolean;
  onToggle: () => void;
}

function PasswordField({
  id,
  name,
  label,
  placeholder,
  visible,
  onToggle,
}: PasswordFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-medium text-slate-600"
      >
        {label}

        <span className="ml-1 text-red-500">
          *
        </span>
      </label>

      <div className="relative">
        <input
          id={id}
          name={name}
          type={
            visible
              ? "text"
              : "password"
          }
          autoComplete="new-password"
          placeholder={
            placeholder
          }
          required
          className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 pr-16 text-sm text-slate-900 placeholder:text-slate-300 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
        />

        <button
          type="button"
          onClick={
            onToggle
          }
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none"
        >
          {visible
            ? "Hide"
            : "Show"}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Response helpers
// ============================================================================

function getCreatedUserId(
  data: unknown,
): string | null {
  if (
    typeof data !==
    "object" ||
    data === null ||
    !("data" in data)
  ) {
    return null;
  }

  const responseData =
    data.data;

  if (
    typeof responseData !==
    "object" ||
    responseData === null ||
    !("id" in responseData)
  ) {
    return null;
  }

  return typeof responseData.id ===
    "string"
    ? responseData.id
    : null;
}

function getErrorMessage(
  data: unknown,
  fallback: string,
): string {
  if (
    typeof data !==
    "object" ||
    data === null
  ) {
    return fallback;
  }

  if (
    "error" in data &&
    typeof data.error ===
    "object" &&
    data.error !== null &&
    "message" in data.error &&
    typeof data.error.message ===
    "string"
  ) {
    return data.error.message;
  }

  if (
    "message" in data &&
    typeof data.message ===
    "string"
  ) {
    return data.message;
  }

  return fallback;
}