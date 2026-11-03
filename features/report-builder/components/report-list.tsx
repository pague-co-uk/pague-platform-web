"use client";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";

import { useEffect, useState } from "react";
import { Database, FileSpreadsheet, Plus } from "lucide-react";
import { builderApi, button, control, primary } from "../api";
import type { Capabilities, Connection, SavedReport } from "../types";

export function ReportList({ capabilities }: { capabilities: Capabilities }) {
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    Promise.all([
      builderApi<SavedReport[]>("reports"),
      builderApi<Connection[]>("connections"),
    ])
      .then(([r, c]) => {
        if (active) {
          setReports(r);
          setConnections(c);
        }
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
  async function remove(report: SavedReport) {
    if (!window.confirm(`Delete report “${report.name}”?`)) return;
    setBusy(true);
    setError("");
    try {
      await builderApi("reports/" + report.id, "DELETE");
      setReports((current) => current.filter((r) => r.id !== report.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to delete report.");
    } finally {
      setBusy(false);
    }
  }
  const filteredReports = reports.filter(
    (r) => !filter || r.definition.connectionId === filter,
  );
  const columns: DataTableColumn<SavedReport>[] = [
    {
      key: "name",
      header: "Report",
      render: (report) => (
        <Link
          href={"/reports/builder/" + report.id}
          className="font-medium text-slate-900 transition hover:text-blue-600"
        >
          {report.name}
        </Link>
      ),
    },
    {
      key: "database",
      header: "Database",
      render: (report) => (
        <span className="text-sm text-slate-600">
          {connections.find((c) => c.id === report.definition.connectionId)
            ?.name || "Database"}
        </span>
      ),
    },
    {
      key: "columns",
      header: "Columns",
      render: (report) => (
        <span className="text-sm text-slate-600">
          {report.definition.columns.length}
        </span>
      ),
    },
    {
      key: "updated",
      header: "Updated",
      render: (report) => (
        <span className="text-sm text-slate-500">
          {report.updatedAt.slice(0, 10)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (report) => (
        <div className="flex items-center justify-end gap-3">
          <Link
            className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
            href={"/reports/builder/" + report.id}
          >
            Open report
          </Link>
          {capabilities.edit && (
            <button
              disabled={busy}
              className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
              onClick={() => remove(report)}
            >
              Delete
            </button>
          )}
        </div>
      ),
    },
  ];
  return (
    <PageContainer>
      <PageHeader
        title="Report Builder"
        description="Turn connected database data into reusable Excel reports."
      >
        {capabilities.connections && (
          <Link className={button} href="/reports/connections">
            <Database size={16} /> Database connections
          </Link>
        )}
        {capabilities.edit && (
          <Link className={primary} href="/reports/builder/new">
            <Plus size={16} /> Create report
          </Link>
        )}
      </PageHeader>
      {error && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}
      <div className="mt-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="px-1 text-sm font-medium text-slate-700">
          Saved reports
        </h2>
        <select
          aria-label="Filter by database"
          className={control + " w-full sm:w-auto sm:min-w-44"}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All databases</option>
          {connections.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-4">
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
            Loading reports…
          </div>
        ) : filteredReports.length ? (
          <DataTable
            columns={columns}
            rows={filteredReports}
            getRowKey={(report) => report.id}
          />
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white">
            <EmptyState
              icon={<FileSpreadsheet size={24} />}
              title={filter ? "No matching reports" : "No reports yet"}
              description={
                filter
                  ? "There are no saved reports for this database."
                  : connections.length
                    ? "Choose a database and build your first report."
                    : "An administrator needs to configure a database connection first."
              }
            />
          </div>
        )}
      </div>
    </PageContainer>
  );
}
