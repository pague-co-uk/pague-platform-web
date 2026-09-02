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

import {
  useToast,
} from "@/components/ui/toast";

import ClientForm, {
  ClientFormValues,
} from "@/features/clients/components/client-form";

import {
  updateClient,
} from "@/features/clients/api/clients-api";

import type {
  Client,
} from "@/features/clients/api/clients-api";

// ============================================================================
// Types
// ============================================================================

interface EditClientClientProps {
  readonly client: Client;
}

// ============================================================================
// Edit client
// ============================================================================

export default function EditClientClient({
  client,
}: EditClientClientProps) {
  const router =
    useRouter();

  const {
    success,
    error: showError,
  } = useToast();

  // ==========================================================================
  // Submit
  // ==========================================================================

  async function handleSubmit(
    values: ClientFormValues,
  ) {
    try {
      await updateClient(
        client.id,
        {
          companyName:
            values.companyName.trim(),

          displayName:
            values.displayName.trim(),

          email:
            values.email.trim(),

          phone:
            values.phone.trim() ||
            undefined,

          rateLimitPerSecond:
            Number(
              values.rateLimitPerSecond,
            ),

          timezone:
            values.timezone.trim() ||
            undefined,
        },
      );

      success(
        "Client updated",
        `${values.displayName.trim() || values.companyName.trim()} has been updated successfully.`,
      );

      router.push(
        `/clients/${encodeURIComponent(
          client.id,
        )}`,
      );

      router.refresh();
    } catch (error) {
      console.error(
        "[Clients] Unable to update client.",
        error,
      );

      showError(
        "Unable to update client",
        error instanceof Error
          ? error.message
          : "Unable to update client.",
      );
    }
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <PageContainer>
      <PageHeader
        title="Edit client"
        description={`Update the configuration and contact details for ${client.displayName ||
          client.companyName
          }.`}
      />

      {/* ======================================================================
          Breadcrumb
      ======================================================================= */}

      <div className="mb-5">
        <Link
          href={`/clients/${encodeURIComponent(
            client.id,
          )}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900"
        >
          <ChevronLeftIcon />

          Back to client
        </Link>
      </div>

      {/* ======================================================================
          Form
      ======================================================================= */}

      <ClientForm
        mode="edit"
        initialValues={{
          companyName:
            client.companyName,

          clientCode:
            client.publicId,

          displayName:
            client.displayName,

          email:
            client.email,

          phone:
            client.phone ?? "",

          rateLimitPerSecond:
            String(
              client.rateLimitPerSecond,
            ),

          timezone:
            client.timezone,
        }}
        onSubmit={
          handleSubmit
        }
        onCancel={() =>
          router.push(
            `/clients/${encodeURIComponent(
              client.id,
            )}`,
          )
        }
      />
    </PageContainer>
  );
}

// ============================================================================
// Chevron
// ============================================================================

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