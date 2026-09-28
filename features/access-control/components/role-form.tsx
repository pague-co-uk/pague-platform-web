"use client";

import {
  useState,
} from "react";

export interface RoleFormValues {
  name: string;
  description: string;
  priority: string;
}

interface RoleFormProps {
  mode: "create";
  onSubmit: (
    values: RoleFormValues,
  ) => Promise<void>;
  onCancel: () => void;
}

export default function RoleForm({
  mode,
  onSubmit,
  onCancel,
}: RoleFormProps) {
  const [name, setName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [priority, setPriority] =
    useState("0");

  const [submitting, setSubmitting] =
    useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit({
        name,
        description,
        priority,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-base font-semibold text-slate-900">
          Role information
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Define the role name, description, and privilege priority.
        </p>
      </div>

      <div className="space-y-6 px-6 py-6">
        <div>
          <label
            htmlFor="role-name"
            className="block text-sm font-medium text-slate-700"
          >
            Name
          </label>

          <input
            id="role-name"
            type="text"
            required
            maxLength={100}
            value={name}
            onChange={(event) =>
              setName(
                event.target.value,
              )
            }
            placeholder="e.g. Client Administrator"
            className="mt-2 block h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label
            htmlFor="role-description"
            className="block text-sm font-medium text-slate-700"
          >
            Description
          </label>

          <textarea
            id="role-description"
            maxLength={500}
            rows={4}
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value,
              )
            }
            placeholder="Describe what this role is intended for."
            className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <p className="mt-1 text-xs text-slate-500">
            Maximum 500 characters.
          </p>
        </div>

        <div>
          <label
            htmlFor="role-priority"
            className="block text-sm font-medium text-slate-700"
          >
            Priority
          </label>

          <input
            id="role-priority"
            type="number"
            required
            min={0}
            max={1000}
            step={1}
            value={priority}
            onChange={(event) =>
              setPriority(
                event.target.value,
              )
            }
            className="mt-2 block h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Higher values represent greater privilege. A user can only
            assign roles at or below their own highest role priority.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
        <button
          type="button"
          disabled={submitting}
          onClick={onCancel}
          className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={
            submitting ||
            !name.trim()
          }
          className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {submitting
            ? "Creating..."
            : mode === "create"
              ? "Create role"
              : "Save role"}
        </button>
      </div>
    </form>
  );
}