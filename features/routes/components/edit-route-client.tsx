"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import type {
  Route as RouteResponse,
  UpdateRouteInput,
} from "@/features/routes/api/routes-api";
import {
  RoutesApiError,
  updateRoute,
} from "@/features/routes/api/routes-api";

interface ClientOption {
  id: string;
  companyName: string;
  displayName: string;
}

interface MobileNetworkOption {
  id: string;
  name: string;
  code: string;
  countryCode: string;
}

interface ConnectorOption {
  id: string;
  name: string;
  code: string;
  provider: string;
  transport: string;
}

interface EditRouteClientProps {
  route: RouteResponse;
  clients: ClientOption[];
  mobileNetworks: MobileNetworkOption[];
  connectors: ConnectorOption[];
}

export default function EditRouteClient({
  route,
  clients,
  mobileNetworks,
  connectors,
}: EditRouteClientProps) {
  const router = useRouter();

  const [clientId, setClientId] = useState(route.clientId);
  const [mobileNetworkId, setMobileNetworkId] = useState(
    route.mobileNetworkId,
  );
  const [connectorId, setConnectorId] = useState(
    route.connectorId,
  );
  const [priority, setPriority] = useState(
    String(route.priority),
  );

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);

    const parsedPriority = Number(priority);

    if (!clientId) {
      setError("Client is required.");
      return;
    }

    if (!mobileNetworkId) {
      setError("Mobile network is required.");
      return;
    }

    if (!connectorId) {
      setError("Connector is required.");
      return;
    }

    if (
      !Number.isInteger(parsedPriority) ||
      parsedPriority < 1
    ) {
      setError(
        "Priority must be a whole number greater than or equal to 1.",
      );
      return;
    }

    const input: UpdateRouteInput = {
      clientId,
      mobileNetworkId,
      connectorId,
      priority: parsedPriority,
    };

    setSubmitting(true);

    try {
      await updateRoute(route.id, input);

      router.push(`/routes/${route.id}`);
      router.refresh();
    } catch (err) {
      if (err instanceof RoutesApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to update route.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-6">
        <Link
          href={`/routes/${route.id}`}
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Back to route
        </Link>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
          Edit Route
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Update the routing configuration for {route.publicId}.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="space-y-6 p-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
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
              type="text"
              value={route.publicId}
              readOnly
              className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm text-slate-600 outline-none"
            />

            <p className="mt-1.5 text-xs text-slate-500">
              The public ID cannot be changed.
            </p>
          </div>

          <div>
            <label
              htmlFor="clientId"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Client
            </label>

            <select
              id="clientId"
              value={clientId}
              onChange={(event) =>
                setClientId(event.target.value)
              }
              required
              disabled={submitting}
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50"
            >
              <option value="">Select a client</option>

              {clients.map((client) => (
                <option
                  key={client.id}
                  value={client.id}
                >
                  {client.companyName}
                  {client.displayName
                    ? ` — ${client.displayName}`
                    : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="mobileNetworkId"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Mobile Network
            </label>

            <select
              id="mobileNetworkId"
              value={mobileNetworkId}
              onChange={(event) =>
                setMobileNetworkId(event.target.value)
              }
              required
              disabled={submitting}
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50"
            >
              <option value="">
                Select a mobile network
              </option>

              {mobileNetworks.map((network) => (
                <option
                  key={network.id}
                  value={network.id}
                >
                  {network.name} ({network.code}) —{" "}
                  {network.countryCode}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="connectorId"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Connector
            </label>

            <select
              id="connectorId"
              value={connectorId}
              onChange={(event) =>
                setConnectorId(event.target.value)
              }
              required
              disabled={submitting}
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50"
            >
              <option value="">Select a connector</option>

              {connectors.map((connector) => (
                <option
                  key={connector.id}
                  value={connector.id}
                >
                  {connector.name} — {connector.provider} (
                  {connector.transport})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="priority"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Priority
            </label>

            <input
              id="priority"
              type="number"
              min={1}
              step={1}
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value)
              }
              required
              disabled={submitting}
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50"
            />

            <p className="mt-1.5 text-xs text-slate-500">
              Lower priority numbers are evaluated first.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <Link
            href={`/routes/${route.id}`}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}