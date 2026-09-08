import {
  findPlatformHealth,
} from "@/features/health/api/server-health-api";

import PlatformHealthClient from "@/features/health/components/platform-health-client";

export default async function HealthPage() {
  const health =
    await findPlatformHealth();

  return (
    <PlatformHealthClient
      initialHealth={health}
    />
  );
}