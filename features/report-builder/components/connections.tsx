"use client";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";

import { useEffect, useState } from "react";
import { Database, Plus, ShieldCheck } from "lucide-react";
import { builderApi, button, control, primary } from "../api";
import type { Connection, ConnectionSettings, Engine } from "../types";

const defaults: ConnectionSettings = {
  engine: "postgres",
  host: "",
  port: 5432,
  database: "",
  schema: "public",
  username: "",
  tls: true,
};
export function Connections() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState("");
  const [settings, setSettings] = useState(defaults);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    builderApi<Connection[]>("connections/manage")
      .then((c) => {
        if (active) setConnections(c);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  function edit(c?: Connection) {
    setEditing(c?.id || "new");
    setName(c?.name || "");
    setClientId(c?.clientId || "");
    setSettings(c?.settings || defaults);
    setPassword("");
    setError("");
    setNotice("");
  }
  function engine(value: Engine) {
    setSettings({
      ...settings,
      engine: value,
      port: value === "mysql" ? 3306 : 5432,
      schema: value === "postgres" ? "public" : "",
    });
  }
  async function action(task: () => Promise<void>) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await task();
    } catch (e) {
      setError(e instanceof Error ? e.message : "The operation failed.");
    } finally {
      setBusy(false);
    }
  }
  async function save(event: React.FormEvent) {
    event.preventDefault();
    await action(async () => {
      await builderApi(
        editing === "new" ? "connections" : "connections/" + editing,
        editing === "new" ? "POST" : "PUT",
        {
          name,
          clientId: clientId || null,
          settings,
          ...(password || editing === "new" ? { password } : {}),
        },
      );
      setConnections(await builderApi<Connection[]>("connections/manage"));
      setEditing(null);
      setPassword("");
      setNotice("Connection saved. Use Test connection to verify access.");
    });
  }
  return (
    <PageContainer>
      <PageHeader
        title="Database Connections"
        description="Configure read-only sources for custom reports."
      >
        <button disabled={busy} className={primary} onClick={() => edit()}>
          <Plus size={16} /> Add database
        </button>
      </PageHeader>
      <Link
        href="/reports/builder"
        className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-900"
      >
        ← Back to reports
      </Link>
      <div className="space-y-6">
        <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
          <ShieldCheck className="shrink-0" size={20} />
          <p>
            Use a dedicated read-only database account. Assigning a client
            grants its report users access to the entire selected schema. Leave
            the client blank for platform administrators only.
          </p>
        </div>
        {error && (
          <div
            role="alert"
            className="rounded-md bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}
        {notice && (
          <div
            role="status"
            className="rounded-md bg-green-50 p-4 text-sm text-green-700"
          >
            {notice}
          </div>
        )}
        {editing && (
          <form
            onSubmit={save}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white"
          >
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-sm font-semibold text-slate-900">
                {editing === "new" ? "Add database" : "Edit connection"}
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Enter connection details and configure access for reporting.
              </p>
            </div>
            <fieldset
              disabled={busy}
              className="grid gap-x-5 gap-y-6 p-6 md:grid-cols-2"
            >
              <label className="grid gap-2 text-sm text-slate-700">
                Connection name
                <input
                  required
                  maxLength={100}
                  className={control}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Production reporting"
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-700">
                Database type
                <select
                  className={control}
                  value={settings.engine}
                  onChange={(e) => engine(e.target.value as Engine)}
                >
                  <option value="postgres">PostgreSQL</option>
                  <option value="mysql">MySQL / MariaDB</option>
                  <option value="sqlite">SQLite</option>
                </select>
              </label>
              {settings.engine !== "sqlite" && (
                <>
                  <label className="grid gap-2 text-sm text-slate-700">
                    Host
                    <input
                      required
                      className={control}
                      value={settings.host}
                      onChange={(e) =>
                        setSettings({ ...settings, host: e.target.value })
                      }
                    />
                  </label>
                  <label className="grid gap-2 text-sm text-slate-700">
                    Port
                    <input
                      type="number"
                      required
                      min={1}
                      max={65535}
                      className={control}
                      value={settings.port}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          port: Number(e.target.value),
                        })
                      }
                    />
                  </label>
                </>
              )}
              <label className="grid gap-2 text-sm text-slate-700">
                {settings.engine === "sqlite"
                  ? "File path relative to REPORT_SQLITE_ROOT"
                  : "Database name"}
                <input
                  required
                  className={control}
                  value={settings.database}
                  onChange={(e) =>
                    setSettings({ ...settings, database: e.target.value })
                  }
                />
              </label>
              {settings.engine === "postgres" && (
                <label className="grid gap-2 text-sm text-slate-700">
                  Schema
                  <input
                    required
                    className={control}
                    value={settings.schema}
                    onChange={(e) =>
                      setSettings({ ...settings, schema: e.target.value })
                    }
                  />
                </label>
              )}
              {settings.engine !== "sqlite" && (
                <>
                  <label className="grid gap-2 text-sm text-slate-700">
                    Username
                    <input
                      required
                      autoComplete="off"
                      className={control}
                      value={settings.username}
                      onChange={(e) =>
                        setSettings({ ...settings, username: e.target.value })
                      }
                    />
                  </label>
                  <label className="grid gap-2 text-sm text-slate-700">
                    Password
                    <input
                      type="password"
                      autoComplete="new-password"
                      className={control}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={
                        editing === "new"
                          ? "Database password"
                          : "Leave blank to keep current password"
                      }
                    />
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={settings.tls}
                      onChange={(e) =>
                        setSettings({ ...settings, tls: e.target.checked })
                      }
                    />{" "}
                    Use TLS with certificate verification
                  </label>
                </>
              )}
              <label className="grid gap-2 text-sm text-slate-700">
                Assigned client ID (optional)
                <input
                  maxLength={36}
                  className={control}
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="Leave blank for platform-only access"
                />
              </label>
            </fieldset>
            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
              <button disabled={busy} className={primary} type="submit">
                {busy ? "Saving…" : "Save connection"}
              </button>
              <button
                disabled={busy}
                className={button}
                type="button"
                onClick={() => {
                  setEditing(null);
                  setPassword("");
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {loading ? (
            <p className="p-8 text-sm text-slate-500">Loading connections…</p>
          ) : !connections.length ? (
            <div className="p-12 text-center">
              <Database size={32} className="mx-auto text-slate-400" />
              <p className="mt-4 text-sm text-slate-600">
                Add a database to start building reports.
              </p>
            </div>
          ) : (
            connections.map((c) => (
              <div
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-4 p-5"
              >
                <div>
                  <h2 className="font-medium text-slate-900">{c.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {c.settings?.engine} · {c.settings?.database} ·{" "}
                    {c.clientId
                      ? "Client: " + c.clientId
                      : "Platform administrators only"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    disabled={busy}
                    className={button}
                    onClick={() =>
                      action(async () => {
                        const result = await builderApi<{ tables: number }>(
                          "connections/" + c.id + "/test",
                          "POST",
                        );
                        setNotice(
                          `${c.name}: connected successfully. ${result.tables} tables and views available.`,
                        );
                      })
                    }
                  >
                    Test connection
                  </button>
                  <button
                    disabled={busy}
                    className={button}
                    onClick={() => edit(c)}
                  >
                    Edit
                  </button>
                  <button
                    disabled={busy}
                    className="text-sm text-red-600"
                    onClick={() => {
                      if (window.confirm(`Delete connection “${c.name}”?`))
                        void action(async () => {
                          await builderApi("connections/" + c.id, "DELETE");
                          setConnections((current) =>
                            current.filter((item) => item.id !== c.id),
                          );
                          setNotice("Connection deleted.");
                        });
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </PageContainer>
  );
}
