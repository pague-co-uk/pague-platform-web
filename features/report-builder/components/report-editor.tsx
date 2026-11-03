"use client";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Download, Eye, Plus, Save, X } from "lucide-react";
import { builderApi, button, control, primary } from "../api";
import type {
  Capabilities,
  Connection,
  Field,
  ReportColumn,
  ReportDefinition,
  ReportFilter,
  SavedReport,
  SchemaTable,
} from "../types";

const empty: ReportDefinition = {
  connectionId: "",
  table: "",
  joins: [],
  columns: [],
  filters: [],
  sort: [],
  sheetName: "Report",
};
const tabs = ["Data", "Columns", "Filters", "Sorting & Excel"] as const;
type Tab = (typeof tabs)[number];
const key = (field: Field) => JSON.stringify([field.table, field.column]);
const fromKey = (value: string): Field => {
  const [table, column] = JSON.parse(value) as string[];
  return { table, column };
};
function FieldSelect({
  value,
  fields,
  onChange,
  label,
}: {
  value: Field;
  fields: Field[];
  onChange: (field: Field) => void;
  label: string;
}) {
  return (
    <select
      aria-label={label}
      className={control + " min-w-0"}
      value={key(value)}
      onChange={(e) => onChange(fromKey(e.target.value))}
    >
      <option value={key({ table: "", column: "" })}>Select field</option>
      {fields.map((f) => (
        <option key={key(f)} value={key(f)}>
          {f.table}.{f.column}
        </option>
      ))}
    </select>
  );
}
export function ReportEditor({
  id,
  capabilities,
}: {
  id?: string;
  capabilities: Capabilities;
}) {
  const router = useRouter();
  const [name, setName] = useState("Untitled report");
  const [definition, setDefinition] = useState<ReportDefinition>(empty);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [schema, setSchema] = useState<SchemaTable[]>([]);
  const [tab, setTab] = useState<Tab>("Data");
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<{
    rows: unknown[][];
    hasMore: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadedSchemaId, setLoadedSchemaId] = useState("");
  const schemaLoading =
    !!definition.connectionId && loadedSchemaId !== definition.connectionId;
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const editable = capabilities.edit;
  useEffect(() => {
    let active = true;
    Promise.all([
      builderApi<Connection[]>("connections"),
      id ? builderApi<SavedReport>("reports/" + id) : Promise.resolve(null),
    ])
      .then(([c, report]) => {
        if (!active) return;
        setConnections(c);
        if (report) {
          setName(report.name);
          setDefinition(report.definition);
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
  }, [id]);
  useEffect(() => {
    if (!definition.connectionId) return;
    let active = true;
    builderApi<SchemaTable[]>(
      "connections/" + definition.connectionId + "/schema",
    )
      .then((s) => {
        if (active) setSchema(s);
      })
      .catch((e) => {
        if (active) {
          setSchema([]);
          setError(e.message);
        }
      })
      .finally(() => {
        if (active) setLoadedSchemaId(definition.connectionId);
      });
    return () => {
      active = false;
    };
  }, [definition.connectionId]);
  function change(patch: Partial<ReportDefinition>) {
    setDefinition((current) => ({ ...current, ...patch }));
    setPreview(null);
    setNotice("");
  }
  const selectedTables = [
    definition.table,
    ...definition.joins.map((j) => j.table),
  ].filter(Boolean);
  const fields = schema
    .filter((t) => selectedTables.includes(t.name))
    .flatMap((t) => t.columns.map((c) => ({ table: t.name, column: c.name })));
  const parameterNames = [
    ...new Set(definition.filters.map((f) => f.parameter).filter(Boolean)),
  ];
  const runParameters = Object.fromEntries(
    parameterNames.map((p) => [
      p,
      parameters[p] ??
        definition.filters.find((f) => f.parameter === p)?.value ??
        "",
    ]),
  );
  function addColumn(field: Field) {
    change({
      columns: [
        ...definition.columns,
        {
          ...field,
          label: field.column,
          aggregate: "",
          bucket: "",
          format: "",
        },
      ],
    });
  }
  function updateColumn(index: number, patch: Partial<ReportColumn>) {
    change({
      columns: definition.columns.map((c, i) =>
        i === index ? { ...c, ...patch } : c,
      ),
    });
  }
  function updateFilter(index: number, patch: Partial<ReportFilter>) {
    change({
      filters: definition.filters.map((f, i) =>
        i === index ? { ...f, ...patch } : f,
      ),
    });
  }
  async function action(label: string, task: () => Promise<void>) {
    setBusy(label);
    setError("");
    setNotice("");
    try {
      await task();
    } catch (e) {
      setError(e instanceof Error ? e.message : "The operation failed.");
    } finally {
      setBusy("");
    }
  }
  async function save(asCopy = false) {
    await action("Saving", async () => {
      const result = await builderApi<{ id: string }>(
        id && !asCopy ? "reports/" + id : "reports",
        id && !asCopy ? "PUT" : "POST",
        { name: asCopy ? name + " (copy)" : name, definition },
      );
      if (!id || asCopy) router.replace("/reports/builder/" + result.id);
      else setNotice("Report saved.");
    });
  }
  async function download() {
    await action("Exporting", async () => {
      const response = await fetch("/api/report-builder/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ definition, parameters: runParameters }),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Export failed.");
      }
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download =
        (name.replace(/[^a-zA-Z0-9_-]/g, "_") || "report") + ".xlsx";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice(
        "Workbook downloaded. Exports include up to 100,000 rows; see the Export details worksheet for limit information.",
      );
    });
  }
  if (loading)
    return (
      <PageContainer>
        <p className="text-sm text-slate-500">Loading report builder…</p>
      </PageContainer>
    );
  return (
    <PageContainer>
      <PageHeader
        title={
          id ? (editable ? "Edit report" : "View report") : "Create report"
        }
        description="Choose your data, shape the results, and export to Excel."
      >
        {editable && id && (
          <button
            className={button}
            disabled={!!busy}
            onClick={() => save(true)}
          >
            Save a copy
          </button>
        )}
        {editable && (
          <button
            className={primary}
            disabled={!!busy || !definition.columns.length || schemaLoading}
            onClick={() => save()}
          >
            <Save size={16} />
            {busy === "Saving" ? "Saving…" : "Save report"}
          </button>
        )}
      </PageHeader>
      <Link
        href="/reports/builder"
        className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-900"
      >
        ← Back to reports
      </Link>
      <div className="space-y-6">
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
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Report details
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Name your report and select the database to use.
            </p>
          </div>
          <div className="p-6">
            <div className="grid gap-x-5 gap-y-6 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Report name
                <input
                  disabled={!editable || !!busy}
                  maxLength={100}
                  className={control}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Database
                <select
                  disabled={!editable || !!busy}
                  className={control}
                  value={definition.connectionId}
                  onChange={(e) => {
                    change({ ...empty, connectionId: e.target.value });
                    setParameters({});
                    setError("");
                  }}
                >
                  <option value="">Choose a database</option>
                  {connections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {!connections.length && (
              <p className="mt-4 text-sm text-slate-500">
                No databases are assigned to your account.{" "}
                {capabilities.connections ? (
                  <Link className="underline" href="/reports/connections">
                    Configure a connection
                  </Link>
                ) : (
                  "Contact your platform administrator."
                )}
              </p>
            )}
          </div>
        </section>
        {definition.connectionId && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <nav
              aria-label="Report configuration"
              className="flex overflow-x-auto border-b border-slate-200"
            >
              {tabs.map((t) => (
                <button
                  key={t}
                  className={
                    "whitespace-nowrap border-b-2 px-5 py-4 text-sm font-medium " +
                    (tab === t
                      ? "border-slate-900 text-slate-900"
                      : "border-transparent text-slate-500 hover:text-slate-900")
                  }
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ))}
            </nav>
            {schemaLoading ? (
              <p className="p-8 text-sm text-slate-500">
                Reading database schema…
              </p>
            ) : (
              <fieldset
                disabled={!editable || !!busy}
                className="space-y-6 p-6"
              >
                {tab === "Data" && (
                  <>
                    <label className="grid max-w-lg gap-1 text-sm font-medium text-slate-700">
                      Starting table or view
                      <select
                        className={control}
                        value={definition.table}
                        onChange={(e) => {
                          change({
                            table: e.target.value,
                            joins: [],
                            columns: [],
                            filters: [],
                            sort: [],
                          });
                        }}
                      >
                        <option value="">Choose table</option>
                        {schema.map((t) => (
                          <option key={t.name} value={t.name}>
                            {t.name} ({t.columns.length} fields)
                          </option>
                        ))}
                      </select>
                    </label>
                    {definition.table && (
                      <>
                        <div className="flex items-center justify-between">
                          <h2 className="font-medium text-slate-900">
                            Related tables
                          </h2>
                          <button
                            type="button"
                            className={button}
                            disabled={
                              definition.joins.length >= 5 ||
                              selectedTables.length >= schema.length
                            }
                            onClick={() => {
                              const next = schema.find(
                                (t) => !selectedTables.includes(t.name),
                              );
                              if (next)
                                change({
                                  joins: [
                                    ...definition.joins,
                                    {
                                      table: next.name,
                                      type: "left",
                                      left: fields[0],
                                      right: {
                                        table: next.name,
                                        column: next.columns[0].name,
                                      },
                                    },
                                  ],
                                });
                            }}
                          >
                            <Plus size={16} /> Add join
                          </button>
                        </div>
                        <p className="text-sm text-amber-700">
                          Joining multiple matching rows can multiply totals.
                          Choose columns that describe the intended
                          relationship.
                        </p>
                        {definition.joins.map((join, index) => {
                          const available = [
                            definition.table,
                            ...definition.joins
                              .slice(0, index)
                              .map((j) => j.table),
                          ];
                          const leftFields = fields.filter((f) =>
                            available.includes(f.table),
                          );
                          const rightFields =
                            schema
                              .find((t) => t.name === join.table)
                              ?.columns.map((c) => ({
                                table: join.table,
                                column: c.name,
                              })) || [];
                          function update(patch: Partial<typeof join>) {
                            change({
                              joins: definition.joins.map((j, i) =>
                                i === index ? { ...j, ...patch } : j,
                              ),
                            });
                          }
                          return (
                            <div
                              key={index}
                              className="flex flex-wrap items-center gap-2 rounded-md bg-slate-50 p-3"
                            >
                              <select
                                aria-label="Join type"
                                className={control}
                                value={join.type}
                                onChange={(e) =>
                                  update({
                                    type: e.target.value as "left" | "inner",
                                  })
                                }
                              >
                                <option value="left">Left join</option>
                                <option value="inner">Inner join</option>
                              </select>
                              <select
                                aria-label="Joined table"
                                className={control}
                                value={join.table}
                                onChange={(e) => {
                                  const table = e.target.value;
                                  change({
                                    joins: [
                                      ...definition.joins.slice(0, index),
                                      {
                                        ...join,
                                        table,
                                        right: {
                                          table,
                                          column: schema.find(
                                            (t) => t.name === table,
                                          )!.columns[0].name,
                                        },
                                      },
                                    ],
                                    columns: definition.columns.filter((c) =>
                                      [
                                        definition.table,
                                        ...definition.joins
                                          .slice(0, index)
                                          .map((j) => j.table),
                                      ].includes(c.table),
                                    ),
                                    filters: definition.filters.filter((f) =>
                                      [
                                        definition.table,
                                        ...definition.joins
                                          .slice(0, index)
                                          .map((j) => j.table),
                                      ].includes(f.table),
                                    ),
                                    sort: [],
                                  });
                                }}
                              >
                                {schema
                                  .filter(
                                    (t) =>
                                      ![
                                        definition.table,
                                        ...definition.joins
                                          .filter((_, i) => i !== index)
                                          .map((j) => j.table),
                                      ].includes(t.name),
                                  )
                                  .map((t) => (
                                    <option value={t.name} key={t.name}>
                                      {t.name}
                                    </option>
                                  ))}
                              </select>
                              <span className="text-sm text-slate-700">on</span>
                              <FieldSelect
                                label="Existing table field"
                                fields={leftFields}
                                value={join.left}
                                onChange={(left) => update({ left })}
                              />
                              <span>=</span>
                              <FieldSelect
                                label="Joined table field"
                                fields={rightFields}
                                value={join.right}
                                onChange={(right) => update({ right })}
                              />
                              <button
                                aria-label="Remove this and following joins"
                                type="button"
                                className={button}
                                onClick={() => {
                                  const removed = definition.joins
                                    .slice(index)
                                    .map((j) => j.table);
                                  change({
                                    joins: definition.joins.slice(0, index),
                                    columns: definition.columns.filter(
                                      (c) => !removed.includes(c.table),
                                    ),
                                    filters: definition.filters.filter(
                                      (f) => !removed.includes(f.table),
                                    ),
                                    sort: [],
                                  });
                                }}
                              >
                                <X size={16} />
                              </button>
                            </div>
                          );
                        })}
                        {definition.joins.length > 0 && (
                          <p className="text-xs text-slate-500">
                            Changing a joined table removes following joins and
                            their selected fields. Join field selectors show the
                            exact relationship.
                          </p>
                        )}
                        <div className="pt-3">
                          <h2 className="font-medium text-slate-900">
                            Available fields
                          </h2>
                          <p className="mt-1 text-sm text-slate-500">
                            Select fields to include. Configure labels and
                            summaries in Columns.
                          </p>
                          <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                            {fields.map((f) => {
                              const selected = definition.columns.some(
                                (c) =>
                                  c.table === f.table && c.column === f.column,
                              );
                              return (
                                <label
                                  key={key(f)}
                                  className="flex items-center gap-2 rounded-md border border-slate-200 p-3 text-sm text-slate-700"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selected}
                                    onChange={(e) => {
                                      if (e.target.checked) addColumn(f);
                                      else
                                        change({
                                          columns: definition.columns.filter(
                                            (c) =>
                                              c.table !== f.table ||
                                              c.column !== f.column,
                                          ),
                                          sort: [],
                                        });
                                    }}
                                  />
                                  <span
                                    className="truncate"
                                    title={f.table + "." + f.column}
                                  >
                                    {f.table}.{f.column}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
                {tab === "Columns" && (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="font-medium text-slate-900">
                          Columns and summaries
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                          When a summary is selected, fields without summaries
                          become grouping fields.
                        </p>
                      </div>
                      <button
                        className={button}
                        disabled={!fields.length}
                        onClick={() => addColumn(fields[0])}
                      >
                        <Plus size={16} /> Add column
                      </button>
                    </div>
                    {!definition.columns.length && (
                      <p className="py-6 text-sm text-slate-500">
                        Select fields in Data or add a column above.
                      </p>
                    )}
                    {definition.columns.map((column, index) => (
                      <div
                        key={index}
                        className="space-y-3 rounded-md border border-slate-200 p-4"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm text-slate-400">
                            {index + 1}.
                          </span>
                          <FieldSelect
                            label="Column field"
                            fields={fields}
                            value={column}
                            onChange={(f) =>
                              updateColumn(index, {
                                ...f,
                                aggregate: "",
                                bucket: "",
                              })
                            }
                          />
                          <input
                            aria-label="Column heading"
                            maxLength={100}
                            className={control}
                            value={column.label}
                            onChange={(e) =>
                              updateColumn(index, { label: e.target.value })
                            }
                          />
                          <button
                            className={button}
                            disabled={index === 0}
                            onClick={() => {
                              const cols = [...definition.columns];
                              [cols[index - 1], cols[index]] = [
                                cols[index],
                                cols[index - 1],
                              ];
                              change({ columns: cols, sort: [] });
                            }}
                          >
                            Move up
                          </button>
                          <button
                            aria-label="Remove column"
                            className={button}
                            onClick={() =>
                              change({
                                columns: definition.columns.filter(
                                  (_, i) => i !== index,
                                ),
                                sort: [],
                              })
                            }
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <label className="grid gap-1 text-xs text-slate-600">
                            Summary
                            <select
                              className={control}
                              value={column.aggregate}
                              onChange={(e) =>
                                updateColumn(index, {
                                  aggregate: e.target
                                    .value as ReportColumn["aggregate"],
                                })
                              }
                            >
                              <option value="">None / group by</option>
                              {[
                                "sum",
                                "count",
                                "distinct",
                                "avg",
                                "min",
                                "max",
                              ].map((a) => (
                                <option key={a} value={a}>
                                  {
                                    {
                                      sum: "Sum",
                                      count: "Count non-empty",
                                      distinct: "Distinct count",
                                      avg: "Average",
                                      min: "Minimum",
                                      max: "Maximum",
                                    }[a]
                                  }
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="grid gap-1 text-xs text-slate-600">
                            Date grouping
                            <select
                              className={control}
                              value={column.bucket}
                              onChange={(e) =>
                                updateColumn(index, {
                                  bucket: e.target
                                    .value as ReportColumn["bucket"],
                                })
                              }
                            >
                              <option value="">Original value</option>
                              <option value="day">Day</option>
                              <option value="month">Month</option>
                              <option value="year">Year</option>
                            </select>
                          </label>
                          <label className="grid gap-1 text-xs text-slate-600">
                            Excel format
                            <select
                              className={control}
                              value={column.format}
                              onChange={(e) =>
                                updateColumn(index, {
                                  format: e.target
                                    .value as ReportColumn["format"],
                                })
                              }
                            >
                              <option value="">Automatic</option>
                              <option value="number">Number</option>
                              <option value="currency">
                                Amount (2 decimals)
                              </option>
                              <option value="date">Date</option>
                            </select>
                          </label>
                        </div>
                      </div>
                    ))}
                  </>
                )}
                {tab === "Filters" && (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-medium text-slate-900">Filters</h2>
                        <p className="mt-1 text-sm text-slate-500">
                          All conditions must match. Name a parameter to change
                          its value each time you run the report.
                        </p>
                      </div>
                      <button
                        className={button}
                        disabled={!fields.length}
                        onClick={() =>
                          change({
                            filters: [
                              ...definition.filters,
                              {
                                ...fields[0],
                                operator: "eq",
                                value: "",
                                parameter: "",
                              },
                            ],
                          })
                        }
                      >
                        <Plus size={16} /> Add filter
                      </button>
                    </div>
                    {!definition.filters.length && (
                      <p className="py-6 text-sm text-slate-500">
                        No filters. All matching source rows are included.
                      </p>
                    )}
                    {definition.filters.map((f, index) => (
                      <div
                        key={index}
                        className="flex flex-wrap items-end gap-3 rounded-md border border-slate-200 p-4"
                      >
                        <label className="grid gap-1 text-xs text-slate-600">
                          Field
                          <FieldSelect
                            label="Filter field"
                            fields={fields}
                            value={f}
                            onChange={(value) => updateFilter(index, value)}
                          />
                        </label>
                        <label className="grid gap-1 text-xs text-slate-600">
                          Condition
                          <select
                            className={control}
                            value={f.operator}
                            onChange={(e) =>
                              updateFilter(index, {
                                operator: e.target
                                  .value as ReportFilter["operator"],
                              })
                            }
                          >
                            {Object.entries({
                              eq: "Equals",
                              ne: "Does not equal",
                              gt: "Greater than",
                              gte: "At least",
                              lt: "Less than",
                              lte: "At most",
                              contains: "Contains",
                              in: "In list (comma separated)",
                              empty: "Is null",
                              not_empty: "Is not null",
                            }).map(([v, l]) => (
                              <option key={v} value={v}>
                                {l}
                              </option>
                            ))}
                          </select>
                        </label>
                        {!["empty", "not_empty"].includes(f.operator) && (
                          <>
                            <label className="grid gap-1 text-xs text-slate-600">
                              Value / default
                              <input
                                className={control}
                                value={f.value}
                                onChange={(e) =>
                                  updateFilter(index, { value: e.target.value })
                                }
                              />
                            </label>
                            <label className="grid gap-1 text-xs text-slate-600">
                              Parameter name (optional)
                              <input
                                className={control}
                                value={f.parameter}
                                onChange={(e) =>
                                  updateFilter(index, {
                                    parameter: e.target.value,
                                  })
                                }
                                placeholder="start_date"
                              />
                            </label>
                          </>
                        )}
                        <button
                          className={button}
                          aria-label="Remove filter"
                          onClick={() =>
                            change({
                              filters: definition.filters.filter(
                                (_, i) => i !== index,
                              ),
                            })
                          }
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </>
                )}
                {tab === "Sorting & Excel" && (
                  <>
                    <div className="flex items-center justify-between">
                      <h2 className="font-medium text-slate-900">Sort order</h2>
                      <button
                        className={button}
                        disabled={!definition.columns.length}
                        onClick={() =>
                          change({
                            sort: [
                              ...definition.sort,
                              { index: 0, direction: "asc" },
                            ],
                          })
                        }
                      >
                        <Plus size={16} /> Add sort
                      </button>
                    </div>
                    {definition.sort.map((sort, index) => (
                      <div key={index} className="flex flex-wrap gap-2">
                        <select
                          className={control}
                          aria-label="Sort column"
                          value={sort.index}
                          onChange={(e) =>
                            change({
                              sort: definition.sort.map((s, i) =>
                                i === index
                                  ? { ...s, index: Number(e.target.value) }
                                  : s,
                              ),
                            })
                          }
                        >
                          {definition.columns.map((c, i) => (
                            <option value={i} key={i}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                        <select
                          className={control}
                          aria-label="Sort direction"
                          value={sort.direction}
                          onChange={(e) =>
                            change({
                              sort: definition.sort.map((s, i) =>
                                i === index
                                  ? {
                                      ...s,
                                      direction: e.target.value as
                                        "asc" | "desc",
                                    }
                                  : s,
                              ),
                            })
                          }
                        >
                          <option value="asc">Ascending</option>
                          <option value="desc">Descending</option>
                        </select>
                        <button
                          aria-label="Remove sort"
                          className={button}
                          onClick={() =>
                            change({
                              sort: definition.sort.filter(
                                (_, i) => i !== index,
                              ),
                            })
                          }
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    <label className="grid max-w-lg gap-1 pt-3 text-sm font-medium text-slate-700">
                      Worksheet name
                      <input
                        maxLength={31}
                        className={control}
                        value={definition.sheetName}
                        onChange={(e) => change({ sheetName: e.target.value })}
                      />
                    </label>
                    <p className="text-sm text-slate-500">
                      Excel includes a frozen header, filter controls, and an
                      Export details worksheet. Exports are limited to 100,000
                      rows.
                    </p>
                  </>
                )}
              </fieldset>
            )}
          </div>
        )}
        {parameterNames.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="font-medium text-slate-900">Run parameters</h2>
            <div className="mt-3 grid gap-4 md:grid-cols-3">
              {parameterNames.map((p) => (
                <label className="grid gap-2 text-sm text-slate-700" key={p}>
                  {p}
                  <input
                    disabled={!!busy}
                    className={control}
                    value={runParameters[p]}
                    onChange={(e) => {
                      setParameters({ ...parameters, [p]: e.target.value });
                      setPreview(null);
                    }}
                  />
                </label>
              ))}
            </div>
          </div>
        )}
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
            <div>
              <h2 className="font-medium text-slate-900">Preview</h2>
              <p className="mt-1 text-xs text-slate-500">
                Shows up to 100 result rows.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                className={button}
                disabled={!!busy || schemaLoading || !definition.columns.length}
                onClick={() =>
                  action("Previewing", async () => {
                    setPreview(
                      await builderApi("preview", "POST", {
                        definition,
                        parameters: runParameters,
                      }),
                    );
                  })
                }
              >
                <Eye size={16} />{" "}
                {busy === "Previewing" ? "Running…" : "Refresh preview"}
              </button>
              {capabilities.export && (
                <button
                  className={primary}
                  disabled={
                    !!busy || schemaLoading || !definition.columns.length
                  }
                  onClick={download}
                >
                  <Download size={16} />{" "}
                  {busy === "Exporting" ? "Exporting…" : "Download Excel"}
                </button>
              )}
            </div>
          </div>
          {preview ? (
            <>
              <div className="max-h-96 overflow-auto">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-slate-50 text-slate-700">
                    <tr>
                      {definition.columns.map((c, i) => (
                        <th
                          className="whitespace-nowrap px-4 py-3 font-medium"
                          key={i}
                        >
                          {c.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {preview.rows.map((row, i) => (
                      <tr key={i}>
                        {row.map((v, j) => (
                          <td
                            className="max-w-sm truncate whitespace-nowrap px-4 py-3 text-slate-600"
                            key={j}
                          >
                            {v === null
                              ? "—"
                              : typeof v === "object"
                                ? JSON.stringify(v)
                                : String(v)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!preview.rows.length && (
                  <p className="p-8 text-center text-slate-500">
                    No rows match these filters.
                  </p>
                )}
              </div>
              <p className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
                {preview.rows.length} rows shown
                {preview.hasMore ? " · More rows available in Excel" : ""}
              </p>
            </>
          ) : (
            <p className="p-10 text-center text-sm text-slate-500">
              Configure your report and refresh the preview to see results.
            </p>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
