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

import ClientForm, {
  ClientFormValues,
} from "@/features/clients/components/client-form";

import {
  createClient,
} from "@/features/clients/api/clients-api";

import {
  useToast,
} from "@/components/ui/toast";

// ============================================================================
// New client
// ============================================================================

export default function NewClientClient() {
  const router =
    useRouter();

  const {
    success,
    error: showError,
  } = useToast();

  // ==========================================================================
  // Create
  // ==========================================================================

  async function handleSubmit(
    values: ClientFormValues,
  ) {
    try {
      await createClient({
        companyName:
          values.companyName.trim(),

        clientCode:
          values.clientCode?.trim() ?? "",

        displayName:
          values.displayName.trim() ||
          undefined,

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
      });

      success(
        "Client created",
        `${values.displayName.trim() || values.companyName.trim()} has been created successfully.`,
      );

      router.push(
        "/clients",
      );
      router.refresh();
    } catch (error) {
      console.error(
        "[Clients] Unable to create client.",
        error,
      );

      showError(
        "Unable to create client",
        error instanceof Error
          ? error.message
          : "Unable to create client.",
      );
    }
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <PageContainer>
      <PageHeader
        title="Create client"
        description="Create a new client and configure its platform access."
      />

      {/* ======================================================================
          Breadcrumb
      ======================================================================= */}

      <div className="mb-5">
        <Link
          href="/clients"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900"
        >
          <ChevronLeftIcon />

          Back to clients
        </Link>
      </div>

      {/* ======================================================================
          Form
      ======================================================================= */}

      <ClientForm
        mode="create"
        onSubmit={
          handleSubmit
        }
        onCancel={() =>
          router.push(
            "/clients",
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