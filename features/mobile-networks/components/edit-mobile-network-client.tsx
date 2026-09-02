"use client";

import {
  FormEvent,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  MobileNetworksApiError,
  updateMobileNetwork,
} from "@/features/mobile-networks/api/mobile-networks-api";

import {
  useToast,
} from "@/components/ui/toast";

interface EditMobileNetworkClientProps {
  mobileNetwork: {
    id: string;
    publicId: string;
    name: string;
    code: string;
    countryCode: string;
  };
}

export default function EditMobileNetworkClient({
  mobileNetwork,
}: EditMobileNetworkClientProps) {
  const router = useRouter();

  const {
    success,
    error: showError,
  } = useToast();

  const [name, setName] =
    useState(mobileNetwork.name);

  const [code, setCode] =
    useState(mobileNetwork.code);

  const [countryCode, setCountryCode] =
    useState(
      mobileNetwork.countryCode,
    );

  const [formError, setFormError] =
    useState<string | null>(null);

  const [submitting, setSubmitting] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setFormError(null);

    const trimmedName =
      name.trim();

    const trimmedCode =
      code.trim();

    const normalizedCountryCode =
      countryCode
        .trim()
        .toUpperCase();

    if (!trimmedName) {
      setFormError(
        "Mobile network name is required.",
      );
      return;
    }

    if (!trimmedCode) {
      setFormError(
        "Mobile network code is required.",
      );
      return;
    }

    if (
      normalizedCountryCode.length !== 2
    ) {
      setFormError(
        "Country code must contain exactly two characters.",
      );
      return;
    }

    setSubmitting(true);

    try {
      await updateMobileNetwork(
        mobileNetwork.id,
        {
          name: trimmedName,
          code: trimmedCode,
          countryCode:
            normalizedCountryCode,
        },
      );

      success(
        "Mobile network updated",
        `${trimmedName} was updated successfully.`,
      );

      router.push(
        `/mobile-networks/${mobileNetwork.id}`,
      );

      router.refresh();
    } catch (err) {
      const message =
        err instanceof MobileNetworksApiError
          ? err.message
          : "Unable to update the mobile network.";

      setFormError(message);

      showError(
        "Update failed",
        message,
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl">
      <div className="mb-6">
        <Link
          href={`/mobile-networks/${mobileNetwork.id}`}
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Back to mobile network
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Edit mobile network
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Update the details for{" "}
          {mobileNetwork.name}.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-xl border border-slate-200 bg-white"
      >
        <div className="space-y-6 p-6">
          {formError && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {formError}
            </div>
          )}

          <div>
            <label
              htmlFor="publicId"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Public ID
            </label>

            <input
              id="publicId"
              name="publicId"
              type="text"
              value={mobileNetwork.publicId}
              disabled
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 outline-none"
            />

            <p className="mt-1.5 text-xs text-slate-500">
              The public ID cannot be changed.
            </p>
          </div>

          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value,
                )
              }
              maxLength={100}
              required
              disabled={submitting}
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
          </div>

          <div>
            <label
              htmlFor="code"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Code
            </label>

            <input
              id="code"
              name="code"
              type="text"
              value={code}
              onChange={(event) =>
                setCode(
                  event.target.value,
                )
              }
              maxLength={50}
              required
              disabled={submitting}
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm uppercase text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
          </div>

          <div>
            <label
              htmlFor="countryCode"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Country code
            </label>

            <input
              id="countryCode"
              name="countryCode"
              type="text"
              value={countryCode}
              onChange={(event) =>
                setCountryCode(
                  event.target.value.toUpperCase(),
                )
              }
              maxLength={2}
              minLength={2}
              required
              disabled={submitting}
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm uppercase text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            />

            <p className="mt-1.5 text-xs text-slate-500">
              Use the two-letter ISO country code.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <Link
            href={`/mobile-networks/${mobileNetwork.id}`}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Saving..."
              : "Save changes"}
          </button>
        </div>
      </form>
    </main>
  );
}