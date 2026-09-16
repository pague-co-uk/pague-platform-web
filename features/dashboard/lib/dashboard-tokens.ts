export const dashboardColors = {
  ink: "#12181F",
  paper: "#FAFAF7",
  border: "#E4E2D9",
  borderStrong: "#D6D3C7",
  muted: "#8A8778",
  delivered: "#1B7A6B",
  failed: "#B4491F",
  pending: "#A6822F",
  accent: "#1B3A6B",
} as const;

export function statusColor(status: string): string {
  const key = status.toLowerCase();

  if (key.includes("deliver")) return dashboardColors.delivered;
  if (key.includes("fail") || key.includes("reject") || key.includes("undeliver")) {
    return dashboardColors.failed;
  }
  if (key.includes("pend") || key.includes("queue") || key.includes("sent")) {
    return dashboardColors.pending;
  }

  return dashboardColors.muted;
}

export function healthDotColor(secondaryCount: number): string {
  return secondaryCount > 0 ? dashboardColors.pending : dashboardColors.delivered;
}