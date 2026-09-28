"use client";

import {
  useRouter,
} from "next/navigation";

import Link from "next/link";

import {
  PageContainer,
} from "@/components/layout/page-container";

import {
  PageHeader,
} from "@/components/layout/page-header";

import RoleForm, {
  RoleFormValues,
} from "@/features/access-control/components/role-form";

import {
  createRole,
} from "@/features/access-control/api/roles-api";

import {
  useToast,
} from "@/components/ui/toast";

export default function NewRoleClient() {
  const router =
    useRouter();

  const {
    success,
    error: showError,
  } = useToast();

  async function handleSubmit(
    values: RoleFormValues,
  ) {
    try {
      const role =
        await createRole({
          name:
            values.name.trim(),

          description:
            values.description.trim() ||
            undefined,

          priority:
            Number(
              values.priority,
            ),
        });

      success(
        "Role created",
        `${role.name} has been created successfully.`,
      );

      router.push(
        `/access-control/roles/${role.id}`,
      );

      router.refresh();
    } catch (error) {
      console.error(
        "[Roles] Unable to create role.",
        error,
      );

      showError(
        "Unable to create role",
        error instanceof Error
          ? error.message
          : "Unable to create role.",
      );
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Create role"
        description="Create a new role and define its privilege priority."
      />

      <div className="mb-5">
        <Link
          href="/access-control/roles"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900"
        >
          <ChevronLeftIcon />

          Back to roles
        </Link>
      </div>

      <RoleForm
        mode="create"
        onSubmit={
          handleSubmit
        }
        onCancel={() =>
          router.push(
            "/access-control/roles",
          )
        }
      />
    </PageContainer>
  );
}

function ChevronLeftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="m15 18-6-6 6-6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}