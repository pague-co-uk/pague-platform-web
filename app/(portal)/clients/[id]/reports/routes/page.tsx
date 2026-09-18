import { RoutePerformanceReport } from "@/features/reports/components/route-performance-report";

type RoutePerformanceReportPageProps = {
  readonly params: Promise<{
    id: string;
  }>;
};

export default async function RoutePerformanceReportPage({
  params,
}: RoutePerformanceReportPageProps) {
  const { id } = await params;

  return <RoutePerformanceReport clientId={id} />;
}