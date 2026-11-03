# Database Report Builder

The report builder is part of the authenticated portal at `/reports/builder`.
Database administration is at `/reports/connections`. It uses the existing
control-plane session, server permission checks, portal shell, and styling.

## Setup

In the `api` project:

1. Install dependencies with `npm ci`.
2. Apply the additive metadata/permission migration with `npx prisma migrate deploy`.
3. Regenerate Prisma with `npx prisma generate`.
4. Configure `REPORT_CONNECTION_KEY` with a persistent 32-byte key encoded as 64 hex
   characters. Generate one with `openssl rand -hex 32`. Keep it outside source control
   and back it up securely: replacing it makes existing credentials unreadable.
5. For SQLite, use Node.js 22.13 or newer and configure `REPORT_SQLITE_ROOT` as an
   absolute directory containing the allowed database files. Paths and symlinks must
   resolve inside this directory. SQLite files are opened read-only in worker threads.
6. Restart the API and web processes. The web app uses its existing
   `CONTROL_PLANE_API_URL`; no additional service is required.

The migration grants all four new permissions to existing `PLATFORM_SUPER_ADMIN`
roles. Other roles require explicit assignment through the existing role editor:

| Permission | Access |
| --- | --- |
| `report-builder.read` | List connections and reports, inspect schema, preview data |
| `report-builder.edit` | Create, update, duplicate, and delete saved reports; also requires read |
| `report-builder.export` | Download XLSX; also requires read |
| `report-builder.connections.manage` | Configure, edit, test, and delete connections; also requires the platform administrator role |

Permission-aware navigation and each API operation enforce access separately.
An authenticated user session is required; API keys do not grant access to the builder.

## Creating a report

1. A platform administrator adds a PostgreSQL, MySQL/MariaDB, or SQLite connection
   and tests it. Use a dedicated source account with SELECT-only access. Network
   connections default to verified TLS.
2. Assign a connection to a client ID or leave it platform-only. **Assignment grants
   authorized report users in that client access to the whole configured schema**.
   For shared source databases, expose client-specific views through a database
   account restricted to those views. There is no automatic row-level client filter
   on external databases.
3. Create a report, choose a connection and table/view, and select fields.
4. Optionally add explicit left/inner joins. Each join connects a previously included
   table to a new table. Self-joins and cross-database joins are not supported.
5. Set headings, column order, aggregates, date grouping, and Excel formats.
   Non-aggregated columns automatically become GROUP BY fields when any aggregate
   is selected. Count counts non-null field values; use a non-null primary key to
   count rows. Date grouping uses the database session's timezone.
6. Add AND filters. List values are comma-separated. Empty means SQL NULL. Parameter
   names expose values that can be changed at run time without editing the definition.
7. Preview up to 100 result rows, save the definition, or download Excel. Opening a
   saved report runs against current source data. Use Save a copy to duplicate it.

## Resource and output limits

- Source databases perform filtering, joins, sorting, and aggregation.
- PostgreSQL cursors, MySQL streams, and SQLite iterators fetch in bounded batches.
- Maximum 100 columns, 5 joins, 30 filters, and 10 sort keys per report.
- Exports stream directly to the browser, with two concurrent exports per API process,
  a 100,000-row cap, 30-second source statement timeout, and a 2-minute overall budget.
  Export details records whether the row cap was reached. Refine filters for larger data.
- SQLite work happens in disposable workers with per-operation timeouts.
- XLSX includes frozen headers, autofilters, formatting, and an export details sheet.
  Formula-like source text remains text. Values exceeding Excel numeric precision stay
  text to preserve their digits. Amount formatting does not choose a currency symbol.
- Definitions and encrypted connections are stored in the platform MySQL database.
  `report_exports` stores actor, connection, status, row count, and timestamps. Files
  are not persisted. Interrupted exports may remain `running` after a process crash.
- There is no scheduler, queue service, or export history UI. Download progress is
  represented by the running state. Large/complex source queries should use views.

## Verification

API: `npm test -- --runInBand src/modules/report-builder` and `npm run build`.
Web: `npx tsc --noEmit` and ESLint on the module and changed routes.
Tests cover real SQLite discovery, aggregate previews, XLSX readability, numeric
precision, bound filter values, joins, date grouping, literal LIKE wildcards,
credential encryption, and client isolation. PostgreSQL/MySQL require an accessible
source database for live connector integration testing.
