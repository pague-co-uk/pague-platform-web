export function messagePageSize(value?: string | null): number {
  const number = Number(value);
  return Number.isInteger(number) && number >= 1 && number <= 100 ? number : 20;
}

export function messagePageNumber(value?: string | null): number {
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= 1 ? number : 1;
}

export function messageListQuery(query: string, from: string, to: string, size: string): string {
  if (from && to && from > to) throw new Error("Created from must not be later than created to.");
  const count = Number(size);
  if (!Number.isInteger(count) || count < 1 || count > 100) {
    throw new Error("Items per page must be a whole number from 1 to 100.");
  }
  const next = new URLSearchParams(query);
  for (const [key, value] of [["createdFrom", from], ["createdTo", to], ["pageSize", String(count)]]) {
    if (value) next.set(key, value); else next.delete(key);
  }
  next.delete("page");
  return next.toString();
}

/** Inputs use the browser's local timezone; transport uses explicit UTC instants. */
export function dateTimeFilterInstant(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isFinite(+date)) throw new Error("Enter a valid date and time.");
  return date.toISOString();
}
export function dateTimeFilterInput(value: string): string {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return `${value}T00:00`;
  const date = new Date(value);
  if (!Number.isFinite(+date)) return "";
  const pad = (number: number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
