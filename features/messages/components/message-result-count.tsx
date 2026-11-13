import type { PaginationMeta } from "../api/messages-api";

export function MessageResultCount({
  pagination,
  count,
}: {
  pagination: PaginationMeta;
  count: number;
}) {
  const start = count > 0 ? (pagination.page - 1) * pagination.pageSize + 1 : 0;
  const end = count > 0 ? Math.min(start + count - 1, pagination.total) : 0;
  return (
    <p role="status" className="mt-4 text-xs text-slate-500">
      Showing{" "}
      <span className="font-medium text-slate-700">
        {start.toLocaleString("en-GB")}–{end.toLocaleString("en-GB")}
      </span>{" "}
      of{" "}
      <span className="font-medium text-slate-700">
        {pagination.total.toLocaleString("en-GB")}
      </span>{" "}
      messages
    </p>
  );
}
