"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

// Keep server HTML and the first hydration render identical. Once hydrated,
// Intl formatters use the browser's timezone rather than the server's timezone.
export function useLocalDateFormatter<Args extends unknown[]>(
  formatter: (...args: Args) => string,
): (...args: Args) => string {
  const hydrated = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  return (...args) => hydrated ? formatter(...args) : "—";
}
